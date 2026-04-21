import { createClient } from '@supabase/supabase-js'

const env = (import.meta as any).env

/** URL del proyecto (misma que en el dashboard de Supabase). */
export const supabaseUrl: string = env.VITE_SUPABASE_URL

/**
 * Clave pública (anon / publishable). Se usa en el cliente y para invocar Edge Functions.
 * Acepta VITE_SUPABASE_PUBLISHABLE_KEY o, como respaldo, VITE_SUPABASE_ANON_KEY.
 */
export const supabaseAnonKey: string =
  env.VITE_SUPABASE_PUBLISHABLE_KEY ?? env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Faltan credenciales de Supabase: define VITE_SUPABASE_URL y VITE_SUPABASE_PUBLISHABLE_KEY (o VITE_SUPABASE_ANON_KEY)'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

const viteEnv = (import.meta as unknown as { env: Record<string, string | boolean | undefined> }).env
const envFlags = {
  DEV: Boolean(viteEnv.DEV),
  VITE_CHAT_DIRECT: viteEnv.VITE_CHAT_DIRECT,
}

const directChatEdgeFunctionUrl = `${supabaseUrl.replace(/\/$/, '')}/functions/v1/chat`

/**
 * Orden de URLs para el POST a la edge function `chat`.
 * En desarrollo se intenta primero el proxy de Vite; si falla la red, se reintenta la URL directa a Supabase.
 * Con `VITE_CHAT_DIRECT=1` solo se usa la URL directa.
 */
function getChatEdgeFunctionUrls(): string[] {
  if (envFlags.DEV && envFlags.VITE_CHAT_DIRECT !== '1' && envFlags.VITE_CHAT_DIRECT !== 'true') {
    return ['/__supabase-functions/chat', directChatEdgeFunctionUrl]
  }
  return [directChatEdgeFunctionUrl]
}

function isNetworkFailure(e: unknown): boolean {
  const msg = e instanceof Error ? e.message : String(e)
  return (
    msg === 'Failed to fetch' ||
    msg.includes('NetworkError') ||
    msg.includes('Load failed') ||
    (e instanceof TypeError && msg.toLowerCase().includes('fetch'))
  )
}

/**
 * POST a la edge function `chat` con fetch nativo (no `supabase.functions.invoke`).
 * El cliente de Supabase envuelve todas las peticiones en `fetchWithAuth`, que hace
 * `await auth.getSession()` antes de cada fetch; en algunos entornos eso falla y produce
 * FunctionsFetchError sin llegar a la red.
 */
export async function postChatEdgeFunction(
  body: {
    message: string
    history: Array<{ role: string; content: string }>
    model: string
  },
  timeoutMs: number
): Promise<unknown> {
  const urls = getChatEdgeFunctionUrls()

  const postOnce = async (url: string): Promise<unknown> => {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeoutMs)
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${supabaseAnonKey}`,
          apikey: supabaseAnonKey,
        },
        body: JSON.stringify(body),
        signal: controller.signal,
        cache: 'no-store',
      })

      const text = await res.text()

      if (!res.ok) {
        let detail = text
        try {
          const j = JSON.parse(text) as Record<string, unknown>
          const err =
            j.error ?? j.message ?? j.msg ?? j.details
          if (typeof err === 'string') detail = err
          else if (err != null && typeof err === 'object' && 'message' in err) {
            const m = (err as { message?: unknown }).message
            if (typeof m === 'string') detail = m
          }
        } catch {
          /* usar text */
        }
        throw new Error(`Chat ${res.status}: ${detail.slice(0, 800)}`)
      }

      if (!text.trim()) {
        throw new Error('Respuesta vacía del servidor (chat)')
      }

      try {
        return JSON.parse(text) as unknown
      } catch {
        return text
      }
    } finally {
      clearTimeout(timer)
    }
  }

  for (let i = 0; i < urls.length; i++) {
    const url = urls[i]!
    try {
      return await postOnce(url)
    } catch (e: unknown) {
      if (e instanceof Error && e.name === 'AbortError') {
        throw new Error('Tiempo de espera agotado al contactar el chat.')
      }

      if (isNetworkFailure(e)) {
        const canRetry = i < urls.length - 1
        if (canRetry && envFlags.DEV) {
          console.warn(
            '[chat] Fallo de red con el proxy de Vite; reintentando con la URL directa de Supabase…'
          )
          continue
        }

        const msg = e instanceof Error ? e.message : String(e)
        const hint =
          envFlags.DEV && envFlags.VITE_CHAT_DIRECT === '1'
            ? ' Estás usando URL directa a Supabase (VITE_CHAT_DIRECT). Prueba sin esa variable para usar el proxy de Vite.'
            : envFlags.DEV
              ? ' Si persiste: prueba sin extensiones, otra red, o pon VITE_CHAT_DIRECT=1 en .env para forzar URL directa y ver el error en pestaña Red.'
              : ' Comprueba que el dominio del sitio pueda llamar a Supabase (CSP connect-src, firewall). Variables VITE_SUPABASE_* correctas en el hosting.'

        throw new Error(
          `Red: no se pudo conectar con la función chat (${msg}).${hint}`
        )
      }

      throw e
    }
  }
}

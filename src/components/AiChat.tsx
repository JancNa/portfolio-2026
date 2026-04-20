import { useState, useRef, useEffect } from "react";
import { Send, User, Bot, X, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence, type Variants } from "motion/react";
import { cn } from "../lib/utils";
import ReactMarkdown from "react-markdown";
import { ContactForm } from "./ContactForm";
import { ProjectCard } from "./ProjectCard";
import { supabase, postChatEdgeFunction } from "../lib/supabase";

// --- Tipos ---
type Message = {
  id: string;
  role: "user" | "model";
  text: string;
  type?: 'text' | 'projects' | 'contact' | 'project_detail' | 'component';
  component?: 'contact';
  items?: any[];
  item?: any;
  form?: any;
  project?: any;
  modelUsed?: string;
};

// --- Helpers de comunicación ---
const CHAT_FN_TIMEOUT_MS = 120_000

/** Acepta el JSON plano de la edge function o envoltorios / tipos sueltos en `message`. */
function normalizeChatPayload(data: unknown): Record<string, unknown> {
  if (data == null) {
    throw new Error("Respuesta vacía del servidor (chat)")
  }

  if (typeof data === "string") {
    return { message: data, type: "text" }
  }

  let payload = data as Record<string, unknown>

  const unwrap = (p: Record<string, unknown>): Record<string, unknown> | null => {
    const inner = p.data ?? p.result ?? p.payload
    if (inner && typeof inner === "object") {
      const m = (inner as Record<string, unknown>).message
      if (m !== undefined && m !== null) return inner as Record<string, unknown>
    }
    return null
  }
  if (typeof payload.message === "undefined") {
    const u = unwrap(payload)
    if (u) payload = u
  }

  if (typeof payload.error === "string" && !payload.message) {
    throw new Error(payload.error)
  }

  const raw = payload.message
  let message: string | undefined
  if (typeof raw === "string") {
    message = raw
  } else if (raw != null && (typeof raw === "number" || typeof raw === "boolean")) {
    message = String(raw)
  } else if (raw != null && typeof raw === "object") {
    message = JSON.stringify(raw)
  }

  if (!message || !message.trim()) {
    throw new Error(
      "La respuesta del asistente no incluye un mensaje usable (campo message)"
    )
  }

  return { ...payload, message }
}

const sendChatMessage = async (
  userMessage: string,
  conversationHistory: Array<{ role: string; content: string }> = [],
  model: string = "default"
) => {
  const raw = await postChatEdgeFunction(
    {
      message: userMessage,
      history: conversationHistory.slice(-6),
      model
    },
    CHAT_FN_TIMEOUT_MS
  )
  return normalizeChatPayload(raw)
}

const updateHistory = (
  currentHistory: Array<{ role: string; content: string }>,
  userMessage: string,
  assistantResponse: { message: string }
) => {
  return [
    ...currentHistory,
    { role: "user", content: userMessage },
    { role: "assistant", content: assistantResponse.message }
  ].slice(-6)
}

const QUICK_PROMPTS = [
  "¿Qué hace Jorge?",
  "Ver experiencia",
  "Ver proyectos",
  "Descargar CV",
  "¿Cómo usa AI?",
  "¿Está disponible?",
  "Contactar"
];

const boxVariants: Variants = {
  hidden: { clipPath: "inset(49.5% 50% 49.5% 50% round 16px)", opacity: 0 },
  visible: { 
    clipPath: [
      "inset(49.5% 50% 49.5% 50% round 16px)", 
      "inset(49.5% 0% 49.5% 0% round 16px)", 
      "inset(-50px -50px -50px -50px round 16px)"
    ],
    opacity: [0, 1, 1],
    transition: {
      clipPath: { times: [0, 0.6, 1], duration: 2.6, delay: 0.5, ease: "easeInOut" },
      opacity: { duration: 1.2, delay: 0.5, ease: "easeInOut" }
    }
  },
  idle: { clipPath: "inset(-50px -50px -50px -50px round 16px)", opacity: 1, transition: { duration: 0.5, ease: "easeInOut" } },
  expanded: { clipPath: "inset(-50px -50px -50px -50px round 16px)", opacity: 1, transition: { duration: 0.5, ease: "easeInOut" } }
};

const borderVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { delay: 2.9, duration: 1.2, ease: "easeInOut" } },
  idle: { opacity: 1 },
  expanded: { opacity: 1 }
};

const contentVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { delay: 3.1, duration: 1.0, ease: "easeInOut" } },
  idle: { opacity: 1 },
  expanded: { opacity: 1 }
};

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 3.6 } },
  idle: { opacity: 1 },
  expanded: { opacity: 1 }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
  idle: { opacity: 1, y: 0 },
  expanded: { opacity: 1, y: 0 }
};

interface AiChatProps {
  isExpanded?: boolean;
  onChatStart?: () => void;
  onChatClose?: () => void;
}

// --- Componentes Internos ---
function ProjectCarousel({ items }: { items: any[] }) {
  const carouselRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const { scrollLeft, clientWidth } = carouselRef.current;
      const scrollAmount = clientWidth * 0.7;
      const scrollTo = direction === 'left' 
        ? scrollLeft - scrollAmount 
        : scrollLeft + scrollAmount;
      
      carouselRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative group/carousel w-full">
      <button 
        onClick={() => scroll('left')}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-background/90 border border-border shadow-lg flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-all -ml-2 hover:bg-accent hover:text-white hover:scale-110 active:scale-95"
        aria-label="Anterior"
      >
        <ChevronLeft size={16} />
      </button>
      
      <div 
        ref={carouselRef}
        className="flex gap-4 mt-2 overflow-x-auto pb-4 scrollbar-hide snap-x touch-pan-x -mx-1 px-1 w-full items-stretch"
      >
        {items.map((p: any) => (
          <div key={p.slug} className="min-w-[212px] md:min-w-[246px] max-w-[212px] md:max-w-[246px] snap-start flex">
            <ProjectCard
              title={p.title}
              description={p.subtitle}
              image={p.cover_url}
              link={`/cases/${p.slug}`}
              tags={p.tags}
              className="mt-3 ml-0"
            />
          </div>
        ))}
      </div>

      <button 
        onClick={() => scroll('right')}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-background/90 border border-border shadow-lg flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-all -mr-2 hover:bg-accent hover:text-white hover:scale-110 active:scale-95"
        aria-label="Siguiente"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}

export function AiChat({ isExpanded, onChatStart, onChatClose }: AiChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [history, setHistory] = useState<Array<{ role: string; content: string }>>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [lastClickedPrompt, setLastClickedPrompt] = useState<string | null>(null);
  const [playSpin, setPlaySpin] = useState(false);
  const [isIntroDone, setIsIntroDone] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const startTimer = setTimeout(() => {
      setPlaySpin(true);
      setIsIntroDone(true);
    }, 4000); 
    const stopTimer = setTimeout(() => setPlaySpin(false), 10500); 
    return () => {
      clearTimeout(startTimer);
      clearTimeout(stopTimer);
    };
  }, []);
  
  const animateState = isExpanded ? "expanded" : (isIntroDone ? "idle" : "visible");

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth"
      });
    }
  }, [messages, isLoading]);

  const addAssistantBubble = (text: string, data?: any, modelUsed?: string) => {
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      role: 'model',
      text,
      ...data,
      modelUsed
    }]);
  }

  const handleChatResponse = async (data: any, userMessage: string) => {
    if (data.type === "contact" && data.component === "contact.tsx") {
      // Regla de UX: no duplicar el componente de contacto si ya existe
      const hasContactForm = messages.some(m => m.role === 'model' && m.type === 'component' && m.component === 'contact');
      
      if (!hasContactForm) {
        addAssistantBubble(data.message, {
          type: 'component',
          component: 'contact'
        }, data.model_used);
      } else {
        // Si ya existe, solo añadimos el mensaje de texto para no saturar con forms
        addAssistantBubble(data.message, { type: 'text' }, data.model_used);
      }
      
      setHistory(prev => updateHistory(prev, userMessage, data));
      return;
    }

    addAssistantBubble(data.message, data, data.model_used);

    if (data.type === "projects" && data.frontend_action?.action === "query_projects") {
        let query = supabase
        .from("portfolio_projects")
        .select(`id, slug, title, subtitle, description, category, tags, cover_url, sort_order`)
        .eq("visible", true)
        .order("sort_order", { ascending: true })

        const category = data.frontend_action?.filters?.category

        if (category) {
            query = query.eq("category", category)
        }

        const { data: projects, error } = await query
        if (error) console.error("Error loading projects:", error)
        else {
            setMessages(prev => prev.map(msg => msg.text === data.message ? {...msg, items: projects} : msg))
        }
    }
    
    if (data.type === "project_detail" && data.item_identifier?.slug) {
        const { data: project } = await supabase
        .from("portfolio_projects")
        .select("*")
        .eq("slug", data.item_identifier.slug)
        .single()
        
        if (project) {
            setMessages(prev => prev.map(msg => msg.text === data.message ? {...msg, item: project} : msg))
        }
    }
    
    setHistory(prev => updateHistory(prev, userMessage, data));
  }
  
  const handleSend = async (messageText: string = input) => {
    if (!messageText.trim() && !input.trim()) return;
    
    if (QUICK_PROMPTS.includes(messageText)) setLastClickedPrompt(messageText);
    
    if (!isExpanded) onChatStart?.();
    
    const textToSend = messageText || input;
    if (!textToSend.trim() || isLoading) return;

    setMessages((prev) => [...prev, { id: Date.now().toString(), role: "user", text: textToSend }]);
    setInput("");
    setIsLoading(true);

    try {
        const data = await sendChatMessage(textToSend, history, "default");
        await handleChatResponse(data, textToSend);
    } catch (err: unknown) {
        console.error("Error sending message:", err);
        const hint = err instanceof Error ? err.message : String(err);
        const isDev = Boolean((import.meta as { env?: { DEV?: boolean } }).env?.DEV);
        addAssistantBubble(
          isDev
            ? `No se pudo completar el chat: ${hint}`
            : "Hubo un error al procesar tu mensaje. Intenta de nuevo."
        );
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <motion.div 
      layout
      transition={{ layout: { duration: 1.5, ease: [0.22, 1, 0.36, 1] } }}
      className={cn(
        "w-full mx-auto",
        isExpanded 
          ? "h-full w-full bg-transparent border-t border-transparent shadow-none flex flex-col" 
          : "h-auto max-w-3xl bg-transparent"
      )}
    >
      <AnimatePresence>
        {isExpanded && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -20, transition: { duration: 0.8 } }}
            transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
            className="px-6 py-4 border-b border-border/50 bg-transparent flex items-center justify-center z-10 shrink-0"
          >
            <div className="w-[90%] flex items-center justify-between relative">
              <div className="flex items-center gap-3 invisible"><div className="w-3 h-3" /></div>
              <div className="absolute left-1/2 -translate-x-1/2 pointer-events-none">
                <span className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground/60 font-bold whitespace-nowrap">
                  Jorge Naranjo
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isExpanded && (
          <motion.div 
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.8 } }}
            transition={{ delay: 0.7, duration: 0.8 }}
            ref={scrollRef} 
            className="flex-1 overflow-y-auto w-full scroll-smooth min-h-0 relative flex flex-col"
          >
            <div className="w-[90%] mx-auto py-6 px-0 space-y-8 flex-1 flex flex-col justify-end">
              <div className="flex-1" /> 
              <AnimatePresence>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      "flex items-start gap-4",
                      message.role === "user" ? "ml-auto flex-row-reverse max-w-[85%]" : "max-w-[95%]"
                    )}
                  >
                    <div className={cn(
                      "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-1 avatar-gradient-border shadow-sm",
                      "bg-white dark:bg-black"
                    )}>
                      {message.role === "user" ? <User size={14} className="text-foreground" /> : <Bot size={14} className="text-foreground" />}
                    </div>
                    <div className={cn(
                      "px-5 py-3 text-base leading-relaxed tracking-tight max-w-full",
                      message.role === "user" 
                        ? "user-chat-bubble shadow-sm" 
                        : "bg-background/40 backdrop-blur-md rounded-2xl rounded-tl-sm border border-border/50 shadow-sm flex flex-col gap-4 pb-2"
                    )}>
                      {message.text && (
                        <div className="break-words prose prose-sm dark:prose-invert max-w-none py-3 px-1 -mx-1 my-0">
                          <ReactMarkdown
                            components={{
                              a: ({ ...props }) => (
                                <a
                                  {...props}
                                  className="text-accent underline hover:text-accent/80 transition-colors font-medium"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                />
                              ),
                              p: ({ ...props }) => <p {...props} className="m-0 mb-2 last:mb-0" />,
                              ul: ({ ...props }) => <ul {...props} className="list-disc pl-5 my-2 space-y-1 brand-bullets marker:text-foreground/90" />,
                              ol: ({ ...props }) => <ol {...props} className="list-decimal pl-5 my-2 space-y-1 brand-bullets marker:text-foreground/90" />,
                              li: ({ ...props }) => <li {...props} className="pl-0 mt-0" />,
                            }}
                          >
                            {message.text}
                          </ReactMarkdown>
                        </div>
                      )}
                      {message.type === 'projects' && message.items && (
                        <div className="mt-0">
                          <ProjectCarousel items={message.items} />
                        </div>
                      )}
                      {message.type === 'component' && message.component === 'contact' && (
                        <div className="mt-2 w-full">
                          <ContactForm />
                        </div>
                      )}
                      {message.modelUsed && (
                        <div className="text-[10px] text-muted-foreground/60 font-mono mt-1 pt-2 border-t border-border/20">
                          Respuesta generada por: {message.modelUsed}
                        </div>
                      )}
                      {message.form && (
                        <ContactForm 
                          initialEmail={message.form.email} 
                          initialMessage={message.form.message} 
                        />
                      )}
                      {(message.project || message.item) && (
                        <div className="max-h-[600px] mt-0 pt-0 pb-2 h-full">
                          <ProjectCard 
                              title={message.project?.title || message.item.title}
                              description={message.project?.description || message.item.subtitle}
                              image={message.project?.image || message.item.cover_url}
                              link={message.project?.link || `/cases/${message.item?.slug}`}
                              className="mt-3"
                          />
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-start gap-4 max-w-[95%]"
                  >
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white dark:bg-black avatar-gradient-border flex items-center justify-center mt-1 shadow-sm relative overflow-visible">
                      <div className="ai-loader-spinner"><div className="ai-loader-spinner-in"></div></div>
                      <Bot size={14} className="text-foreground" />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {isExpanded && !isInputFocused && !input.trim() && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                    animate={{ opacity: 1, height: "auto", marginTop: 16 }}
                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                    className="z-[100] relative w-full"
                  >
                    <div className="flex flex-wrap items-center justify-center gap-2 pb-2">
                      {QUICK_PROMPTS.filter(p => p !== lastClickedPrompt).map((prompt) => (
                        <motion.button
                          key={prompt}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleSend(prompt)}
                          disabled={isLoading}
                          className="cursor-pointer disabled:cursor-not-allowed text-[0.75rem] px-3.5 py-2 glass-panel bg-background/95 backdrop-blur-xl hover:bg-muted text-muted-foreground hover:text-foreground rounded-full transition-colors select-none whitespace-nowrap shadow-xl border border-border/50"
                        >
                          {prompt}
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div 
        layout
        transition={{ layout: { duration: 1.5, ease: [0.22, 1, 0.36, 1] } }}
        className={cn("w-full relative", isExpanded ? "border-t border-border/50 bg-transparent z-10 shrink-0 flex flex-col items-center pt-2 pb-6 px-6 justify-center" : "border-t border-transparent px-4")}
      >
        <motion.div 
          layout
          transition={{ layout: { duration: 1.5, ease: [0.22, 1, 0.36, 1] } }}
          variants={boxVariants}
          initial={!isExpanded ? "hidden" : "expanded"}
          animate={animateState}
          className={cn("ur-poda mx-auto shadow-2xl group", isExpanded ? "w-[90%]" : "max-w-3xl w-full")}
        >
          <motion.div 
            variants={borderVariants}
            initial={!isExpanded ? "hidden" : "expanded"}
            animate={animateState}
            className={cn("absolute inset-0 z-[-1] rounded-[inherit] pointer-events-none", playSpin && "play-intro-spin")}
          >
            <div className="ur-glow"></div>
            <div className="ur-darkBorderBg"></div>
            <div className="ur-white"></div>
            <div className="ur-border"></div>
          </motion.div>
          
          <div className="ur-main relative w-full min-h-[60px] flex items-center bg-background backdrop-blur-md">
            <motion.div 
              variants={contentVariants}
              initial={!isExpanded ? "hidden" : "expanded"}
              animate={animateState}
              className="w-full flex items-center relative min-h-[60px]"
            >
              <textarea
                rows={1}
                className={cn(
                  "w-full bg-transparent focus:outline-none transition-all text-foreground resize-none pl-6 pr-[64px] py-[18px] max-h-[160px] scrollbar-hide block leading-relaxed placeholder:text-muted-foreground/70 placeholder:transition-colors",
                  isExpanded ? "text-sm" : "text-base"
                )}
                placeholder="Pregúntale a la AI de Jorge..."
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  e.target.style.height = "auto";
                  e.target.style.height = `${e.target.scrollHeight}px`;
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    e.currentTarget.style.height = "auto";
                    handleSend();
                  }
                }}
                onFocus={() => {
                  setIsInputFocused(true);
                  if (messages.length > 0 && !isExpanded) onChatStart?.();
                }}
                onBlur={() => setIsInputFocused(false)}
                disabled={isLoading}
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || isLoading}
                className={cn(
                  "cursor-pointer disabled:cursor-not-allowed absolute top-1/2 -translate-y-1/2 right-2 flex items-center justify-center bg-gradient-to-br from-[#a855f7] to-[#ea580c] text-white rounded-[8px] hover:scale-105 disabled:opacity-40 disabled:hover:scale-100 transition-all shadow-md",
                  isExpanded ? "w-10 h-10" : "w-[44px] h-[44px]"
                )}
              >
                <Send size={18} />
              </button>
            </motion.div>
          </div>
        </motion.div>
        {!isExpanded && (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate={animateState}
            className="flex flex-wrap items-center justify-center gap-2 mt-6 max-w-2xl mx-auto transition-all duration-500"
          >
            {QUICK_PROMPTS.map((prompt, i) => (
              <motion.button
                key={i}
                variants={itemVariants}
                onClick={() => handleSend(prompt)}
                disabled={isLoading}
                className="cursor-pointer disabled:cursor-not-allowed text-[0.75rem] px-3.5 py-2 glass-panel hover:bg-muted text-muted-foreground hover:text-foreground rounded-full transition-colors select-none whitespace-nowrap"
              >
                {prompt}
              </motion.button>
            ))}
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}

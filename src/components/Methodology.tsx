import { motion } from "motion/react";

export function Methodology() {
  return (
    <section id="metodología" className="py-24 border-t border-border">
      <div className="container mx-auto px-6">
        <div className="mb-16">
          <h2 className="text-4xl md:text-5xl font-serif max-w-2xl mb-6 leading-tight">
            Mi forma de pensar: Negocio, Sistemas y Ejecución.
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl font-light">
            No sigo el Double Diamond ciegamente. Me adapto al contexto real, a la presión del mercado y a los recursos disponibles, optimizando la toma de decisiones.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-border">
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="bg-background p-8 md:p-12 lg:p-16 flex flex-col"
          >
            <h3 className="text-xl font-medium font-serif mb-4 text-accent">Entender la Maquinaria</h3>
            <p className="text-muted-foreground leading-relaxed text-sm">
              Antes de dibujar una línea, mapeo el modelo operativo. ¿Cómo gana dinero la empresa? ¿Cuáles son las limitaciones técnicas? ¿Qué KPI estamos tratando de mover? Sin contexto comercial, el diseño es decoración caprichosa.
            </p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="bg-background p-8 md:p-12 lg:p-16 flex flex-col"
          >
            <h3 className="text-xl font-medium font-serif mb-4 text-accent">Restricciones como Ventaja</h3>
            <p className="text-muted-foreground leading-relaxed text-sm">
              Me siento más cómodo rodeado de ingenieros y PMs debatiendo APIs que encerrado en Figma. Uso el entendimiento técnico para proponer soluciones realistas que pueden ser iteradas y escaladas mañana.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="bg-background p-8 md:p-12 lg:p-16 flex flex-col"
          >
            <h3 className="text-xl font-medium font-serif mb-4 text-accent">Reducción de Complejidad</h3>
            <p className="text-muted-foreground leading-relaxed text-sm">
              Mi mayor fortaleza es tomar un sistema desordenado, lleno de silos y procesos rotos, y destilarlo en una experiencia de usuario obvia, intuitiva y limpia, ocultando el caos de backend.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="bg-background p-8 md:p-12 lg:p-16 flex flex-col items-start justify-center relative overflow-hidden"
          >
            <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-accent/5 rounded-full blur-3xl"></div>
            <h3 className="text-xl font-medium font-serif mb-4 text-accent z-10">AI como Extensión</h3>
            <p className="text-muted-foreground leading-relaxed text-sm z-10">
              No para tomar decisiones humanas, sino para acelerar la generación de artefactos: drafts, código de prototipos rápidos, validación de hipótesis, y automatización de análisis cualitativos.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

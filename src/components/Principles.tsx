import { motion } from "motion/react";

const principles = [
  {
    num: "01",
    title: "Sistemas Clínicos, no Solo Pantallas",
    text: "El diseño moderno no se trata de hacer pantallas bonitas aisladas, sino de orquestar flujos de usuarios en ecosistemas complejos con restricciones de negocio y técnicas reales."
  },
  {
    num: "02",
    title: "IA como Acelerador de Ejecución",
    text: "La Inteligencia Artificial no reemplaza la toma de decisiones críticas ni el criterio. La integro como una herramienta para multiplicar la eficiencia operativa y amplificar el ancho de banda del equipo."
  },
  {
    num: "03",
    title: "Resultados Orientados al Negocio",
    text: "Métricas claras, eficiencia de capital y adopción. Construyo productos que retienen clientes, escalan con la demanda y aportan a los objetivos B2B/B2C prioritarios de la compañía."
  }
];

export function Principles() {
  return (
    <section id="visión" className="py-24 relative border-t border-border/50">
      <div className="container mx-auto px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="mb-16 md:mb-24 flex flex-col md:flex-row gap-8 justify-between items-start"
        >
          <h2 className="text-4xl md:text-5xl font-serif max-w-lg leading-tight">
            Mi valor real no es dibujar un flujo. Es descubrir a dónde debe llevarnos.
          </h2>
          <div className="max-w-sm text-muted-foreground leading-relaxed">
            <p>
              Abandono el término "UX/UI Designer". Mi foco está en la intersección de estrategia, descubrimiento, crecimiento y diseño sistémico, uniendo puntos desconectados dentro de corporativos o startups en fase de escala.
            </p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
          {principles.map((p, i) => (
            <motion.div 
              key={p.num}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              className="flex flex-col group"
            >
              <div className="font-mono text-3xl text-accent/50 group-hover:text-accent transition-colors mb-6 font-light">
                {p.num}
              </div>
              <h3 className="text-xl font-medium mb-4 font-serif">{p.title}</h3>
              <p className="text-muted-foreground leading-relaxed text-sm">
                {p.text}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

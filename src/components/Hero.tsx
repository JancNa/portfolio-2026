import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { AiChat } from "./AiChat";
import { cn } from "../lib/utils";
import { ShootingStars } from "./ui/shooting-stars";
import { StarsBackground } from "./ui/stars-background";

export function Hero() {
  const [chatStarted, setChatStarted] = useState(false);

  useEffect(() => {
    if (chatStarted) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [chatStarted]);

  return (
    <motion.section 
      layout
      transition={{ layout: { duration: 1.5, ease: [0.22, 1, 0.36, 1] } }}
      className={cn(
        "relative flex flex-col items-center justify-center w-full h-full min-h-[100dvh]",
        chatStarted ? "pt-16 pb-0" : "pt-32 pb-20"
      )}
    >
      {/* Background container */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden bg-background">
        
        {/* Subtle Side Glows */}
        <div className="absolute top-1/2 -left-1/4 md:-left-[10%] -translate-y-1/2 w-[50vw] h-[50vw] bg-[#a855f7]/[0.10] dark:bg-[#a855f7]/[0.05] rounded-full blur-[100px] md:blur-[140px] mix-blend-normal" />
        <div className="absolute top-1/2 -right-1/4 md:-right-[10%] -translate-y-1/2 w-[45vw] h-[45vw] bg-[#ea580c]/[0.10] dark:bg-[#ea580c]/[0.05] rounded-full blur-[100px] md:blur-[140px] mix-blend-normal" />

        <StarsBackground className="opacity-80" starDensity={0.0004} />
        <ShootingStars minDelay={500} maxDelay={1500} />
        <ShootingStars minDelay={1200} maxDelay={3500} starColor="#fb923c" trailColor="#a855f7" />
      </div>

      <motion.div 
        layout
        transition={{ layout: { duration: 1.5, ease: [0.22, 1, 0.36, 1] } }}
        className={cn(
          "w-full flex px-0 flex-col items-center z-20 flex-1 h-full",
          chatStarted ? "max-w-none justify-start px-0" : "container mx-auto px-4 max-w-5xl justify-center"
        )}
      >
        
        {/* Headline shrinking out of the way when chatting */}
        <AnimatePresence>
          {!chatStarted && (
            <motion.div 
              initial={{ opacity: 0, y: -40, height: 0, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, height: 'auto', scale: 1 }}
              exit={{ opacity: 0, y: -40, height: 0, scale: 0.95 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col items-center text-center mb-12"
            >
              <h1 className="text-6xl sm:text-7xl md:text-[6.5rem] font-bold tracking-tight text-balance mb-6">
                <span className="text-gradient-brand">Jorge Naranjo</span>
              </h1>
              
              <div className="flex flex-col gap-2 mb-8 items-center text-[1.15rem] md:text-xl font-medium text-foreground">
                <span>Diseño, construyo y escalo productos digitales</span>
                <span className="text-muted-foreground font-normal text-base md:text-lg">con enfoque en negocio y AI.</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* The Perplexity-style expanding Chat Component */}
        <motion.div 
          layout
          transition={{ layout: { duration: 1.5, ease: [0.22, 1, 0.36, 1] } }}
          className={cn("w-full flex flex-col items-center min-h-0", chatStarted ? "px-0 h-[calc(100vh-64px)]" : "px-4 h-auto")}
        >
          <AiChat 
            isExpanded={chatStarted} 
            onChatStart={() => setChatStarted(true)} 
            onChatClose={() => setChatStarted(false)} 
          />
        </motion.div>
      </motion.div>
    </motion.section>
  );
}

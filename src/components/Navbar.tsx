import { useTheme } from "../ThemeContext";
import { Moon, Sun, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../lib/utils";
import { useEffect, useState } from "react";

export function Navbar() {
  const { theme, setTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { name: "Visión", href: "#principios" },
    { name: "Proyectos", href: "#proyectos" },
    { name: "Metodología", href: "#metodología" },
    { name: "Experiencia", href: "#experiencia" }
  ];

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="fixed inset-x-0 top-0 z-50 flex justify-center pointer-events-none px-4 sm:px-0">
      <motion.nav 
        layout
        className={cn(
          "pointer-events-auto flex flex-col",
          !scrolled && !mobileMenuOpen 
            ? "w-full bg-transparent px-6 py-4 rounded-none border-b border-transparent mt-0" 
            : "w-full sm:w-fit bg-background/60 backdrop-blur-xl px-6 py-3 border border-border/50 mt-4 md:mt-6",
          (scrolled || mobileMenuOpen) ? (mobileMenuOpen ? "rounded-[2rem]" : "rounded-full") : ""
        )}
        initial={{ opacity: 0, y: -20, boxShadow: "0 8px 32px -4px rgba(168,85,247,0.0), 0 8px 32px -4px rgba(234,88,12,0.0)" }}
        animate={{ 
          opacity: 1, 
          y: 0,
          boxShadow: (scrolled || mobileMenuOpen) 
            ? "0 8px 32px -4px rgba(168,85,247,0.1), 0 8px 32px -4px rgba(234,88,12,0.1)"
            : "0 8px 32px -4px rgba(168,85,247,0.0), 0 8px 32px -4px rgba(234,88,12,0.0)"
        }}
        transition={{ 
          layout: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
          opacity: { duration: 0.6 },
          boxShadow: { 
            duration: 0.6, 
            ease: "easeInOut",
            delay: (scrolled || mobileMenuOpen) ? 0.35 : 0 
          }
        }}
      >
        <motion.div 
          layout
          className="max-w-7xl mx-auto w-full flex items-center justify-between gap-8 md:gap-16"
          transition={{ layout: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } }}
        >
        <motion.a layout href="/" className="shrink-0 block" transition={{ layout: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } }}>
          <img 
            src="https://jorgenaranjo.pro/Logonav.png" 
            alt="Jorge Naranjo Logo" 
            className="h-10 w-auto" 
            referrerPolicy="no-referrer"
          />
        </motion.a>

        {/* Desktop Links */}
        <motion.div layout className="flex items-center gap-6" transition={{ layout: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } }}>
          <ul className="hidden md:flex items-center gap-8 text-sm font-medium">
            {navItems.map((item) => (
              <li key={item.name}>
                <a href={item.href} className="text-muted-foreground hover:text-foreground transition-all relative group flex items-center py-2">
                  {item.name}
                  <span className="absolute -bottom-0.5 left-0 w-0 h-[1.5px] bg-gradient-to-r from-[#a855f7] to-[#ea580c] transition-all group-hover:w-full" />
                </a>
              </li>
            ))}
          </ul>
          
          <div className="w-px h-4 bg-border hidden md:block" />

          <div className="flex items-center gap-4">
            <label className="theme-toggle-container">
              <input 
                type="checkbox" 
                checked={theme === 'dark'} 
                onChange={() => setTheme(theme === 'dark' ? 'light' : 'dark')} 
              />
              <div className="theme-toggle-checkmark shadow-sm">
                <Sun className="theme-toggle-icon sun-icon text-foreground" size={16} />
                <Moon className="theme-toggle-icon moon-icon text-foreground" size={16} />
              </div>
            </label>

            <button 
              className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors text-foreground"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </motion.div>
        </motion.div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden overflow-hidden bg-background/50 border-t border-border/50 mt-4 -mx-6 rounded-b-[2rem]"
          >
            <ul className="flex flex-col p-6 gap-4">
              {navItems.map((item) => (
                <li key={item.name}>
                  <a 
                    href={item.href} 
                    className="text-lg font-medium text-foreground block py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
      </motion.nav>
    </div>
  );
}

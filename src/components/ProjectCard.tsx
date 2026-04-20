import { motion } from "motion/react";
import { ArrowUpRight } from "lucide-react";

interface Project {
  title: string;
  description: string;
  image: string;
  link: string;
  tags?: string[];
  key?: string;
  className?: string;
}

export function ProjectCard({ title, description, image, link, tags = [], className = "" }: Project) {
  return (
    <motion.a
      href={link}
      whileHover={{ y: -5 }}
      className={`flex flex-col h-full group overflow-hidden rounded-2xl bg-background border border-border shadow-lg hover:shadow-xl transition-all duration-300 ${className}`}
    >
      <div className="aspect-[16/10] overflow-hidden flex-shrink-0">
        <img 
          src={image} 
          alt={title} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          referrerPolicy="no-referrer"
        />
      </div>
      <div className="p-6 flex flex-col flex-1">
        <div className="flex flex-wrap gap-1.5 mb-3">
          {tags.length > 0 ? (
            tags.slice(0, 3).map(tag => (
              <span key={tag} className="px-2 py-0.5 text-[10px] border border-border/50 rounded-full font-medium text-muted-foreground whitespace-nowrap">
                {tag}
              </span>
            ))
          ) : (
            <span className="px-2 py-0.5 text-[10px] border border-border/50 rounded-full font-medium text-muted-foreground whitespace-nowrap uppercase tracking-wider">
              Producto
            </span>
          )}
        </div>
        <h3 className="text-lg font-serif font-bold text-foreground mb-2 group-hover:text-accent transition-colors">
          {title}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-2 mt-auto">
          {description}
        </p>
      </div>
    </motion.a>
  );
}

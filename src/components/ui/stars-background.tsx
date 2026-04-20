"use client";
import { cn } from "../../lib/utils";
import React, {
  useState,
  useEffect,
  useRef,
  RefObject,
  useCallback,
} from "react";

interface StarProps {
  x: number;
  y: number;
  radius: number;
  opacity: number;
  twinkleSpeed: number | null;
  isGlowing: boolean;
}

interface StarBackgroundProps {
  starDensity?: number;
  allStarsTwinkle?: boolean;
  twinkleProbability?: number;
  minTwinkleSpeed?: number;
  maxTwinkleSpeed?: number;
  className?: string;
}

export const StarsBackground: React.FC<StarBackgroundProps> = ({
  starDensity = 0.00015,
  allStarsTwinkle = true,
  twinkleProbability = 0.7,
  minTwinkleSpeed = 0.5,
  maxTwinkleSpeed = 1,
  className,
}) => {
  const [stars, setStars] = useState<StarProps[]>([]);
  const canvasRef: RefObject<HTMLCanvasElement> =
    useRef<HTMLCanvasElement>(null);

  const generateStars = useCallback(
    (width: number, height: number): StarProps[] => {
      const area = width * height;
      const numStars = Math.floor(area * starDensity);
      return Array.from({ length: numStars }, () => {
        const shouldTwinkle =
          allStarsTwinkle || Math.random() < twinkleProbability;
        const isGlowing = Math.random() < 0.1; // 10% of stars glow
        return {
          x: Math.random() * width,
          y: Math.random() * height,
          radius: isGlowing ? Math.random() * 0.5 + 1.0 : Math.random() * 0.05 + 0.5,
          opacity: Math.random() * 0.5 + 0.5,
          twinkleSpeed: shouldTwinkle
            ? minTwinkleSpeed +
              Math.random() * (maxTwinkleSpeed - minTwinkleSpeed)
            : null,
          isGlowing,
        };
      });
    },
    [
      starDensity,
      allStarsTwinkle,
      twinkleProbability,
      minTwinkleSpeed,
      maxTwinkleSpeed,
    ]
  );

  useEffect(() => {
    const initCanvas = () => {
      if (canvasRef.current) {
        // Configuramos la resolución real del canvas basada en la ventana para máxima nitidez
        // Esto evita que React/ResizeObserver lo borre (blackout) en cada milisegundo de animación CSS/Framer
        const width = window.innerWidth;
        const height = window.innerHeight;
        canvasRef.current.width = width;
        canvasRef.current.height = height;
        setStars(generateStars(width, height));
      }
    };

    initCanvas();

    let resizeTimeout: NodeJS.Timeout;
    const handleResize = () => {
      // Debounce para asegurar que no salte al minimizar ventanas
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        initCanvas();
      }, 200);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      clearTimeout(resizeTimeout);
      window.removeEventListener("resize", handleResize);
    };
  }, [generateStars]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const isDark = document.documentElement.classList.contains('dark');
      const baseRgb = isDark ? '255, 255, 255' : '15, 23, 42'; // White in dark, Slate-900 in light for better visibility

      
      const purpleRgb = '168, 85, 247';
      const orangeRgb = '234, 88, 12';
      
      stars.forEach((star) => {
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);

        // Decide the color: in dark mode white/cyan hue, in light mode purple/orange
        // We can just use the star's coordinates to randomly pick between purple or orange
        const isPurple = (Math.floor(star.x + star.y) % 2) === 0;
        const colorRgb = isDark ? '255, 255, 255' : (isPurple ? purpleRgb : orangeRgb);

        // In light mode, bump up opacity to make them more noticeable
        let starOpacity = star.opacity;
        if (!isDark) {
          starOpacity = Math.min(1, starOpacity + 0.3); // stronger opacity in light mode
        }

        if (star.isGlowing) {
          ctx.shadowBlur = isDark ? 8 : 12; // more shadow blur in light mode
          ctx.shadowColor = `rgba(${colorRgb}, ${starOpacity})`;
          ctx.fillStyle = `rgba(${colorRgb}, ${Math.min(1, starOpacity + 0.3)})`;
        } else {
          ctx.shadowBlur = 0;
          ctx.fillStyle = `rgba(${colorRgb}, ${starOpacity})`;
        }

        ctx.fill();

        if (star.twinkleSpeed !== null) {
          star.opacity =
            0.5 +
            Math.sin((Date.now() * 0.001) / star.twinkleSpeed) * 0.5;
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [stars]);

  return (
    <canvas
      ref={canvasRef}
      className={cn("h-full w-full object-cover absolute inset-0 pointer-events-none", className)}
    />
  );
};

"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/presentation/components/ui/utils";

interface LandingRevealProps {
  children: ReactNode;
  className?: string;
  delayMs?: number;
  once?: boolean;
}

export function LandingReveal({
  children,
  className,
  delayMs = 0,
  once = true,
}: LandingRevealProps) {
  const elementRef = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once) {
            observer.unobserve(element);
          }
          return;
        }

        if (!once) {
          setIsVisible(false);
        }
      },
      {
        root: null,
        threshold: 0.18,
        rootMargin: "0px 0px -10% 0px",
      },
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [once]);

  return (
    <div
      ref={elementRef}
      className={cn(
        "will-change-transform transition-all duration-700 ease-out motion-reduce:transform-none motion-reduce:transition-none",
        isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0",
        className,
      )}
      style={{ transitionDelay: `${delayMs}ms` }}
    >
      {children}
    </div>
  );
}

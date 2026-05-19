"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

interface FadeInUpProps {
  children: ReactNode;
  delay?: number;
  className?: string;
}

// Respects prefers-reduced-motion via framer-motion's hook — renders the
// children unanimated when the user opts out, instead of a static skip.
export function FadeInUp({ children, delay = 0, className }: FadeInUpProps) {
  const reduce = useReducedMotion();
  if (reduce) {
    return className ? (
      <div className={className}>{children}</div>
    ) : (
      <>{children}</>
    );
  }
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

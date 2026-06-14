"use client";

import { motion } from "motion/react";

export function ShiningText({ text }: { text: string }) {
  return (
    <motion.span
      className="bg-[linear-gradient(110deg,#64748b,35%,#fff,50%,#64748b,75%,#64748b)] bg-[length:200%_100%] bg-clip-text text-sm font-medium text-transparent"
      initial={{ backgroundPosition: "200% 0" }}
      animate={{ backgroundPosition: "-200% 0" }}
      transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
    >
      {text}
    </motion.span>
  );
}

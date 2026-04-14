"use client";

import { motion } from "framer-motion";

export default function LiquidBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none bg-slate-950">
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
          x: ["-10%", "10%", "-10%"],
          y: ["-10%", "5%", "-10%"],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] rounded-full will-change-transform"
        style={{ background: 'radial-gradient(circle, rgba(79,70,229,0.15) 0%, transparent 60%)' }}
      />
      
      <motion.div
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.2, 0.4, 0.2],
          x: ["10%", "-5%", "10%"],
          y: ["5%", "-10%", "5%"],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full will-change-transform"
        style={{ background: 'radial-gradient(circle, rgba(168,85,247,0.1) 0%, transparent 60%)' }}
      />

      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.3, 0.6, 0.3],
          x: ["-5%", "5%", "-5%"],
          y: ["10%", "-10%", "10%"],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-[20%] right-[10%] w-[40vw] h-[40vw] rounded-full will-change-transform"
        style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.1) 0%, transparent 60%)' }}
      />
      
      <div className="absolute inset-0 bg-slate-950/20" />
    </div>
  );
}

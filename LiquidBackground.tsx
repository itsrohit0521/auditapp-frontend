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
        className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-indigo-600/30 blur-[100px]"
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
        className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-fuchsia-600/20 blur-[120px]"
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
        className="absolute top-[20%] right-[10%] w-[40vw] h-[40vw] rounded-full bg-cyan-500/20 blur-[100px]"
      />
      
      <div className="absolute inset-0 bg-slate-950/[0.02] backdrop-blur-[1px] mix-blend-overlay" />
    </div>
  );
}

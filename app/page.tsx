"use client";

import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { motion, AnimatePresence, useScroll, useTransform, useMotionValue, useSpring } from "framer-motion";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import LiquidBackground from "../LiquidBackground";
import { FRAMEWORK_QUESTIONS } from "./data/frameworks";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

/* ============================================================
   TYPES
   ============================================================ */

type ScanResult = {
  error?: string;
  privacy_score: number;
  security_score: number;
  overall_score: number;
  risk_grade: string;
  detected_privacy: string[];
  missing_privacy: string[];
  detected_security: string[];
  missing_security: string[];
};

type AssessmentResult = {
  risk_level: string;
  risk_percentage: number;
};

/* ============================================================
   LANDING PAGE COMPONENT (Scrolling Layout)
   ============================================================ */

const LandingPage = ({ onStart, onOpenPrivacy }: { onStart: () => void, onOpenPrivacy: () => void }) => {
  const SIZES = [500, 800, 1100, 1500, 2000];
  const containerRef = useRef<HTMLDivElement>(null);

  // Framer Motion scroll hooks mapping scroll progress (0 to 1)
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end end"] });
  
  // Transform logic: Orb grows enormous, drops slightly down, and slides to horizontal-center
  const orbScale = useTransform(scrollYProgress, [0, 0.4, 1], [1, 2.5, 4.5]);
  const orbY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  // At scroll 0: it is positioned at right-[15%], so moving x by -35vw brings it perfectly center!
  const orbX = useTransform(scrollYProgress, [0, 1], ["0px", "-25vw"]); 
  
  const ringsOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
  const floatyOpacity = useTransform(scrollYProgress, [0, 0.05], [1, 0]);
  const heroTextOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);

  const handleScrollToFrameworks = () => {
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  };

  return (
    <div ref={containerRef} className="relative w-full bg-[#050508] font-sans" style={{ height: "350vh" }}>
      
      {/* =========================================
          STICKY COSMIC BACKGROUND (Fixed on screen)
          ========================================= */}
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        
        {/* Heavy SVG Noise Texture */}
        <div 
          className="hidden md:block absolute inset-0 z-0 opacity-[0.03] mix-blend-screen pointer-events-none" 
          style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noise%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noise)%22/%3E%3C/svg%3E')" }}
        />
        
        {/* Concentric Glowing Echo Rings */}
        <motion.div 
           style={{ opacity: ringsOpacity }} 
           className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-[30%] md:translate-x-[20%] pointer-events-none z-0"
        >
           {SIZES.map((size, i) => (
             <motion.div
               key={i}
               initial={{ scale: 0.8, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               transition={{ duration: 2.5, delay: i * 0.15, ease: "easeOut" }}
               className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-indigo-600/30 md:border-indigo-600/20"
               style={{ 
                 width: size, 
                 height: size, 
                 boxShadow: "inset 0 0 20px rgba(99,102,241,0.02), 0 0 20px rgba(168,85,247,0.02)" 
               }}
             >
               <motion.div 
                 animate={{ scale: [1, 1.01, 1], opacity: [0.1, 0.4, 0.1] }}
                 transition={{ duration: 6 + i, repeat: Infinity, ease: "easeInOut" }}
                 className="w-full h-full rounded-full border border-fuchsia-500/10"
               />
             </motion.div>
           ))}
        </motion.div>

        {/* 3D Interactive Orb Container (Animated via scroll transforms) */}
        <motion.div 
           style={{ scale: orbScale, y: orbY, x: orbX }}
           className="absolute bottom-10 right-10 md:top-[45%] md:-translate-y-1/2 md:right-[15%] z-10 pointer-events-none origin-center"
        >
          <motion.div
             className="w-56 h-56 md:w-[350px] md:h-[350px] rounded-full overflow-hidden relative pointer-events-auto"
             initial={{ scale: 0.5, opacity: 0 }}
             animate={{ scale: 1, opacity: 1 }}
             transition={{ duration: 1.5, type: "spring", bounce: 0.4 }}
             style={{ isolation: 'isolate' }}
          >
             <motion.div 
               className="w-full h-full"
               animate={{ rotate: 360 }}
               transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
               style={{ background: "radial-gradient(circle at 40% 40%, rgba(255,255,255,0.9) 0%, rgba(139,92,246,0.8) 15%, rgba(67,56,202,0.95) 40%, #030014 90%)" }}
             />
             <div className="hidden md:block absolute inset-0 opacity-[0.15] mix-blend-overlay pointer-events-none" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noise%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%221.5%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noise)%22/%3E%3C/svg%3E')" }} />
             <div className="absolute inset-0 rounded-full border-[1px] border-white/20 shadow-[inset_0_20px_50px_rgba(255,255,255,0.2)] pointer-events-none" />
          </motion.div>

          {/* Catchy Floating Element */}
          <motion.div 
            style={{ opacity: floatyOpacity }}
            animate={{ y: [0, -15, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-10 -left-10 md:-top-16 md:-left-24 bg-slate-900/60 backdrop-blur-xl border border-white/10 p-4 md:p-5 rounded-2xl shadow-2xl flex items-center gap-4 pointer-events-none w-max"
          >
            <div className="flex -space-x-3">
              <div className="w-10 h-10 rounded-full border border-slate-700 bg-emerald-500/20 flex items-center justify-center shadow-lg backdrop-blur-sm"><span className="text-emerald-400 text-sm font-bold">✓</span></div>
              <div className="w-10 h-10 rounded-full border border-slate-700 bg-indigo-500/20 flex items-center justify-center shadow-lg backdrop-blur-sm"><span className="text-indigo-400 text-sm font-bold">●</span></div>
            </div>
            <div>
               <p className="text-white text-base md:text-lg font-bold tracking-tight">Live Risk Engine</p>
               <p className="text-emerald-400 text-[10px] md:text-xs font-bold uppercase tracking-wider mt-0.5">Ready to Scan</p>
            </div>
          </motion.div>
        </motion.div>

        {/* Global Dark Gradient to fade out bottom */}
        <div className="absolute bottom-0 w-full h-[30vh] bg-gradient-to-t from-[#050508] to-transparent pointer-events-none z-20" />
      </div>

      {/* =========================================
          ABSOLUTE CONTENT LAYERS (Scrolling flow)
          ========================================= */}
      <div className="absolute top-0 w-full z-30 pointer-events-none">
         
         {/* SECTION 1: HERO VIEW (0 - 100vh) */}
         <div className="h-screen relative w-full flex flex-col justify-center px-6 md:px-12 xl:px-16 max-w-7xl mx-auto">
            {/* Top Navigation Strip */}
            <motion.div 
              style={{ opacity: heroTextOpacity }}
              className="absolute top-0 left-0 right-0 p-6 md:px-12 xl:px-16 flex justify-between items-center pointer-events-auto"
            >
               <div className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-white shadow-[0_0_15px_rgba(255,255,255,0.5)] transform rotate-45 rounded-sm" />
                  <span className="text-white font-extrabold text-2xl tracking-tighter">AuditApp</span>
               </div>
               <div className="hidden lg:flex items-center gap-10 text-slate-400 text-sm font-medium tracking-wide">
                  <span onClick={handleScrollToFrameworks} className="hover:text-white cursor-pointer transition-colors border-b border-transparent hover:border-white/50 pb-1">Frameworks</span>
                  <span onClick={onOpenPrivacy} className="hover:text-white cursor-pointer transition-colors border-b border-transparent hover:border-white/50 pb-1">Privacy Policy</span>
                  <span className="cursor-default px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-xs uppercase tracking-widest font-bold">100% Free Open Source</span>
               </div>
            </motion.div>

            {/* Hero Text Block */}
            <motion.div 
              style={{ opacity: heroTextOpacity }}
              className="max-w-[800px] mt-24 md:mt-32 pointer-events-auto"
            >
              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem] font-medium tracking-tight text-white leading-[1.05] mb-8 relative z-10 [text-shadow:_0_4px_30px_rgba(0,0,0,0.5)]">
                Scale Your Compliance Beyond Boundaries
              </h1>
              <p className="text-lg md:text-xl text-slate-400 leading-relaxed mb-12 max-w-2xl font-light">
                Launch faster with everything you need out of the box. Global regulatory frameworks, automated system assessments, real-time updates, and robust vector support — all built for scale.
              </p>

              {/* Brand Logostrip */}
              <div className="flex items-center gap-6 md:gap-10 mb-12 opacity-50 text-slate-400 font-bold text-xs sm:text-sm uppercase tracking-widest flex-wrap">
                 <span className="flex items-center gap-2 drop-shadow-md"><div className="w-2 h-2 rounded-full bg-slate-400" /> ISO 27001</span>
                 <span className="flex items-center gap-2 drop-shadow-md"><div className="w-2 h-2 rounded-full bg-slate-400" /> SOC 2</span>
                 <span className="flex items-center gap-2 drop-shadow-md"><div className="w-2 h-2 rounded-full bg-slate-400" /> HIPAA</span>
                 <span className="flex items-center gap-2 drop-shadow-md"><div className="w-2 h-2 rounded-full bg-slate-400" /> GDPR</span>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row items-center gap-6">
                 <motion.button 
                   whileHover={{ scale: 1.03 }}
                   whileTap={{ scale: 0.95 }}
                   onClick={onStart}
                   className="w-full sm:w-auto px-10 py-4 lg:py-5 bg-gradient-to-r from-indigo-700 to-purple-600 rounded-2xl text-white font-bold text-lg shadow-[inset_0_2px_10px_rgba(255,255,255,0.3),_0_10px_40px_rgba(79,70,229,0.5)] flex items-center justify-center gap-3 transition-shadow hover:shadow-[inset_0_2px_10px_rgba(255,255,255,0.4),_0_10px_50px_rgba(168,85,247,0.6)]"
                 >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m21 16-4 4-4-4"/><path d="M17 20V4"/><path d="m3 8 4-4 4 4"/><path d="M7 4v16"/></svg>
                    Launch App Free
                 </motion.button>
                 <div className="flex items-center gap-3 text-slate-400 font-medium">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)] animate-pulse" />
                    Ready to scan globally
                 </div>
              </div>
            </motion.div>
         </div>

         {/* SECTION 2: MARKETING CARDS (100vh) */}
         <div className="h-[120vh] relative w-full flex items-center px-6 md:px-12 xl:px-16 max-w-7xl mx-auto pointer-events-auto">
            <motion.div 
               initial={{ opacity: 0, y: 100 }} 
               whileInView={{ opacity: 1, y: 0 }} 
               viewport={{ once: false, margin: "-10%" }}
               transition={{ duration: 0.8 }}
               className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-10 mt-32"
            >
               {/* Card 1 */}
               <div className="bg-slate-900/10 shadow-md border border-white/10 p-8 rounded-[2rem] shadow-xl hover:bg-slate-900/40 transition-colors">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center mb-6 shadow-inner text-indigo-400">
                     <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                  </div>
                  <h3 className="text-white text-2xl font-bold mb-4 tracking-tight">Live Risk Engine</h3>
                  <p className="text-slate-400 text-base leading-relaxed font-light">Instantly analyze your public endpoints for missing security headers, vulnerable cryptographic protocols, and data privacy structural gaps.</p>
               </div>
               {/* Card 2 */}
               <div className="bg-slate-900/10 shadow-md border border-white/10 p-8 rounded-[2rem] shadow-xl hover:bg-slate-900/40 transition-colors md:translate-y-12">
                  <div className="w-14 h-14 rounded-2xl bg-fuchsia-500/20 border border-fuchsia-500/30 flex items-center justify-center mb-6 shadow-inner text-fuchsia-400">
                     <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                  </div>
                  <h3 className="text-white text-2xl font-bold mb-4 tracking-tight">Enterprise Grading</h3>
                  <p className="text-slate-400 text-base leading-relaxed font-light">Your technical results are mathematically weighed across algorithmic multi-dimensional parameters to yield strict enterprise readiness grades (A - F).</p>
               </div>
               {/* Card 3 */}
               <div className="bg-slate-900/10 shadow-md border border-white/10 p-8 rounded-[2rem] shadow-xl hover:bg-slate-900/40 transition-colors md:translate-y-24">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mb-6 shadow-inner text-emerald-400">
                     <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/></svg>
                  </div>
                  <h3 className="text-white text-2xl font-bold mb-4 tracking-tight">Automated Reports</h3>
                  <p className="text-slate-400 text-base leading-relaxed font-light">Turn your cloud scans gracefully into beautifully-structured PDF documentation mapped verbatim to the 7 regulatory compliance frameworks.</p>
               </div>
            </motion.div>
         </div>

         {/* SECTION 3: FRAMEWORKS GIGANTIC TYPOGRAPHY END */}
         <div className="h-[130vh] w-full relative flex flex-col justify-center items-center text-center px-6 pointer-events-auto">
            <motion.p 
               initial={{ opacity: 0, scale: 0.9 }}
               whileInView={{ opacity: 1, scale: 1 }}
               viewport={{ once: false, margin: "-20%" }}
               transition={{ duration: 0.8 }}
               className="text-fuchsia-400 font-bold uppercase tracking-[0.4em] text-xs md:text-sm mb-6 drop-shadow-lg"
            >
               7+ Regulatory Standards Supported Natively
            </motion.p>
            <motion.h2 
               initial={{ opacity: 0, y: 30 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: false, margin: "-20%" }}
               transition={{ duration: 0.8, delay: 0.1 }}
               className="text-6xl sm:text-8xl lg:text-[10rem] font-black tracking-tighter text-white leading-[0.9] mb-10 mix-blend-plus-lighter drop-shadow-2xl"
            >
               Global Rules.<br/>Local Automation.
            </motion.h2>

            {/* INCLUDED FRAMEWORKS SCROLL LIST */}
            <motion.div 
               initial="hidden"
               whileInView="visible"
               viewport={{ once: false, margin: "-10%" }}
               variants={{
                 hidden: {},
                 visible: { transition: { staggerChildren: 0.1, delayChildren: 0.3 } }
               }}
               className="flex flex-wrap justify-center items-center gap-3 md:gap-4 mb-16 max-w-4xl z-20 relative pointer-events-auto"
            >
               {["ISO 27001", "SOC 2 Type II", "HIPAA", "NIST CSF", "GDPR", "CCPA", "PCI DSS"].map((fw) => (
                  <motion.div 
                    key={fw}
                    variants={{
                       hidden: { opacity: 0, y: 30, scale: 0.8 },
                       visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", bounce: 0.4 } }
                    }}
                    whileHover={{ scale: 1.05, y: -5, backgroundColor: "rgba(99,102,241,0.2)", borderColor: "rgba(99,102,241,0.5)" }}
                    className="px-5 py-3 md:px-8 md:py-4 rounded-[1.5rem] bg-white/5 border border-white/10 backdrop-blur-xl text-slate-200 font-bold tracking-widest text-xs md:text-sm shadow-[0_10px_30px_rgba(0,0,0,0.5)] transition-colors cursor-default"
                  >
                     {fw}
                  </motion.div>
               ))}
            </motion.div>
            <motion.button 
               whileHover={{ scale: 1.05 }}
               whileTap={{ scale: 0.95 }}
               onClick={onStart}
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: false }}
               transition={{ duration: 0.8, delay: 0.2 }}
               className="px-10 py-5 bg-white text-black rounded-full font-bold text-lg shadow-[0_0_50px_rgba(255,255,255,0.4)] flex items-center gap-3 hover:bg-slate-200 transition-colors"
            >
               Start Compliance Protocol
               <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </motion.button>
            <div className="absolute bottom-10 px-6 text-center w-full text-slate-500/80 text-[10px] sm:text-xs font-semibold tracking-[0.2em] uppercase z-10 pointer-events-none">
               * Application under development. Manual analysis recommended.
            </div>
         </div>

      </div>
    </div>
  );
};

/* ============================================================
   MAIN PAGE COMPONENT (Handles Route States)
   ============================================================ */

export default function Home() {
  const [hasStarted, setHasStarted] = useState(false);
  
  const [tab, setTab] = useState<"scan" | "assessment" | "privacy">("scan");
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);

  const availableFrameworks = Object.keys(FRAMEWORK_QUESTIONS);
  const [framework, setFramework] = useState(availableFrameworks[0]);
  const [questions, setQuestions] = useState<{ id: number; question: string; weight: number }[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [assessmentResult, setAssessmentResult] = useState<AssessmentResult | null>(null);

  const [privacyText, setPrivacyText] = useState("");
  const mouseX = useMotionValue(-1000);
  const mouseY = useMotionValue(-1000);
  const smoothMouseX = useSpring(mouseX, { damping: 40, stiffness: 250, mass: 0.1 });
  const smoothMouseY = useSpring(mouseY, { damping: 40, stiffness: 250, mass: 0.1 });

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo(0, 0);
    }
  }, [tab]);

  /* Dashboard Scroll Physics */
  const dScrollY = useMotionValue(0);
  
  const ring1Rotate = useTransform(dScrollY, [0, 1], ["0deg", "270deg"]);
  const ring1Scale = useTransform(dScrollY, [0, 0.5, 1], [1, 1.3, 1]);
  
  const ring2Rotate = useTransform(dScrollY, [0, 1], ["0deg", "-270deg"]);
  const ring2Scale = useTransform(dScrollY, [0, 0.5, 1], [1, 1.4, 0.9]);
  
  const orbY = useTransform(dScrollY, [0, 1], ["0px", "500px"]);
  const orbOpacity = useTransform(dScrollY, [0, 0.5, 1], [0.8, 0.2, 1]);
  
  const gridY = useTransform(dScrollY, [0, 1], ["0px", "200px"]);

  /* Tracking Mouse (Dashboard Only) */
  useEffect(() => {
    if(!hasStarted) return;
    const move = (e: MouseEvent) => {
      mouseX.set(e.clientX - 200);
      mouseY.set(e.clientY - 200);
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, [hasStarted, mouseX, mouseY]);

  /* LOAD PRIVACY */
  useEffect(() => {
    fetch("/privacy_policy.md")
      .then((res) => {
        if (res.ok) return res.text();
        return "Privacy policy overview will be loaded here. Run privacy analysis to generate insights.";
      })
      .then(setPrivacyText)
      .catch(() => setPrivacyText("Failed to load privacy policy."));
  }, []);

  /* LOAD QUESTIONS */
  useEffect(() => {
    const local = FRAMEWORK_QUESTIONS[framework];
    if (local) {
      setQuestions(local);
      const init: Record<number, string> = {};
      local.forEach((q) => (init[q.id] = ""));
      setAnswers(init);
      setAssessmentResult(null);
    }
  }, [framework]);

  /* SCAN */
  const runScan = async () => {
    if (!url) return;
    setLoading(true);
    setResult(null);

    let targetUrl = url.trim();
    if (!/^https?:\/\//i.test(targetUrl)) {
      targetUrl = `https://${targetUrl}`;
    }

    try {
      const res = await axios.post(`${API_URL}/scan`, { url: targetUrl });
      setResult(res.data);
    } catch (err) {
      console.error("Backend Unreachable.", err);
      // Fallback object explicitly conveying failure state.
      setResult({
        error: "Failed to connect to the compliance scanning engine. Backend could be down.",
        overall_score: 0,
        security_score: 0,
        privacy_score: 0,
        risk_grade: "N/A",
        detected_security: [],
        missing_security: [],
        detected_privacy: [],
        missing_privacy: []
      });
    }
    setLoading(false);
  };

  /* PDF GENERATION */
  const executeDownload = () => {
    if (!result) return;
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.text("Security & Privacy Audit Report", 14, 22);
    doc.setFontSize(12);
    doc.text(`Target URL: ${url}`, 14, 32);
    doc.text(`Overall Risk Grade: ${result.risk_grade} (${result.overall_score}/100)`, 14, 38);

    autoTable(doc, { startY: 45, head: [["Metric", "Score"]], body: [["Security Architecture Score", `${result.security_score} / 100`], ["Privacy Compliance Score", `${result.privacy_score} / 100`]], theme: 'grid', headStyles: { fillColor: [79, 70, 229] } });
    autoTable(doc, { head: [["Detected Security Controls"]], body: result.detected_security.map((item) => [item]), theme: 'grid', headStyles: { fillColor: [16, 185, 129] } });
    autoTable(doc, { head: [["Missing/Vulnerable Security Controls"]], body: result.missing_security.map((item) => [item]), theme: 'grid', headStyles: { fillColor: [239, 68, 68] } });
    autoTable(doc, { head: [["Detected Privacy Measures"]], body: result.detected_privacy.map((item) => [item]), theme: 'grid', headStyles: { fillColor: [16, 185, 129] } });
    autoTable(doc, { head: [["Missing Privacy Measures"]], body: result.missing_privacy.map((item) => [item]), theme: 'grid', headStyles: { fillColor: [239, 68, 68] } });
    doc.save("Audit_Report.pdf");
  };

  /* ASSESSMENT */
  const runAssessment = async () => {
    const unanswered = questions.filter(q => !answers[q.id]);
    if(unanswered.length > 0) {
      alert(`Please answer all questions to calculate compliance correctly. (${unanswered.length} remaining)`);
      return;
    }

    const formatted: Record<number, boolean> = {};
    Object.keys(answers).forEach((key) => {
      formatted[Number(key)] = answers[Number(key)] === "Yes";
    });

    try {
      const res = await axios.post(`${API_URL}/self-assessment`, {
        framework,
        answers: formatted,
      });
      setAssessmentResult(res.data);
    } catch {
      console.warn("Backend Unreachable. Generating Simulation Report.");
      // Fallback calculation logic for demonstration
      const yesVotes = Object.values(formatted).filter(Boolean).length;
      const percentage = Math.round((yesVotes / Object.keys(formatted).length) * 100);
      setAssessmentResult({
        risk_level: percentage > 80 ? "Low Risk" : percentage > 50 ? "Medium Risk" : "High Risk",
        risk_percentage: 100 - percentage
      });
    }
  };

  // Nav Item layout
  const NavItem = ({ id, label }: { id: any; label: string }) => (
    <motion.button
      whileHover={{ scale: 1.03, x: 4 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => setTab(id)}
      className={`w-full text-left px-5 py-4 rounded-2xl transition-colors flex items-center justify-between outline-none ${
        tab === id ? "text-white font-bold bg-white/10 border border-white/20 shadow-md" : "text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent"
      }`}
    >
      <span>{label}</span>
    </motion.button>
  );

  return (
    <AnimatePresence mode="wait">
      {!hasStarted ? (
        <motion.div 
          key="hero"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, filter: "blur(20px)", scale: 1.05 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        >
          <LandingPage 
            onStart={() => setHasStarted(true)} 
            onOpenPrivacy={() => { setTab("privacy"); setHasStarted(true); }}
          />
        </motion.div>
      ) : (
        <motion.div 
          key="dashboard"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="min-h-[100dvh] relative font-sans text-slate-100 flex flex-col items-center justify-center p-3 sm:p-6 lg:p-8 overflow-hidden bg-[#050508]"
        >
          {/* =========================================
              DASHBOARD AMBIENT BACKGROUND GLOWS
              ========================================= */}
          <div className="absolute top-0 left-[-10%] w-[50vw] h-[50vh] bg-indigo-600/20 rounded-[100%] blur-3xl md:blur-[120px] pointer-events-none" />
          <div className="absolute bottom-0 right-[-10%] w-[50vw] h-[50vh] bg-fuchsia-600/20 rounded-[100%] blur-3xl md:blur-[120px] pointer-events-none" />
          
          <motion.div
             className="hidden md:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full pointer-events-none opacity-[0.02] mix-blend-screen"
             animate={{ rotate: 360 }}
             transition={{ duration: 150, repeat: Infinity, ease: "linear" }}
             style={{ background: "conic-gradient(from 0deg, transparent, rgba(99,102,241,1) 20%, transparent 40%, rgba(168,85,247,1) 60%, transparent 80%)" }}
          />

          <LiquidBackground />

          <button 
            onClick={() => setHasStarted(false)} 
            className="absolute top-4 left-4 z-50 px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-white border border-white/5 hover:border-white/20 hover:bg-white/10 rounded-full transition-all flex items-center gap-2 backdrop-blur-md bg-slate-900/50 shadow-lg"
          >
            ← Exit App
          </button>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 w-full text-center pointer-events-none opacity-80 px-4">
             <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 drop-shadow-md">
               * Application under development. Manual analysis recommended.
             </span>
          </div>

          {/* Interactive Mouse Glow - hidden on mobile */}
          <motion.div
            style={{ x: smoothMouseX, y: smoothMouseY }}
            className="hidden md:block fixed top-0 left-0 w-[400px] h-[400px] bg-indigo-400/20 rounded-full blur-[100px] pointer-events-none z-0 mix-blend-screen"
          />

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="w-full max-w-7xl relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 flex-1 lg:h-[90vh]"
          >
            {/* SIDEBAR NAVIGATION */}
            <div className="lg:col-span-3 rounded-3xl lg:rounded-[2rem] bg-slate-900/80 shadow-2xl border border-fuchsia-500/20 shadow-[0_20px_50px_rgba(0,0,0,0.8),inset_0_2px_2px_rgba(255,255,255,0.1)] p-5 lg:p-8 flex flex-col gap-6 lg:gap-10 z-20 mt-12 lg:mt-0 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-3xl rounded-full" />
              
              <motion.div whileHover={{ scale: 1.02 }} className="cursor-default relative z-10">
                <h1 className="text-3xl lg:text-4xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-br from-white via-indigo-100 to-indigo-500 mb-2 drop-shadow-[0_0_10px_rgba(99,102,241,0.5)]">
                  AuditApp
                </h1>
                <p className="text-xs lg:text-sm text-slate-400 font-medium tracking-wide uppercase">Precision Auditing. Proven Compliance.</p>
              </motion.div>
              
              <nav className="flex flex-col gap-2 lg:gap-3 relative z-10">
                <NavItem id="scan" label="Website Security Scan" />
                <NavItem id="assessment" label="Self-Assessment" />
                <NavItem id="privacy" label="Privacy Analysis" />
              </nav>

              <div className="mt-auto pt-4 lg:pt-8 border-t border-white/5 hidden lg:block relative z-10">
                 <div className="flex items-center gap-3 opacity-90 bg-slate-950/80 px-4 py-3 rounded-xl border border-indigo-500/20 shadow-inner">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_12px_2px_rgba(52,211,153,0.8)] animate-pulse" />
                    <span className="text-xs uppercase tracking-widest font-bold text-slate-300">System Online</span>
                 </div>
              </div>
            </div>

            {/* MAIN CONTENT AREA */}
            <div className="lg:col-span-9 rounded-3xl lg:rounded-[2rem] bg-slate-950/80 shadow-2xl border border-indigo-500/20 shadow-[0_20px_80px_rgba(0,0,0,0.8),inset_0_2px_2px_rgba(255,255,255,0.1)] overflow-hidden relative flex flex-col h-[75vh] lg:h-full z-20">
              
              {/* High-tech animated grid overlay */}
              <div className="absolute inset-0 z-0 opacity-30 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle at center, rgba(168,85,247,0.15) 0%, transparent 70%)" }} />
              <motion.div className="absolute -inset-[200px] z-0 opacity-[0.06] pointer-events-none will-change-transform" style={{ y: gridY, backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
              <div className="hidden md:block absolute inset-0 opacity-[0.06] pointer-events-none mix-blend-overlay z-0" style={{backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')"}}></div>
              
              {/* Interactive Holographic Mechanics (Scroll Bound) */}
              <motion.div 
                className="absolute right-[-10%] top-[10%] w-[500px] h-[500px] border-[1px] border-indigo-500/30 rounded-full pointer-events-none"
                style={{ rotate: ring1Rotate, scale: ring1Scale }}
              />
              <motion.div 
                className="absolute right-[-5%] top-[15%] w-[400px] h-[400px] border-[1px] border-fuchsia-500/30 rounded-full pointer-events-none"
                style={{ rotate: ring2Rotate, scale: ring2Scale }}
              />
              <motion.div 
                className="absolute top-24 right-24 w-12 h-12 rounded-full bg-indigo-400 shadow-[0_0_80px_rgba(168,85,247,1)] pointer-events-none mix-blend-screen"
                style={{ y: orbY, opacity: orbOpacity }}
              />
              
              <div 
                ref={scrollRef}
                className="flex-1 overflow-x-hidden overflow-y-auto w-full p-5 md:p-10 lg:p-14 z-10 custom-scrollbar scroll-smooth box-border relative"
                onScroll={(e) => {
                  const target = e.target as HTMLDivElement;
                  const progress = target.scrollTop / (target.scrollHeight - target.clientHeight);
                  dScrollY.set(progress || 0);
                }}
              >
                  {/* SCANNER VIEW */}
                  {tab === "scan" && (
                     <div className="w-full flex flex-col gap-8 lg:gap-10 pb-10">
                        <div className="space-y-4">
                          <motion.div 
                            whileHover={{ rotate: [-1, 2, -1], scale: 1.05 }} 
                            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-2 cursor-pointer shadow-[0_0_15px_rgba(99,102,241,0.2)]"
                          >
                             Active Module
                          </motion.div>
                          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-4 drop-shadow-md">Compliance Scanner</h2>
                          <p className="text-base lg:text-lg text-slate-400 leading-relaxed max-w-2xl font-light">
                            Automated analysis mapping endpoints against strict regulatory boundaries. Ensures data structural integrity.
                          </p>
                        </div>

                        <div className="relative group mt-2 lg:mt-4">
                          <div className="absolute -inset-1 lg:-inset-1.5 bg-gradient-to-r from-indigo-500 via-emerald-500 to-fuchsia-500 rounded-3xl blur-lg opacity-30 transition duration-1000" />
                          <motion.div 
                            whileHover={{ scale: 1.01 }}
                            className="relative flex flex-col sm:flex-row items-center bg-black/60 backdrop-blur-xl rounded-[1.5rem] border border-indigo-500/30 shadow-[inset_0_0_20px_rgba(99,102,241,0.1)] p-2 sm:p-0"
                          >
                            <div className="hidden sm:block pl-6 pr-2 text-slate-500">
                               <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                            </div>
                            <input
                              value={url}
                              onChange={(e) => setUrl(e.target.value)}
                              placeholder="https://example.com"
                              className="w-full bg-transparent p-4 sm:p-6 text-base sm:text-lg text-white placeholder-slate-500 outline-none font-medium text-center sm:text-left"
                            />
                            <motion.button 
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.9, rotate: 2 }}
                              onClick={runScan}
                              disabled={loading || !url}
                              className="w-full sm:w-auto mr-0 sm:mr-3 ml-0 sm:ml-2 bg-gradient-to-r from-indigo-600 to-fuchsia-600 hover:from-indigo-500 hover:to-fuchsia-500 transition-all text-white font-bold px-6 sm:px-8 py-3 sm:py-4 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg my-1 sm:my-2"
                            >
                              {loading ? (
                                <>
                                   <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                   Scanning
                                </>
                              ) : "Engage"}
                            </motion.button>
                          </motion.div>
                        </div>

                        {result && (
                          <motion.div 
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 mt-4 lg:mt-6"
                          >
                            {result.error && (
                               <div className="md:col-span-3 bg-red-500/10 border border-red-500/50 p-4 rounded-xl flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
                                    <span className="text-red-400 font-bold">!</span>
                                  </div>
                                  <p className="text-red-400 text-sm font-medium">{result.error}</p>
                               </div>
                            )}

                            <ScoreCard title="Overall Risk Score" score={result.overall_score} delay={0.1} />
                            <ScoreCard title="Security Posture" score={result.security_score} delay={0.2} />
                            <ScoreCard title="Privacy Index" score={result.privacy_score} delay={0.3} />
                            
                            <motion.div 
                              whileHover={{ scale: 1.02 }}
                              className="md:col-span-3 p-6 lg:p-8 rounded-[1.5rem] bg-slate-900/80 backdrop-blur-md border border-white/10 flex flex-col sm:flex-row items-center justify-between mt-2 shadow-2xl gap-4"
                            >
                               <div className="text-center sm:text-left">
                                  <p className="text-slate-400 font-medium mb-1 uppercase tracking-widest text-xs">Calculated Status</p>
                                  <h3 className="text-lg sm:text-3xl text-white font-bold">Enterprise Risk Grade</h3>
                               </div>
                               <motion.div 
                                 initial={{ scale: 0.5, rotate: -10 }}
                                 animate={{ scale: 1, rotate: 0 }}
                                 transition={{ type: "spring", bounce: 0.5 }}
                                 className={`text-6xl sm:text-7xl font-black ${
                                  result.risk_grade === "A" ? "text-emerald-400 drop-shadow-[0_0_20px_rgba(52,211,153,0.5)]" :
                                  result.risk_grade === "B" ? "text-blue-400 drop-shadow-[0_0_20px_rgba(96,165,250,0.5)]" :
                                  result.risk_grade === "C" ? "text-yellow-400 drop-shadow-[0_0_20px_rgba(250,204,21,0.5)]" :
                                  "text-red-400 drop-shadow-[0_0_20px_rgba(248,113,113,0.5)]"
                               }`}>
                                  {result.risk_grade}
                               </motion.div>
                            </motion.div>
                            
                            {/* Detailed Findings */}
                            <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6 mt-2 lg:mt-4">
                              <motion.div whileHover={{ y: -5 }} className="bg-slate-950/80 border border-white/5 rounded-[2rem] p-6 lg:p-8 shadow-[0_10px_30px_rgba(0,0,0,0.4)] relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl group-hover:bg-emerald-500/10 transition-colors" />
                                <h4 className="text-emerald-400 font-bold mb-6 tracking-widest uppercase text-sm flex items-center gap-2"><div className="w-2 h-2 bg-emerald-400 rounded-full" /> Protected Assets</h4>
                                <ul className="space-y-4 relative z-10">
                                  {result.detected_security.length > 0 ? result.detected_security.map((item, i) => (
                                    <li key={i} className="text-sm text-slate-300 flex items-start gap-4 p-3 bg-white/5 rounded-xl border border-white/5 font-medium"><span className="text-emerald-500 font-bold mt-0.5">✓</span> <span className="leading-relaxed">{item}</span></li>
                                  )) : <li className="text-sm text-slate-500 italic p-3">No security protections detected.</li>}
                                </ul>
                              </motion.div>

                              <motion.div whileHover={{ y: -5 }} className="bg-slate-950/80 border border-white/5 rounded-[2rem] p-6 lg:p-8 shadow-[0_10px_30px_rgba(0,0,0,0.4)] relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-3xl group-hover:bg-red-500/10 transition-colors" />
                                <h4 className="text-red-400 font-bold mb-6 tracking-widest uppercase text-sm flex items-center gap-2"><div className="w-2 h-2 bg-red-400 rounded-full" /> Security Vulnerabilities</h4>
                                <ul className="space-y-4 relative z-10">
                                  {result.missing_security.length > 0 ? result.missing_security.map((item, i) => (
                                    <li key={i} className="text-sm text-slate-300 flex items-start gap-4 p-3 bg-white/5 rounded-xl border border-white/5 font-medium"><span className="text-red-500 font-bold mt-0.5">✗</span> <span className="leading-relaxed">{item}</span></li>
                                  )) : <li className="text-sm text-slate-500 italic p-3 bg-white/5 rounded-xl border border-white/5">No basic security misconfigurations detected (header-level scan)</li>}
                                </ul>
                              </motion.div>
                              
                              <motion.div whileHover={{ y: -5 }} className="bg-slate-950/80 border border-white/5 rounded-[2rem] p-6 lg:p-8 shadow-[0_10px_30px_rgba(0,0,0,0.4)] relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl group-hover:bg-emerald-500/10 transition-colors" />
                                <h4 className="text-emerald-400 font-bold mb-6 tracking-widest uppercase text-sm flex items-center gap-2"><div className="w-2 h-2 bg-emerald-400 rounded-full" /> Active Privacy Controls</h4>
                                <ul className="space-y-4 relative z-10">
                                  {result.detected_privacy.length > 0 ? result.detected_privacy.map((item, i) => (
                                    <li key={i} className="text-sm text-slate-300 flex items-start gap-4 p-3 bg-white/5 rounded-xl border border-white/5 font-medium"><span className="text-emerald-500 font-bold mt-0.5">✓</span> <span className="leading-relaxed">{item}</span></li>
                                  )) : <li className="text-sm text-slate-500 italic p-3 bg-white/5 rounded-xl border border-white/5">No active privacy measures detected.</li>}
                                </ul>
                              </motion.div>

                              <motion.div whileHover={{ y: -5 }} className="bg-slate-950/80 border border-white/5 rounded-[2rem] p-6 lg:p-8 shadow-[0_10px_30px_rgba(0,0,0,0.4)] relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-3xl group-hover:bg-red-500/10 transition-colors" />
                                <h4 className="text-red-400 font-bold mb-6 tracking-widest uppercase text-sm flex items-center gap-2"><div className="w-2 h-2 bg-red-400 rounded-full" /> Missing Privacy Policies</h4>
                                <ul className="space-y-4 relative z-10">
                                  {result.missing_privacy.length > 0 ? result.missing_privacy.map((item, i) => (
                                    <li key={i} className="text-sm text-slate-300 flex items-start gap-4 p-3 bg-white/5 rounded-xl border border-white/5 font-medium"><span className="text-red-500 font-bold mt-0.5">✗</span> <span className="leading-relaxed">{item}</span></li>
                                  )) : <li className="text-sm text-slate-500 italic p-3 bg-white/5 rounded-xl border border-white/5">No missing privacy controls!</li>}
                                </ul>
                              </motion.div>
                            </div>

                            {/* Download Action */}
                            <div className="md:col-span-3 flex justify-center sm:justify-end mt-4 mb-20">
                              <motion.button 
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95, y: 5 }}
                                onClick={executeDownload} 
                                className="w-full sm:w-auto bg-white text-slate-900 hover:bg-slate-200 font-bold py-4 sm:py-4 px-8 rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.4)] transition-colors flex items-center justify-center gap-3 text-lg"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                                Generate PDF Protocol
                              </motion.button>
                            </div>
                          </motion.div>
                        )}
                     </div>
                  )}

                  {/* ASSESSMENT VIEW */}
                  {tab === "assessment" && (
                     <div className="w-full h-full flex flex-col gap-8 pb-10">
                        <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 pb-6 lg:pb-8 border-b border-indigo-500/20">
                          <div className="max-w-2xl">
                            <motion.div 
                              whileHover={{ scale: 1.05 }} 
                              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-fuchsia-500/10 border border-fuchsia-500/20 text-fuchsia-300 text-xs font-semibold uppercase tracking-wider mb-4 cursor-default"
                            >
                               Compliance Engine
                            </motion.div>
                            <h2 className="text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight text-white mb-4 drop-shadow-md">Self-Assessment</h2>
                            <p className="text-base sm:text-lg text-slate-400 leading-relaxed font-light">
                              Rigorous enterprise technical profiling mapped flawlessly against international governance constraints.
                            </p>
                          </div>
                          
                          <div className="w-full sm:w-auto sm:min-w-[280px] shrink-0 xl:pb-2 self-start xl:self-end">
                            <div className="relative group w-full sm:w-auto h-full">
                              <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-fuchsia-500 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-500"></div>
                              <motion.div whileHover={{ scale: 1.02 }} className="relative w-full h-full">
                                <select 
                                  value={framework} 
                                  onChange={(e) => setFramework(e.target.value)}
                                  className="w-full appearance-none bg-slate-950/90 border border-white/20 rounded-xl px-5 py-4 text-white text-base sm:text-lg font-bold outline-none cursor-pointer focus:ring-2 focus:ring-indigo-500/80 shadow-2xl"
                                >
                                  {availableFrameworks.map(f => (
                                    <option key={f} value={f}>{f}</option>
                                  ))}
                                </select>
                                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
                                   <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                                </div>
                              </motion.div>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-6 my-2 flex-1 pb-32">
                          {questions.map((q, index) => (
                            <Question
                              key={q.id}
                              index={index + 1}
                              label={q.question}
                              weight={q.weight}
                              value={answers[q.id]}
                              onChange={(v: string) => setAnswers({ ...answers, [q.id]: v })}
                            />
                          ))}
                        </div>

                        {/* Fixed Bottom Action Bar */}
                        <div className="sticky bottom-0 left-0 right-0 pt-16 pb-2 pointer-events-none z-30 mt-auto flex justify-center">
                           <motion.div 
                              whileHover={{ y: -2 }}
                              className="bg-slate-900/40 shadow-md border border-white/20 rounded-3xl p-3 sm:p-5 flex flex-col sm:flex-row items-center gap-4 justify-between shadow-[0_-10px_40px_rgba(0,0,0,0.8)] pointer-events-auto"
                           >
                              <div className="flex items-center gap-4 px-2 sm:px-4 w-full sm:w-auto justify-between sm:justify-start">
                                 <div className="flex items-center gap-4">
                                   <motion.div 
                                     initial={{ scale: 0.8 }} animate={{ scale: 1 }}
                                     className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-indigo-500/20 flex items-center justify-center border border-indigo-500/40 text-white font-bold text-lg shadow-inner"
                                   >
                                     {questions.filter(q => answers[q.id]).length}
                                   </motion.div>
                                   <p className="text-xs sm:text-sm font-bold text-slate-300 uppercase tracking-widest">/ {questions.length} Answered</p>
                                 </div>
                              </div>
                              <motion.button 
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.95, rotate: -2 }}
                                onClick={runAssessment} 
                                className="w-full sm:w-auto bg-white text-slate-950 hover:bg-slate-200 font-bold px-8 py-3.5 sm:py-4 rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.4)] transition-colors flex items-center justify-center gap-3 text-lg"
                              >
                                Process Compliance Score
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                              </motion.button>
                           </motion.div>
                        </div>

                        {/* Assessment Result Modal */}
                        <AnimatePresence>
                          {assessmentResult && (
                            <motion.div 
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl"
                            >
                               <motion.div 
                                  initial={{ scale: 0.9, y: 30, rotateX: 20 }}
                                  animate={{ scale: 1, y: 0, rotateX: 0 }}
                                  exit={{ scale: 0.9, y: 20, opacity: 0 }}
                                  transition={{ type: "spring", damping: 25 }}
                                  className="w-full max-w-xl bg-slate-900 border border-indigo-500/50 rounded-[2rem] p-6 lg:p-10 relative overflow-hidden shadow-[0_20px_80px_rgba(79,70,229,0.7)]"
                               >
                                  <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
                                  <div className="absolute bottom-0 left-0 w-64 h-64 bg-fuchsia-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3" />
                                  
                                  <h3 className="text-xl lg:text-2xl font-bold text-white mb-6 lg:mb-8 relative z-10 text-center sm:text-left drop-shadow-md">Audit Profile: {framework}</h3>
                                  
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-8 relative z-10 mb-8">
                                     <div className="bg-slate-950/70 p-8 rounded-[1.5rem] border border-white/10 shadow-inner">
                                        <p className="text-xs lg:text-sm font-bold text-slate-400 mb-3 uppercase tracking-widest">Maturity Level</p>
                                        <p className={`text-4xl lg:text-5xl font-black ${
                                          assessmentResult.risk_level.includes("Low") ? "text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.5)]" :
                                          assessmentResult.risk_level.includes("Medium") ? "text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]" : "text-red-400 drop-shadow-[0_0_15px_rgba(248,113,113,0.5)]"
                                        }`}>{assessmentResult.risk_level}</p>
                                     </div>
                                     <div className="bg-slate-950/70 p-8 rounded-[1.5rem] border border-white/10 shadow-inner">
                                        <p className="text-xs lg:text-sm font-bold text-slate-400 mb-3 uppercase tracking-widest">Deficiency Metric</p>
                                        <p className="text-4xl lg:text-5xl font-black text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">{assessmentResult.risk_percentage}%</p>
                                     </div>
                                  </div>
                                  
                                  <motion.button 
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setAssessmentResult(null)}
                                    className="w-full py-5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold transition-colors border border-white/20 relative z-10 active:bg-white/30 text-base shadow-lg"
                                  >
                                    Acknowledge & Close Context
                                  </motion.button>
                               </motion.div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                     </div>
                  )}

                  {/* PRIVACY VIEW (Enhanced Markdown Cards) */}
                  {tab === "privacy" && (
                    <div className="w-full flex flex-col gap-8 lg:gap-10 pb-20">
                      <div className="space-y-4">
                         <motion.div 
                           whileHover={{ scale: 1.05, rotate: 2 }} 
                           className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-bold uppercase tracking-wider mb-2 cursor-default shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                         >
                             Core Documentation
                         </motion.div>
                         <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white mb-4 drop-shadow-md">Platform Privacy Layer</h2>
                         <p className="text-base lg:text-lg text-slate-400 font-light leading-relaxed">Legal and functional policies regulating active data processing and compliance analytics within your active workspace.</p>
                      </div>
                      
                      <div className="flex flex-col gap-6">
                        {privacyText.split('\n\n').map((paragraph, i) => {
                          // Very basic markdown parsing for headers vs text blocks
                          if (paragraph.startsWith('#')) {
                            return (
                              <motion.h3 
                                key={i} 
                                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                                className="text-2xl text-white font-bold tracking-tight mt-6 flex items-center gap-3 drop-shadow-md"
                              >
                                <div className="w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
                                {paragraph.replace('#', '').trim()}
                              </motion.h3>
                            );
                          } else if (paragraph.trim().length > 0) {
                            return (
                              <motion.div 
                                key={i} 
                                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                                className="p-6 md:p-8 rounded-[1.5rem] bg-slate-950/60 border border-white/5 text-slate-300 font-light leading-relaxed shadow-lg hover:bg-slate-950/80 transition-colors"
                              >
                                {paragraph}
                              </motion.div>
                            );
                          }
                          return null;
                        })}
                      </div>
                    </div>
                  )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ============================================================
   SUBCOMPONENTS
   ============================================================ */

function ScoreCard({ title, score, delay = 0 }: { title: string; score: number, delay?: number }) {
  const getGradient = (s: number) => {
    if (s > 80) return "from-emerald-400 to-emerald-600";
    if (s > 50) return "from-yellow-400 to-yellow-600";
    return "from-red-400 to-red-600";
  };
  
  const getSubtext = (t: string) => {
    if (t.includes("Overall")) return "Aggregated compliance health across all vectors.";
    if (t.includes("Security")) return "Based on active endpoints and transmission headers.";
    if (t.includes("Privacy")) return "Derived from tracking, cookie, and policy metrics.";
    return "Calculated against framework baselines.";
  };

  // Generate a random-looking sparkline for visual flair
  const sparklinePts = "M0,20 Q5,10 10,15 T20,20 T30,5 T40,15 T50,5 T60,25 T70,10 T80,15 T90,0 T100,20";

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ scale: 1.05, rotateY: 8, rotateZ: -1 }}
      className="p-6 lg:p-8 rounded-[2rem] bg-slate-900/80 backdrop-blur-xl border border-white/10 flex flex-col justify-between gap-4 shadow-[0_10px_30px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.1)] cursor-default group hover:border-indigo-500/50 hover:shadow-[0_10px_50px_rgba(99,102,241,0.2),inset_0_1px_1px_rgba(255,255,255,0.2)] transition-all overflow-hidden relative"
    >
       <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 group-hover:bg-indigo-500/10 transition-colors" />
       
       <div className="flex justify-between items-start relative z-10">
         <span className="text-slate-400 text-xs sm:text-sm font-bold uppercase tracking-widest group-hover:text-slate-200 transition-colors w-2/3">{title}</span>
         <span className="text-xs font-mono bg-white/5 px-2 py-1 rounded-md text-slate-500 border border-white/5 flex items-center gap-2 shadow-inner">
            <div className={`w-1.5 h-1.5 rounded-full ${score > 80 ? 'bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.8)]' : score > 50 ? 'bg-yellow-500 shadow-[0_0_5px_rgba(234,179,8,0.8)]' : 'bg-red-500 shadow-[0_0_5px_rgba(239,68,68,0.8)]'} animate-pulse`} />
            /100
         </span>
       </div>
       
       <div className="relative z-10 flex items-end justify-between mt-2">
         <div className={`text-6xl lg:text-7xl font-black bg-clip-text text-transparent bg-gradient-to-b ${getGradient(score)} drop-shadow-lg`}>
           {score}
         </div>
         <svg className="w-16 h-8 opacity-20 group-hover:opacity-60 transition-opacity" viewBox="0 0 100 30" preserveAspectRatio="none">
            <path d={sparklinePts} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className={score > 80 ? 'text-emerald-400' : score > 50 ? 'text-yellow-400' : 'text-red-400'} />
         </svg>
       </div>
       
       <p className="text-xs text-slate-500 font-medium leading-relaxed mt-2 relative z-10 group-hover:text-slate-400 transition-colors">{getSubtext(title)}</p>
    </motion.div>
  );
}

function Question({ label, value, weight, index, onChange }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 50, rotateX: -10 }}
      whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
      viewport={{ once: true, amount: 0.1, margin: "0px 0px -20px 0px" }}
      transition={{ duration: 0.7, type: "spring", bounce: 0.4 }}
      whileHover={{ scale: 1.01, x: 2, backgroundColor: "rgba(15, 23, 42, 0.8)" }}
      className="p-6 md:p-8 bg-slate-950/60 border border-white/10 rounded-[2rem] transition-all duration-300 group flex flex-col md:flex-row md:items-center justify-between gap-6 backdrop-blur-md shadow-lg"
    >
      <div className="flex-1 flex gap-4 md:gap-6">
        <div className="flex-shrink-0 w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-slate-900 border border-white/5 flex items-center justify-center text-sm md:text-base font-bold text-slate-400 group-hover:bg-indigo-500/20 group-hover:text-indigo-300 group-hover:border-indigo-500/40 transition-colors shadow-inner">
          {index}
        </div>
        <div className="pt-0 md:pt-1 text-left flex-1">
          <label className="block text-white text-lg md:text-xl leading-relaxed font-bold tracking-tight">{label}</label>
          <div className="flex gap-2 mt-3 md:mt-4">
             <span className="px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-[10px] md:text-xs text-indigo-300 font-bold uppercase tracking-widest flex items-center shadow-inner">
                 Weight: {weight} pts
             </span>
          </div>
        </div>
      </div>

      <div className="flex-shrink-0 w-full md:w-48 relative">
        <motion.select
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full appearance-none px-6 py-5 rounded-2xl border outline-none font-black text-sm md:text-base transition-colors cursor-pointer shadow-inner tracking-widest uppercase ${
            value === "Yes" ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.2)]" :
            value === "No" ? "bg-red-500/20 border-red-500/50 text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.2)]" :
            "bg-slate-900 border-white/20 text-white hover:border-white/40"
          }`}
        >
          <option value="" disabled>Select</option>
          <option value="Yes">Yes</option>
          <option value="No">No</option>
        </motion.select>
        <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none opacity-80">
           <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
        </div>
      </div>
    </motion.div>
  );
}
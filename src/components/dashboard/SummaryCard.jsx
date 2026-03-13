import React from 'react';
import { motion } from 'framer-motion';

export default function SummaryCard({ title, value, icon: Icon, trend, trendUp }) {
  return (
    <motion.div 
      whileHover={{ 
        scale: 1.02,
        y: -4,
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
      }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="glass-card relative overflow-hidden rounded-4xl p-8 group flex flex-col justify-between h-full hover:border-brand-500/30 transition-all duration-500 cursor-pointer"
    >
      {/* Decorative inner glow */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
      
      <div className="flex items-start justify-between relative z-10">
        <div className="space-y-1">
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">{title}</p>
          <p className="text-3xl font-extrabold tracking-tightest text-slate-900 dark:text-white font-display">
            {value}
          </p>
        </div>
        <div className="rounded-2xl bg-white dark:bg-slate-800 p-3.5 shadow-sm border border-slate-100 dark:border-slate-700/50 group-hover:scale-110 group-hover:bg-brand-600 group-hover:text-white transition-all duration-500">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
      </div>

      <div className="mt-8 flex items-center justify-between relative z-10">
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter ${
          trendUp ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'
        }`}>
          <span>{trendUp ? '󰄬' : '󰄮'}</span>
          <span>{trend}</span>
        </div>
        <span className="text-[9px] font-mono font-medium text-slate-400 dark:text-slate-600 tracking-tighter uppercase opacity-0 group-hover:opacity-100 transition-opacity">Live Signal</span>
      </div>

      {/* Glass Shine Layer handled by parent container glass-shine class in Dashboard.jsx */}
    </motion.div>
  );
}

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

const ToastContext = createContext();
export const useToast = () => useContext(ToastContext);

// ─── Config ──────────────────────────────────────────────────────────────────

const CONFIG = {
  success: {
    icon: CheckCircle2,
    bg: 'bg-white dark:bg-slate-900',
    border: 'border-emerald-400/60',
    accent: 'bg-emerald-500',
    iconColor: 'text-emerald-500',
    label: 'text-slate-800 dark:text-slate-100',
    sub: 'text-slate-500 dark:text-slate-400',
    glow: 'shadow-emerald-500/20',
  },
  error: {
    icon: XCircle,
    bg: 'bg-white dark:bg-slate-900',
    border: 'border-rose-400/60',
    accent: 'bg-rose-500',
    iconColor: 'text-rose-500',
    label: 'text-slate-800 dark:text-slate-100',
    sub: 'text-slate-500 dark:text-slate-400',
    glow: 'shadow-rose-500/20',
  },
  warning: {
    icon: AlertTriangle,
    bg: 'bg-white dark:bg-slate-900',
    border: 'border-amber-400/60',
    accent: 'bg-amber-500',
    iconColor: 'text-amber-500',
    label: 'text-slate-800 dark:text-slate-100',
    sub: 'text-slate-500 dark:text-slate-400',
    glow: 'shadow-amber-500/20',
  },
  info: {
    icon: Info,
    bg: 'bg-white dark:bg-slate-900',
    border: 'border-blue-400/60',
    accent: 'bg-blue-500',
    iconColor: 'text-blue-500',
    label: 'text-slate-800 dark:text-slate-100',
    sub: 'text-slate-500 dark:text-slate-400',
    glow: 'shadow-blue-500/20',
  },
};

// ─── Toast spring variants ────────────────────────────────────────────────────

const toastVariants = {
  initial: { opacity: 0, x: 80, scale: 0.9, filter: 'blur(4px)' },
  animate: {
    opacity: 1,
    x: 0,
    scale: 1,
    filter: 'blur(0px)',
    transition: { type: 'spring', stiffness: 380, damping: 28 },
  },
  exit: {
    opacity: 0,
    x: 60,
    scale: 0.85,
    filter: 'blur(4px)',
    transition: { duration: 0.28, ease: 'easeIn' },
  },
};

// ─── Progress Bar ─────────────────────────────────────────────────────────────

function ProgressBar({ duration, accent, paused }) {
  const [width, setWidth] = useState(100);
  const rafRef = useRef(null);
  const startTimeRef = useRef(null);
  const remainingRef = useRef(duration);
  const pauseStartRef = useRef(null);

  useEffect(() => {
    const tick = (timestamp) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;
      const pct = Math.max(0, 100 - (elapsed / duration) * 100);
      setWidth(pct);
      if (pct > 0) rafRef.current = requestAnimationFrame(tick);
    };

    if (!paused) {
      rafRef.current = requestAnimationFrame(tick);
    }

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [duration, paused]);

  return (
    <div className="absolute bottom-0 left-0 right-0 h-[3px] rounded-b-2xl overflow-hidden bg-black/5 dark:bg-white/5">
      <div
        className={`h-full ${accent} transition-none`}
        style={{ width: `${width}%` }}
      />
    </div>
  );
}

// ─── Individual Toast ─────────────────────────────────────────────────────────

function Toast({ id, message, title, type = 'info', duration = 3000, onRemove }) {
  const cfg = CONFIG[type];
  const Icon = cfg.icon;
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      layout
      variants={toastVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`
        relative pointer-events-auto w-full max-w-sm rounded-2xl border
        ${cfg.bg} ${cfg.border}
        shadow-2xl ${cfg.glow}
        overflow-hidden
      `}
    >
      {/* Left accent stripe */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${cfg.accent} rounded-l-2xl`} />

      <div className="flex items-start gap-3 px-5 py-4 pl-6">
        {/* Icon */}
        <div className={`mt-0.5 flex-shrink-0 ${cfg.iconColor}`}>
          <Icon className="h-5 w-5" strokeWidth={2.2} />
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          {title && (
            <p className={`text-sm font-bold uppercase tracking-wide ${cfg.label}`}>{title}</p>
          )}
          <p className={`text-sm ${title ? `mt-0.5 ${cfg.sub}` : `font-semibold ${cfg.label}`} leading-snug`}>
            {message}
          </p>
        </div>

        {/* Close */}
        <motion.button
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.88 }}
          onClick={() => onRemove(id)}
          className="flex-shrink-0 mt-0.5 p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
        >
          <X className="h-3.5 w-3.5" />
        </motion.button>
      </div>

      {/* Auto-dismiss progress bar */}
      <ProgressBar duration={duration} accent={cfg.accent} paused={hovered} />
    </motion.div>
  );
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const lastToastRef = useRef({ message: '', time: 0 });

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const addToast = useCallback((message, type = 'info', { title, duration = 3000 } = {}) => {
    const now = Date.now();
    // Anti-spam: Ignore identical messages within 500ms
    if (lastToastRef.current.message === message && (now - lastToastRef.current.time < 500)) {
      return;
    }
    
    lastToastRef.current = { message, time: now };
    const id = now + Math.random();
    setToasts(prev => [...prev, { id, message, type, title, duration }]);
    setTimeout(() => removeToast(id), duration + 400); // +400 for exit animation
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}

      {/* Portal-like fixed container — top-right */}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="fixed top-5 right-5 z-[9999] flex flex-col gap-3 w-full max-w-sm pointer-events-none"
      >
        <AnimatePresence mode="popLayout" initial={false}>
          {toasts.map(toast => (
            <Toast
              key={toast.id}
              {...toast}
              onRemove={removeToast}
            />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

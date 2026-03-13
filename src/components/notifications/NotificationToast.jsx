import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, AlertTriangle, Cpu, X, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const typeConfig = {
  order: {
    icon: ShoppingBag,
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20'
  },
  stock: {
    icon: AlertTriangle,
    color: 'text-amber-500',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20'
  },
  system: {
    icon: Cpu,
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20'
  }
};

export default function NotificationToast({ notification, onRemove }) {
  const navigate = useNavigate();
  const config = typeConfig[notification.type] || typeConfig.system;
  const Icon = config.icon;

  const handleAction = () => {
    if (notification.actionPath) {
      navigate(notification.actionPath);
    }
    onRemove(notification.id);
  };

  return (
    <motion.div
      layout
      initial={{ x: 300, opacity: 0, scale: 0.95 }}
      animate={{ x: 0, opacity: 1, scale: 1 }}
      exit={{ x: 300, opacity: 0, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 350, damping: 25 }}
      className={`relative w-80 p-4 bg-white dark:bg-slate-900 rounded-2xl border ${config.border} shadow-2xl overflow-hidden pointer-events-auto`}
    >
      <div className="flex items-start gap-3">
        <div className={`mt-1 p-2 rounded-xl ${config.bg} ${config.color}`}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="flex-1">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
            {notification.type} alert
          </p>
          <p className="text-xs font-bold text-slate-900 dark:text-white leading-relaxed">
            {notification.message}
          </p>
          {notification.actionPath && (
            <button
              onClick={handleAction}
              className={`mt-2 flex items-center gap-1 text-[10px] font-black uppercase tracking-widest ${config.color} hover:underline`}
            >
              View Details <ChevronRight className="h-3 w-3" />
            </button>
          )}
        </div>
        <button
          onClick={() => onRemove(notification.id)}
          className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
      {/* Animated progress bar */}
      <motion.div
        initial={{ width: "100%" }}
        animate={{ width: "0%" }}
        transition={{ duration: 5, ease: "linear" }}
        className={`absolute bottom-0 left-0 h-[2px] ${config.color.replace('text', 'bg')}`}
      />
    </motion.div>
  );
}

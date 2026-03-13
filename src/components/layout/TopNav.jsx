import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Search, Menu, Moon, Sun, Terminal } from 'lucide-react';
import { useTheme } from '../common/ThemeProvider';
import { subscribeToNotifications, markAsRead } from '../../services/notifications';
import NotificationCenter from '../notifications/NotificationCenter';

export default function TopNav() {
  const { theme, toggleTheme } = useTheme();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    const unsubscribe = subscribeToNotifications((updatedNotifications) => {
      setNotifications(updatedNotifications);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="sticky top-0 z-40 flex h-24 flex-shrink-0 bg-white/40 dark:bg-obsidian-900/40 backdrop-blur-xl transition-all duration-500">
      <motion.button
        type="button"
        whileHover={{ scale: 1.1, boxShadow: '0 0 14px 3px rgba(99,102,241,0.25)' }}
        whileTap={{ scale: 0.88 }}
        transition={{ type: 'spring', stiffness: 450, damping: 18 }}
        className="px-6 text-slate-500 hover:text-slate-600 dark:text-slate-400 dark:hover:text-slate-300 focus:outline-none md:hidden rounded-2xl"
      >
        <span className="sr-only">Open sidebar</span>
        <Menu className="h-6 w-6" aria-hidden="true" />
      </motion.button>

      <div className="flex flex-1 justify-between px-8 lg:px-12">
        <div className="flex flex-1 items-center">
          <form className="flex w-full max-w-2xl" action="#" method="GET">
            <label htmlFor="search-field" className="sr-only">
              Search
            </label>
            <div className="relative w-full text-slate-400 focus-within:text-brand-600 transition-colors">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center">
                <Search className="h-4 w-4" aria-hidden="true" />
              </div>
              <input
                id="search-field"
                className="block h-full w-full border-transparent bg-transparent py-4 pl-10 pr-3 text-sm font-bold text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:border-transparent focus:placeholder-slate-300 focus:outline-none focus:ring-0 uppercase tracking-widest"
                placeholder="Query Registry..."
                type="search"
                name="search"
              />
            </div>
          </form>
        </div>
        
        <div className="flex items-center space-x-6">
           {/* System Status Indicator */}
           <div className="hidden lg:flex items-center gap-2 px-4 py-2 bg-white/50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5">
              <Terminal className="h-3 w-3 text-slate-400" />
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active Shell</span>
           </div>

          <motion.button
            onClick={toggleTheme}
            type="button"
            whileHover={{ scale: 1.1, boxShadow: '0 0 18px 4px rgba(99,102,241,0.35)' }}
            whileTap={{ scale: 0.88 }}
            transition={{ type: 'spring', stiffness: 450, damping: 18 }}
            className="group relative rounded-2xl bg-white dark:bg-white/5 p-3 text-slate-400 hover:text-brand-600 transition-colors border border-slate-100 dark:border-white/5"
          >
            <span className="sr-only">Toggle theme</span>
            <div className="absolute inset-0 bg-brand-500 blur-lg opacity-0 group-hover:opacity-20 transition-opacity"></div>
            {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </motion.button>

          <div className="relative">
            <motion.button
              type="button"
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              whileHover={{ scale: 1.1, boxShadow: '0 0 18px 4px rgba(99,102,241,0.35)' }}
              whileTap={{ scale: 0.88 }}
              transition={{ type: 'spring', stiffness: 450, damping: 18 }}
              className="group relative rounded-2xl bg-white dark:bg-white/5 p-3 text-slate-400 hover:text-brand-600 transition-colors border border-slate-100 dark:border-white/5"
            >
              <span className="sr-only">View notifications</span>
              <div className="absolute inset-0 bg-brand-500 blur-lg opacity-0 group-hover:opacity-20 transition-opacity"></div>
              <Bell className="h-5 w-5" aria-hidden="true" />
              {unreadCount > 0 && (
                <span className="absolute top-2.5 right-2.5 block h-2 w-2 rounded-full bg-brand-600 ring-2 ring-white dark:ring-[#020617]" />
              )}
            </motion.button>
            
            <AnimatePresence>
              {isNotificationsOpen && (
                <NotificationCenter 
                  notifications={notifications}
                  onClose={() => setIsNotificationsOpen(false)}
                  onMarkAsRead={(id) => markAsRead(id)}
                  onClearAll={() => {/* Optional: Add clear all logic if needed */}}
                />
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';

import { AnimatePresence } from 'framer-motion';
import Sidebar from './Sidebar';
import TopNav from './TopNav';
import { subscribeToNotifications } from '../../services/notifications';
import NotificationToast from '../notifications/NotificationToast';

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeToasts, setActiveToasts] = useState([]);

  useEffect(() => {
    // Listen for new notifications to show as toasts
    const unsubscribe = subscribeToNotifications((notifications) => {
      // Only toast notifications from the last 10 seconds to avoid flooding old ones
      const now = Date.now();
      const newNotifications = notifications.filter(n => {
        const timestamp = n.createdAt?.toDate ? n.createdAt.toDate().getTime() : now;
        return (now - timestamp) < 10000 && !n.read;
      });

      // Filter out notifications we've already shown
      setActiveToasts(prev => {
        const prevIds = prev.map(t => t.id);
        const filteredNew = newNotifications.filter(n => !prevIds.includes(n.id));
        return [...prev, ...filteredNew].slice(-3); // Show max 3 recent toasts
      });
    });

    return () => unsubscribe();
  }, []);

  const removeToast = (id) => {
    setActiveToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-obsidian-900 overflow-hidden transition-colors duration-500 font-sans selection:bg-brand-500/30">
      {/* Nebula Background */}
      <div className="nebula-bg">
        <div className="nebula-blob w-[500px] h-[500px] bg-aurora-violet top-[-10%] left-[-10%] animate-aurora"></div>
        <div className="nebula-blob w-[600px] h-[600px] bg-aurora-cyan bottom-[-20%] right-[-10%] delay-1000 animate-aurora"></div>
        <div className="nebula-blob w-[300px] h-[300px] bg-violet-500 top-1/2 left-1/3 animate-[pulse_10s_infinite]"></div>
      </div>

      {sidebarOpen && <button aria-label="Close sidebar" className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={() => setSidebarOpen(false)} />}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col md:pl-64 transition-all duration-300 relative z-10">
        <TopNav onOpenSidebar={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-10">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>

      {/* Real-time Notifications Portal */}
      <div className="fixed top-5 right-5 z-[100] flex flex-col gap-3 pointer-events-none">
        <AnimatePresence mode="popLayout">
          {activeToasts.map((toast) => (
            <NotificationToast 
              key={toast.id} 
              notification={toast} 
              onRemove={removeToast} 
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

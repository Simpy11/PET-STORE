import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { LayoutDashboard, PackagePlus, Boxes, ShoppingCart, BarChart3, Store, Cpu, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const menuItems = [
  { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
  { name: 'Inventory', icon: Boxes, path: '/inventory' },
  { name: 'Add Product', icon: PackagePlus, path: '/add' },
  { name: 'Orders', icon: ShoppingCart, path: '/orders' },
  { name: 'Analytics', icon: BarChart3, path: '/analytics' },
  { name: 'Activity Logs', icon: Activity, path: '/logs' },
];

export default function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 w-64 bg-obsidian-900 border-r border-white/5 flex flex-col transition-all duration-500 z-50">
      {/* Brand area */}
      <div className="flex h-24 items-center flex-shrink-0 px-8">
        <div className="relative group">
           <div className="absolute inset-0 bg-brand-600 blur-lg opacity-40 group-hover:opacity-100 transition-opacity"></div>
           <div className="relative bg-brand-600 p-2 rounded-2xl shadow-2xl shadow-brand-500/20">
              <Store className="h-6 w-6 text-white" />
           </div>
        </div>
        <div className="ml-4">
           <span className="block text-xs font-black text-white tracking-[0.3em] uppercase font-display leading-tight">Pet Store</span>
           <span className="block text-brand-500 text-[10px] font-bold tracking-widest uppercase">HQ Control</span>
        </div>
      </div>
      
      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4 px-6 space-y-10">
        <div>
          <h3 className="px-3 text-[10px] font-bold text-slate-600 dark:text-slate-500 uppercase tracking-[0.25em] mb-6">Operations</h3>
          <nav className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  className={({ isActive }) =>
                    `group relative flex items-center px-4 py-4 text-xs font-bold rounded-2xl transition-all duration-500 outline-none ${
                      isActive ? 'text-white' : 'text-slate-500 hover:text-white/80'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {/* Animated Active Background */}
                      <AnimatePresence>
                        {isActive && (
                          <motion.div
                            layoutId="active-pill"
                            className="absolute inset-0 bg-brand-600 rounded-2xl shadow-2xl shadow-brand-600/20 z-0"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                          />
                        )}
                      </AnimatePresence>

                      <div className="relative z-10 flex items-center w-full">
                        <Icon
                          className={`mr-4 h-4 w-4 transition-all duration-500 ${
                            isActive ? 'text-white scale-110' : 'text-slate-600 group-hover:text-white group-hover:scale-110'
                          }`}
                        />
                        <span className="uppercase tracking-[0.1em]">{item.name}</span>
                        {isActive && (
                          <motion.div 
                            layoutId="active-dot"
                            className="absolute right-0 w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.8)]"
                          />
                        )}
                      </div>
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        <div>
          <h3 className="px-3 text-[10px] font-bold text-slate-600 dark:text-slate-500 uppercase tracking-[0.25em] mb-6">Systems</h3>
          <div className="space-y-3 px-1">
             <Link to="/inventory" className="flex items-center gap-3 px-4 py-3 text-[10px] font-bold text-slate-500 hover:text-brand-400 transition-all bg-white/5 rounded-2xl border border-white/5 hover:border-brand-500/20 uppercase tracking-widest">
                <Cpu className="h-3 w-3" /> System Logs
             </Link>
             <Link to="/orders" className="flex items-center gap-3 px-4 py-3 text-[10px] font-bold text-slate-500 hover:text-brand-400 transition-all bg-white/5 rounded-2xl border border-white/5 hover:border-brand-500/20 uppercase tracking-widest mt-2">
                <Activity className="h-3 w-3" /> Telemetry
             </Link>
          </div>
        </div>
      </div>
      
      {/* Identity Footer */}
      <div className="p-6">
        <div className="glass-card !bg-white/5 rounded-[2rem] p-5 border border-white/10 flex items-center gap-4 group cursor-pointer hover:border-brand-500/30 transition-all">
          <div className="relative">
            <img
              className="h-10 w-10 rounded-2xl ring-2 ring-brand-500/20 bg-brand-500/10 p-1 group-hover:scale-110 transition-transform"
              src="https://ui-avatars.com/api/?name=Admin+User&background=6366f1&color=fff"
              alt="Admin"
            />
            <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-emerald-500 border-2 border-obsidian-900 rounded-full animate-pulse"></div>
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-extrabold text-white truncate uppercase tracking-tighter">Administrator</p>
            <p className="text-[8px] font-black text-brand-500 uppercase tracking-widest mt-0.5">Verified Link</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

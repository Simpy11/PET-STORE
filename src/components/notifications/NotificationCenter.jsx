import { Bell, BellOff, Check, Trash2, ExternalLink, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const timeSince = (date) => {
  const seconds = Math.floor((new Date() - date) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " years ago";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " months ago";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " days ago";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " hours ago";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " minutes ago";
  return Math.floor(seconds) + " seconds ago";
};

export default function NotificationCenter({ notifications, onClose, onMarkAsRead, onClearAll }) {
  const navigate = useNavigate();
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 20, y: -20, scale: 0.95 }}
      className="absolute top-16 right-0 w-80 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-2xl overflow-hidden z-[100]"
    >
      <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div>
           <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Notifications</h3>
           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
             {unreadCount} Unread Manifestations
           </p>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all">
          <X className="h-4 w-4 text-slate-400" />
        </button>
      </div>

      <div className="max-h-[400px] overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center opacity-30">
            <BellOff className="h-8 w-8 mb-3" />
            <p className="text-[10px] font-bold uppercase tracking-widest">Clear Signal</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50 dark:divide-slate-800/50">
            {notifications.slice(0, 10).map((n) => (
              <div 
                key={n.id}
                className={`p-5 flex gap-4 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50 ${!n.read ? 'bg-brand-500/[0.03]' : ''}`}
              >
                <div className={`h-2 w-2 mt-1.5 rounded-full shrink-0 ${!n.read ? 'bg-brand-500' : 'bg-slate-300 dark:bg-slate-700'}`} />
                <div className="flex-1">
                  <p className={`text-xs ${!n.read ? 'font-bold text-slate-900 dark:text-white' : 'font-medium text-slate-500'}`}>
                    {n.message}
                  </p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                      {n.createdAt?.toDate ? timeSince(n.createdAt.toDate()) : 'Just now'}
                    </span>
                    <div className="flex items-center gap-2">
                       {!n.read && (
                         <button 
                           onClick={() => onMarkAsRead(n.id)}
                           className="p-1 px-2 bg-brand-500/10 text-brand-600 dark:text-brand-400 rounded-lg text-[9px] font-black uppercase tracking-widest"
                         >
                           Read
                         </button>
                       )}
                       {n.actionPath && (
                         <button 
                           onClick={() => { navigate(n.actionPath); onClose(); }}
                           className="p-1.5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-lg"
                         >
                           <ExternalLink className="h-3 w-3" />
                         </button>
                       )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {notifications.length > 0 && (
        <div className="p-4 bg-slate-50/50 dark:bg-slate-950/50 border-t border-slate-100 dark:border-slate-800">
           <button 
             onClick={onClearAll}
             className="w-full py-2.5 flex items-center justify-center gap-2 text-[10px] font-black text-slate-400 hover:text-rose-500 transition-colors uppercase tracking-widest"
           >
              <Trash2 className="h-3.5 w-3.5" /> Purge History
           </button>
        </div>
      )}
    </motion.div>
  );
}

import React from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useData } from '../context/DataContext';
import { IndianRupee, CheckSquare, Award, Clock, Bell, Megaphone } from 'lucide-react';
import { cn } from '../lib/utils';
import api from '../lib/api';

export default function Notifications() {
  const { realNotifications, setRealNotifications } = useData();
  
  const handleMarkAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setRealNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (error) {
      console.error('Failed to mark as read', error);
    }
  };

  const handleMarkAllRead = async () => {
    // In a real app, you'd have a bulk update endpoint. For now we just map locally
    // or call the endpoint for each (not recommended for many).
    // Assuming we just map locally for visual update
    setRealNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="hidden sm:block">
          <h1 className="text-3xl font-heading font-bold text-zinc-900 dark:text-white tracking-tight">Notifications</h1>
          <p className="mt-1 text-sm text-zinc-400 dark:text-zinc-500">Stay updated on important activities.</p>
        </div>
        <div className="w-full sm:w-auto flex justify-end">
          <Button variant="outline" size="sm" onClick={handleMarkAllRead}>Mark all as read</Button>
        </div>
      </div>

      <Card>
        <div className="divide-y divide-zinc-800">
          {(!realNotifications || realNotifications.length === 0) && <p className="p-6 text-center text-zinc-400 dark:text-zinc-500 dark:text-zinc-400">No notifications yet.</p>}
          {realNotifications && realNotifications.map(notification => (
            <div key={notification._id} 
                 onClick={() => !notification.isRead && handleMarkAsRead(notification._id)}
                 className={cn(
                   "p-4 sm:p-6 flex items-start gap-4 transition-colors cursor-pointer",
                   notification.isRead ? "bg-transparent" : "bg-red-50/50 dark:bg-red-900/10 backdrop-blur-xl"
                 )}>
               <div className={cn(
                 "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center border",
                 notification.type === 'fee' ? 'bg-green-900/30 text-green-500 border-green-500/20' : 
                 'bg-blue-900/30 text-blue-500 border-blue-500/20'
               )}>
                  {notification.type === 'fee' ? <IndianRupee className="w-5 h-5" /> : <Megaphone className="w-5 h-5" />}
               </div>
               <div className="flex-1">
                 <div className="flex justify-between items-start">
                   <p className={cn("text-sm text-zinc-900 dark:text-zinc-100", notification.isRead ? "font-normal" : "font-bold")}>
                     {notification.title}
                   </p>
                   <span className="text-xs text-zinc-400 dark:text-zinc-500 dark:text-zinc-400 whitespace-nowrap ml-4">
                     {new Date(notification.createdAt || Date.now()).toLocaleDateString()}
                   </span>
                 </div>
                 <p className="text-sm text-zinc-400 dark:text-zinc-500 dark:text-zinc-400 mt-1">{notification.body}</p>
               </div>
               {!notification.isRead && (
                 <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5 flex-shrink-0"></div>
               )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

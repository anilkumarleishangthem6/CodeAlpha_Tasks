import { useState, useEffect } from 'react';
import socket from '../socket';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    socket.on('notification', (data) => {
      const id = Date.now();
      setNotifications((prev) => [...prev, { id, ...data, exiting: false }]);

      // start exit animation after 2.7s
      setTimeout(() => {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, exiting: true } : n))
        );
      }, 2700);

      // remove after 3s
      setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
      }, 3000);
    });

    return () => {
      socket.off('notification');
    };
  }, []);

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 items-center">
      {notifications.map((n) => (
        <div
          key={n.id}
          className={`bg-[#111111] border border-white/10 rounded-xl px-5 py-3 text-sm text-white shadow-lg flex items-center gap-3 whitespace-nowrap ${
            n.exiting ? 'notification-exit' : 'notification-enter'
          }`}
        >
          <div className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
          {n.message}
        </div>
      ))}
    </div>
  );
};

export default Notifications;
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Wheat, LogOut, User, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../api/api';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 10000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const res = await api.get('/notification');
      setNotifications(res.data);
    } catch (err) {
      // Only log once to avoid console spam
      if (!window.notificationErrorLogged) {
        console.error('Failed to fetch notifications. Check if backend is running on the same port.');
        window.notificationErrorLogged = true;
      }
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const markAsRead = async (id) => {
    try {
      await api.put(`/notification/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
    } catch (err) {
      console.error('Failed to mark as read');
    }
  };

  const markAllAsRead = async () => {
    try {
      const unread = notifications.filter(n => !n.read);
      await Promise.all(unread.map(n => api.put(`/notification/${n._id}/read`)));
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error('Failed to mark all as read');
    }
  };

  return (
    <nav className="bg-white border-b border-black/5 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center gap-2">
            <Wheat className="text-primary w-8 h-8" />
            <span className="text-xl font-bold tracking-tight">GrainTrust AI</span>
          </Link>

          <div className="flex items-center gap-6">
            {user ? (
              <>
                <div className="relative">
                  <button 
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative p-2 text-gray-400 hover:text-black transition-colors"
                  >
                    <Bell className="w-6 h-6" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-black/5 overflow-hidden z-[100]">
                      <div className="p-4 border-b border-black/5 flex justify-between items-center bg-gray-50/50">
                        <h3 className="font-bold text-sm">Notifications</h3>
                        <div className="flex items-center gap-2">
                          {unreadCount > 0 && (
                            <button 
                              onClick={markAllAsRead}
                              className="text-[10px] text-primary hover:underline font-bold"
                            >
                              Mark all as read
                            </button>
                          )}
                          <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">
                            {unreadCount} New
                          </span>
                        </div>
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="p-8 text-center text-gray-400 text-sm">
                            No notifications yet
                          </div>
                        ) : (
                          notifications.map(n => (
                            <div 
                              key={n._id} 
                              onClick={() => !n.read && markAsRead(n._id)}
                              className={`p-4 border-b border-black/5 cursor-pointer hover:bg-gray-50 transition-colors ${!n.read ? 'bg-primary/5 border-l-4 border-l-primary' : ''}`}
                            >
                              <div className="flex justify-between items-start gap-2">
                                <p className="font-bold text-xs mb-1">{n.title}</p>
                                {!n.read && <div className="w-2 h-2 bg-primary rounded-full mt-1 shrink-0" />}
                              </div>
                              <p className="text-xs text-gray-500 leading-relaxed">{n.message}</p>
                              <p className="text-[10px] text-gray-400 mt-2">{new Date(n.createdAt).toLocaleTimeString()}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <Link 
                  to={user.role === 'farmer' ? '/farmer-dashboard' : '/mill-dashboard'}
                  className="text-sm font-medium text-black/60 hover:text-black flex items-center gap-2"
                >
                  <User className="w-4 h-4" />
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-sm font-medium text-red-600 hover:text-red-700 flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm font-medium text-black/60 hover:text-black">
                  Sign In
                </Link>
                <Link to="/register" className="bg-primary text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary/90 transition-all">
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Bell, ChevronDown, Globe, Loader2, X, Menu } from 'lucide-react';
import { useLanguage, LANGUAGES } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { getNotifications, getUnreadCount, markAsRead, markAllAsRead, subscribeToNotifications } from '../services/notifications';

const Header = ({ onMenuToggle }) => {
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const [isNotifDropdownOpen, setIsNotifDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingNotifs, setLoadingNotifs] = useState(false);
  
  const { currentLanguage, changeLanguage, isTranslating } = useLanguage();
  const { user } = useAuth();

  const selectedLang = LANGUAGES.find(l => l.code === currentLanguage) || LANGUAGES[0];
  
  const displayName = user?.user_metadata?.username || user?.email?.split('@')[0] || 'User';
  const initials = displayName.slice(0, 2).toUpperCase();

  // Fetch notifications
  useEffect(() => {
    async function fetchNotifications() {
      if (!user) return;

      setLoadingNotifs(true);
      try {
        const [notifs, count] = await Promise.all([
          getNotifications(10),
          getUnreadCount(),
        ]);
        setNotifications(notifs || []);
        setUnreadCount(count || 0);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        setLoadingNotifs(false);
      }
    }

    fetchNotifications();

    // Subscribe to realtime notifications
    const unsubscribe = subscribeToNotifications((newNotif) => {
      setNotifications(prev => [newNotif, ...prev]);
      setUnreadCount(prev => prev + 1);
    });

    return () => unsubscribe();
  }, [user]);

  const handleMarkAsRead = async (notifId) => {
    try {
      await markAsRead(notifId);
      setNotifications(prev => 
        prev.map(n => n.id === notifId ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 fixed top-0 left-0 lg:left-64 right-0 z-30">
      {/* Mobile Menu Button */}
      <button
        onClick={onMenuToggle}
        className="p-2 text-gray-500 hover:bg-gray-100 rounded-xl lg:hidden mr-2"
        aria-label="Toggle menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Search Bar */}
      <div className="flex-1 max-w-2xl">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            className="w-full pl-12 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm sm:text-base"
          />
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2 sm:gap-4 ml-2 sm:ml-6">
        {/* Translation Indicator - hidden on mobile */}
        {isTranslating && (
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-sm">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Translating...</span>
          </div>
        )}

        {/* Language Switcher */}
        <div className="relative">
          <button
            onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
            className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <Globe className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700 hidden sm:inline">{selectedLang.flag} {selectedLang.name}</span>
            <span className="text-sm sm:hidden">{selectedLang.flag}</span>
            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform hidden sm:block ${isLangDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {isLangDropdownOpen && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setIsLangDropdownOpen(false)} 
              />
              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50 max-h-80 overflow-y-auto">
                <div className="px-3 py-2 border-b border-gray-100">
                  <p className="text-xs font-medium text-gray-400 uppercase">Select Language</p>
                </div>
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      changeLanguage(lang.code);
                      setIsLangDropdownOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-gray-50 transition-colors ${
                      currentLanguage === lang.code ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                    }`}
                  >
                    <span className="text-lg">{lang.flag}</span>
                    <span className="text-sm font-medium">{lang.name}</span>
                    {currentLanguage === lang.code && (
                      <span className="ml-auto text-blue-500">✓</span>
                    )}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Notifications */}
        <div className="relative">
          <button 
            onClick={() => setIsNotifDropdownOpen(!isNotifDropdownOpen)}
            className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {isNotifDropdownOpen && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setIsNotifDropdownOpen(false)} 
              />
              <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 z-50 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                  <p className="font-semibold text-gray-900">Notifications</p>
                  {unreadCount > 0 && (
                    <button 
                      onClick={handleMarkAllAsRead}
                      className="text-xs text-blue-500 hover:underline"
                    >
                      Mark all read
                    </button>
                  )}
                </div>
                
                <div className="max-h-80 overflow-y-auto">
                  {loadingNotifs ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
                    </div>
                  ) : notifications.length > 0 ? (
                    notifications.map((notif) => (
                      <div 
                        key={notif.id}
                        onClick={() => !notif.is_read && handleMarkAsRead(notif.id)}
                        className={`px-4 py-3 border-b border-gray-50 hover:bg-gray-50 cursor-pointer ${
                          !notif.is_read ? 'bg-blue-50/50' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <p className={`text-sm ${!notif.is_read ? 'font-medium text-gray-900' : 'text-gray-700'}`}>
                              {notif.title}
                            </p>
                            {notif.body && (
                              <p className="text-xs text-gray-500 mt-1 line-clamp-2">{notif.body}</p>
                            )}
                            <p className="text-xs text-gray-400 mt-1">{notif.createdAt}</p>
                          </div>
                          {!notif.is_read && (
                            <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1.5" />
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-8 text-center text-sm text-gray-500">
                      No notifications yet
                    </div>
                  )}
                </div>

                <Link 
                  to="/notifications"
                  className="block px-4 py-3 text-center text-sm text-blue-500 hover:bg-gray-50 border-t border-gray-100"
                >
                  View all notifications
                </Link>
              </div>
            </>
          )}
        </div>

        {/* Profile */}
        <Link 
          to="/profile"
          className="flex items-center gap-1 sm:gap-3 pl-2 sm:pl-3 pr-2 sm:pr-4 py-2 hover:bg-gray-50 rounded-xl transition-colors"
        >
          <div className="w-8 h-8 bg-gradient-to-br from-[#137fec] to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
            {initials}
          </div>
          <span className="text-sm font-medium text-gray-700 hidden sm:block">{displayName}</span>
          <ChevronDown className="w-4 h-4 text-gray-400 hidden sm:block" />
        </Link>
      </div>
    </header>
  );
};

export default Header;

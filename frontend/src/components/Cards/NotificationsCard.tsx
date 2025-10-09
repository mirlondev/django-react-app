import React, { useState, useEffect } from "react";
import { Bell, Clock, CheckCircle, X, BellRing, Eye, MoreHorizontal } from "lucide-react";
import { notificationsAPI } from "../../services/api";
import { Link } from "react-router-dom";

const NotificationsCard = ({ onClose }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setError(null);
      const response = await notificationsAPI.getAll();
      setNotifications(response.data);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      setError("Erreur lors du chargement des notifications");
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await notificationsAPI.markAsRead(id);
      setNotifications(notifications.map(notif => 
        notif.id === id ? { ...notif, is_read: true } : notif
      ));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationsAPI.markAllAsRead();
      setNotifications(notifications.map(notif => ({ ...notif, is_read: true })));
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  const getNotificationIcon = (title, isRead) => {
    const iconProps = { 
      className: `w-4 h-4 ${isRead ? 'text-gray-400' : 'text-blue-500'}` 
    };
    
    const titleLower = title.toLowerCase();
    
    if (titleLower.includes('assigné') || titleLower.includes('assignment')) {
      return <Bell {...iconProps} />;
    } else if (titleLower.includes('system') || titleLower.includes('système')) {
      return <BellRing {...iconProps} />;
    } else if (titleLower.includes('créé') || titleLower.includes('created')) {
      return <BellRing {...iconProps} />;
    } else {
      return <Bell {...iconProps} />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit'
    });
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  if (loading) {
    return (
      <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
        <div className="p-6">
          <div className="flex justify-center items-center space-x-2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            <span className="text-gray-600 dark:text-gray-300">Chargement...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
        <div className="p-4 text-center">
          <div className="text-red-500 mb-2">⚠️</div>
          <p className="text-gray-600 dark:text-gray-300 mb-4">{error}</p>
          <button 
            onClick={fetchNotifications}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute right-0 mt-3 w-96 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-100/50 dark:border-gray-800/50 z-50 max-h-[32rem] overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-gray-800/50 dark:to-gray-700/50">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <BellRing className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              {unreadCount > 0 && (
                <div className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </div>
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Notifications</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {notifications.length} notification(s)
                {unreadCount > 0 && ` • ${unreadCount} non lue(s)`}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            {unreadCount > 0 && (
              <button 
                onClick={markAllAsRead}
                className="group relative inline-flex items-center justify-center p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200"
                title="Marquer tout comme lu"
              >
                <Eye className="w-4 h-4" />
              </button>
            )}
            <button 
              onClick={onClose}
              className="group relative inline-flex items-center justify-center p-2 text-gray-400 hover:text-red-500 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200"
              title="Fermer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Notifications List */}
      <div className="max-h-80 overflow-y-auto custom-scrollbar">
        {notifications.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
              <Bell className="w-8 h-8 text-gray-400" />
            </div>
            <h4 className="text-gray-900 dark:text-white font-medium mb-2">Aucune notification</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">Vous êtes à jour !</p>
          </div>
        ) : (
          notifications.map((notification, index) => (
            <div
              key={notification.id}
              className={`group relative p-4 border-b border-gray-100 dark:border-gray-800 last:border-b-0 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-all duration-200 ${
                !notification.is_read && 'bg-blue-50/30 dark:bg-blue-900/10'
              }`}
            >
              <div className="flex items-start space-x-3">
                {/* Notification Icon */}
                <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${
                  notification.is_read 
                    ? 'bg-gray-100 dark:bg-gray-800' 
                    : 'bg-blue-100 dark:bg-blue-900/30'
                }`}>
                  {getNotificationIcon(notification.title, notification.is_read)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className={`font-semibold text-sm ${
                      notification.is_read 
                        ? 'text-gray-700 dark:text-gray-300' 
                        : 'text-gray-900 dark:text-white'
                    }`}>
                      {notification.title}
                    </h4>
                    {!notification.is_read && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 leading-relaxed">
                    {notification.message}
                  </p>
                  
                  {notification.ticket_details && (
                    <div className="inline-flex items-center px-2 py-1 bg-blue-100 dark:bg-blue-900/30 rounded-lg mb-2">
                      <Link to={`/tickets/${notification.ticket_details.id}`}>
                     
                      <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
                        #{notification.ticket_details.code}
                      </span>

                      <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
                        #{notification.ticket_details.title}
                      </span>
                      </Link>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400 dark:text-gray-500 flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {formatDate(notification.created_at)}
                    </span>
                    
                    {!notification.is_read && (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsRead(notification.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 inline-flex items-center justify-center w-7 h-7 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-all duration-200"
                        title="Marquer comme lu"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      
      {/* Footer */}
      {notifications.length > 0 && (
        <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
          <button 
            onClick={() => window.location.href = '/notifications'}
            className="w-full inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-xl transition-all duration-200"
          >
            <MoreHorizontal className="w-4 h-4 mr-2" />
            Voir toutes les notifications
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationsCard;
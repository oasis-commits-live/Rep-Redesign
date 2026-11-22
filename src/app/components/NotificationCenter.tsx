import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router';
import {
  Bell, X, Heart, MessageCircle, UserPlus, Sparkles,
  Loader2, ChevronRight,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { AppNotification } from '../data/api';
import { fetchNotifications, markNotificationsRead } from '../data/api';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  onUnreadCountChange?: (count: number) => void;
}

export function NotificationCenter({ isOpen, onClose, onUnreadCountChange }: NotificationCenterProps) {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const loadNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const { notifications: notifs, unreadCount: uc } = await fetchNotifications();
      setNotifications(notifs);
      setUnreadCount(uc);
      onUnreadCountChange?.(uc);

      // Auto-mark all as read when panel opens
      if (uc > 0) {
        try {
          await markNotificationsRead();
          setNotifications(notifs.map(n => ({ ...n, read: true })));
          setUnreadCount(0);
          onUnreadCountChange?.(0);
        } catch (markErr) {
          console.log('[Notifications] Auto mark-read error:', markErr);
        }
      }
    } catch (err) {
      console.log('[Notifications] Load error:', err);
    } finally {
      setLoading(false);
    }
  }, [onUnreadCountChange]);

  useEffect(() => {
    if (isOpen) {
      loadNotifications();
    }
  }, [isOpen, loadNotifications]);

  const handleNotificationTap = (notif: AppNotification) => {
    if (notif.type === 'follow_back' && notif.fromUserId) {
      navigate(`/athlete/${notif.fromUserId}`);
      onClose();
    } else if ((notif.type === 'like' || notif.type === 'comment') && notif.fromUserId) {
      navigate(`/athlete/${notif.fromUserId}`);
      onClose();
    }
  };

  const timeAgo = (dateStr: string) => {
    try {
      return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
    } catch {
      return '';
    }
  };

  const getNotifIcon = (type: string) => {
    switch (type) {
      case 'follow_back':
        return <UserPlus className="w-4 h-4 text-[#34C759]" />;
      case 'like':
        return <Heart className="w-4 h-4 text-[#FF3B30]" fill="#FF3B30" />;
      case 'comment':
        return <MessageCircle className="w-4 h-4 text-[#007AFF]" />;
      case 'app_update':
        return <Sparkles className="w-4 h-4 text-[#FF9500]" />;
      default:
        return <Bell className="w-4 h-4 text-[#8e8e93]" />;
    }
  };

  const getNotifText = (notif: AppNotification) => {
    switch (notif.type) {
      case 'follow_back':
        return (
          <span>
            <span style={{ fontWeight: 600 }}>{notif.fromDisplayName}</span>
            {' '}started following you
          </span>
        );
      case 'like':
        return (
          <span>
            <span style={{ fontWeight: 600 }}>{notif.fromDisplayName}</span>
            {' '}liked your workout{notif.activityName ? ` "${notif.activityName}"` : ''}
          </span>
        );
      case 'comment':
        return (
          <span>
            <span style={{ fontWeight: 600 }}>{notif.fromDisplayName}</span>
            {' '}commented on your workout{notif.activityName ? ` "${notif.activityName}"` : ''}
            {notif.commentText && (
              <span className="text-[#636366]">: "{notif.commentText}"</span>
            )}
          </span>
        );
      case 'app_update':
        return (
          <span>
            <span style={{ fontWeight: 600 }}>{notif.title || 'App Update'}</span>
            {notif.message && ` — ${notif.message}`}
          </span>
        );
      default:
        return <span>New notification</span>;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 400, damping: 35 }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-[400px] bg-[#f5f5f7] dark:bg-black z-[101] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-14 pb-4">
              <h2
                className="text-[24px] text-[#1c1c1e] tracking-[-0.4px]"
                style={{ fontWeight: 700 }}
              >
                Notifications
              </h2>
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-[rgba(229,229,234,0.8)] flex items-center justify-center"
              >
                <X className="w-[18px] h-[18px] text-[#636366]" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-6 pb-8">
              {loading ? (
                <div className="flex flex-col items-center py-20">
                  <Loader2 className="w-6 h-6 text-[#34C759] animate-spin mb-3" />
                  <p className="text-[14px] text-[#8e8e93]">Loading notifications...</p>
                </div>
              ) : notifications.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center py-20"
                >
                  <div className="w-16 h-16 rounded-full bg-[rgba(52,199,89,0.08)] flex items-center justify-center mb-4">
                    <Bell className="w-7 h-7 text-[#34C759]" />
                  </div>
                  <p
                    className="text-[17px] text-[#1c1c1e] mb-1"
                    style={{ fontWeight: 600 }}
                  >
                    All caught up
                  </p>
                  <p className="text-[14px] text-[#8e8e93] text-center max-w-[240px]">
                    You'll be notified when someone follows you, likes or comments on your workouts.
                  </p>
                </motion.div>
              ) : (
                <div className="flex flex-col gap-2">
                  {notifications.map((notif, i) => (
                    <motion.button
                      key={notif.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.02 }}
                      onClick={() => handleNotificationTap(notif)}
                      className={`w-full flex items-start gap-3 p-4 rounded-[18px] text-left transition-colors ${
                        notif.read
                          ? 'bg-white'
                          : 'bg-[rgba(52,199,89,0.06)]'
                      } shadow-[0px_1px_2px_0px_rgba(0,0,0,0.03)]`}
                    >
                      {/* Avatar or icon */}
                      <div className="flex-shrink-0 mt-0.5">
                        {notif.fromAvatarUrl ? (
                          <div className="w-10 h-10 rounded-full overflow-hidden relative">
                            <img
                              src={notif.fromAvatarUrl}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-white flex items-center justify-center">
                              {getNotifIcon(notif.type)}
                            </div>
                          </div>
                        ) : notif.fromDisplayName ? (
                          <div className="w-10 h-10 rounded-full bg-[#34C759] flex items-center justify-center relative">
                            <span
                              className="text-white text-[15px]"
                              style={{ fontWeight: 600 }}
                            >
                              {notif.fromDisplayName.charAt(0).toUpperCase()}
                            </span>
                            <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-white flex items-center justify-center">
                              {getNotifIcon(notif.type)}
                            </div>
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-[rgba(255,149,0,0.1)] flex items-center justify-center">
                            {getNotifIcon(notif.type)}
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p className="text-[14px] text-[#1c1c1e] leading-[1.4]">
                          {getNotifText(notif)}
                        </p>
                        <p className="text-[12px] text-[#8e8e93] mt-1">
                          {timeAgo(notif.createdAt)}
                        </p>
                      </div>

                      {/* Unread dot */}
                      {!notif.read && (
                        <div className="w-2.5 h-2.5 rounded-full bg-[#34C759] flex-shrink-0 mt-1.5" />
                      )}

                      {/* Navigate hint for tappable notifications */}
                      {(notif.type === 'follow_back' || notif.type === 'like' || notif.type === 'comment') && (
                        <ChevronRight className="w-4 h-4 text-[#c7c7cc] flex-shrink-0 mt-1" />
                      )}
                    </motion.button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ── Standalone bell icon button with badge ──
export function NotificationBell({
  unreadCount,
  onClick,
}: {
  unreadCount: number;
  onClick: () => void;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      className="relative w-10 h-10 rounded-[14px] bg-[rgba(229,229,234,0.7)] flex items-center justify-center"
    >
      <Bell className="w-[18px] h-[18px] text-[#636366]" />
      {unreadCount > 0 && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full bg-[#FF3B30] flex items-center justify-center px-1"
        >
          <span
            className="text-white text-[10px] leading-none"
            style={{ fontWeight: 700 }}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        </motion.div>
      )}
    </motion.button>
  );
}
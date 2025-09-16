import React, { useState } from 'react';
import { Bell, X, Check, Clock, AlertCircle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'booking_created' | 'booking_confirmed' | 'booking_cancelled' | 'booking_completed' | 'booking_reminder' | 'payment_received' | 'payment_failed' | 'system';
  isRead: boolean;
  createdAt: string;
  relatedId?: string;
  relatedType?: string;
  link?: string;
}

interface NotificationCenterProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onNotificationClick: (notification: Notification) => void;
}

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'booking_created':
    case 'booking_confirmed':
      return <Check className="h-4 w-4 text-green-500" />;
    case 'booking_cancelled':
      return <X className="h-4 w-4 text-red-500" />;
    case 'booking_reminder':
      return <Clock className="h-4 w-4 text-blue-500" />;
    case 'payment_received':
      return <Check className="h-4 w-4 text-green-500" />;
    case 'payment_failed':
      return <AlertCircle className="h-4 w-4 text-red-500" />;
    default:
      return <Info className="h-4 w-4 text-gray-500" />;
  }
};

const getNotificationColor = (type: string) => {
  switch (type) {
    case 'booking_created':
    case 'booking_confirmed':
    case 'payment_received':
      return 'bg-green-50 border-green-200';
    case 'booking_cancelled':
    case 'payment_failed':
      return 'bg-red-50 border-red-200';
    case 'booking_reminder':
      return 'bg-blue-50 border-blue-200';
    case 'booking_completed':
      return 'bg-purple-50 border-purple-200';
    default:
      return 'bg-gray-50 border-gray-200';
  }
};

const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'À l\'instant';
  if (diffInMinutes < 60) return `Il y a ${diffInMinutes} min`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `Il y a ${diffInHours}h`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `Il y a ${diffInDays}j`;
  
  return date.toLocaleDateString('fr-FR');
};

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onNotificationClick,
}) => {
  // Debug logs pour vérifier les props
  console.log('🎯 [NotificationCenter] Component rendered with props:', {
    notificationsCount: notifications?.length || 0,
    notifications: notifications,
    hasOnMarkAsRead: !!onMarkAsRead,
    hasOnMarkAllAsRead: !!onMarkAllAsRead,
    hasOnNotificationClick: !!onNotificationClick
  });
  
  const [isOpen, setIsOpen] = useState(false);
  const unreadCount = notifications.filter(n => !n.isRead).length;
  
  console.log('📊 [NotificationCenter] Calculated unreadCount:', unreadCount);

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      onMarkAsRead(notification.id);
    }
    onNotificationClick(notification);
    setIsOpen(false);
  };

  // Log when no notifications
  if (notifications.length === 0) {
    console.log('📭 [NotificationCenter] No notifications to display');
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onMarkAllAsRead}
              className="text-xs"
            >
              Tout marquer comme lu
            </Button>
          )}
        </div>
        
        <ScrollArea className="h-96">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Aucune notification</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => {
                console.log('📝 [NotificationCenter] Rendering notification:', notification);
                return (
                  <div
                    key={notification.id}
                    className={cn(
                      'p-4 cursor-pointer hover:bg-gray-50 transition-colors',
                      !notification.isRead && 'bg-blue-50/50',
                      getNotificationColor(notification.type)
                    )}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className={cn(
                            'text-sm font-medium truncate',
                            !notification.isRead && 'font-semibold'
                          )}>
                            {notification.title}
                          </p>
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 ml-2" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {formatTimeAgo(notification.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
        
        {notifications.length > 0 && (
          <>
            <Separator />
            <div className="p-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full text-xs"
                onClick={() => {
                  setIsOpen(false);
                }}
              >
                Voir toutes les notifications
              </Button>
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
};

export default NotificationCenter;
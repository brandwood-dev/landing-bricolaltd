import React, { useState } from 'react';
import { Bell, Check, Trash2, Filter, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNotifications } from '@/hooks/useNotifications';
import { useLanguage } from '@/contexts/LanguageContext';
import { Notification } from '@/components/notifications/NotificationCenter';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

const NotificationsPage: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const {
    notifications,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
  } = useNotifications();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);

  const getNotificationTypeLabel = (type: string) => {
    switch (type) {
      case 'booking_created':
        return 'Réservation créée';
      case 'booking_confirmed':
        return 'Réservation confirmée';
      case 'booking_cancelled':
        return 'Réservation annulée';
      case 'booking_completed':
        return 'Réservation terminée';
      case 'booking_reminder':
        return 'Rappel de réservation';
      case 'payment_received':
        return 'Paiement reçu';
      case 'payment_failed':
        return 'Paiement échoué';
      case 'system':
        return 'Système';
      default:
        return 'Notification';
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'booking_created':
      case 'booking_confirmed':
        return '✅';
      case 'booking_cancelled':
        return '❌';
      case 'booking_reminder':
        return '⏰';
      case 'payment_received':
        return '💰';
      case 'payment_failed':
        return '⚠️';
      case 'booking_completed':
        return '🎉';
      default:
        return '📢';
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || notification.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const unreadNotifications = filteredNotifications.filter(n => !n.isRead);
  const readNotifications = filteredNotifications.filter(n => n.isRead);

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
    if (notification.link) {
      navigate(notification.link);
    }
  };

  const handleSelectNotification = (id: string) => {
    setSelectedNotifications(prev => 
      prev.includes(id) 
        ? prev.filter(nId => nId !== id)
        : [...prev, id]
    );
  };

  const handleBulkMarkAsRead = () => {
    selectedNotifications.forEach(id => markAsRead(id));
    setSelectedNotifications([]);
  };

  const handleBulkDelete = () => {
    selectedNotifications.forEach(id => deleteNotification(id));
    setSelectedNotifications([]);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const NotificationCard = ({ notification }: { notification: Notification }) => (
    <Card 
      className={cn(
        'cursor-pointer transition-all hover:shadow-md',
        !notification.isRead && 'border-l-4 border-l-blue-500 bg-blue-50/50',
        selectedNotifications.includes(notification.id) && 'ring-2 ring-blue-500'
      )}
      onClick={() => handleNotificationClick(notification)}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            checked={selectedNotifications.includes(notification.id)}
            onChange={(e) => {
              e.stopPropagation();
              handleSelectNotification(notification.id);
            }}
            className="mt-1"
          />
          <div className="text-2xl">{getNotificationIcon(notification.type)}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <h3 className={cn(
                'font-medium text-sm',
                !notification.isRead && 'font-semibold'
              )}>
                {notification.title}
              </h3>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {getNotificationTypeLabel(notification.type)}
                </Badge>
                {!notification.isRead && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                )}
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-2">
              {notification.message}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatDate(notification.createdAt)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              Réessayer
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Notifications</h1>
        <p className="text-muted-foreground">
          Gérez toutes vos notifications en un seul endroit
        </p>
      </div>

      {/* Filters and Actions */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher dans les notifications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filtrer par type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les types</SelectItem>
                  <SelectItem value="booking_created">Réservations créées</SelectItem>
                  <SelectItem value="booking_confirmed">Réservations confirmées</SelectItem>
                  <SelectItem value="booking_cancelled">Réservations annulées</SelectItem>
                  <SelectItem value="booking_completed">Réservations terminées</SelectItem>
                  <SelectItem value="booking_reminder">Rappels</SelectItem>
                  <SelectItem value="payment_received">Paiements reçus</SelectItem>
                  <SelectItem value="payment_failed">Paiements échoués</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex gap-2">
              {selectedNotifications.length > 0 && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleBulkMarkAsRead}
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Marquer comme lu ({selectedNotifications.length})
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleBulkDelete}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Supprimer ({selectedNotifications.length})
                  </Button>
                </>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={markAllAsRead}
                disabled={unreadNotifications.length === 0}
              >
                <Check className="h-4 w-4 mr-2" />
                Tout marquer comme lu
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={clearAllNotifications}
                className="text-red-600 hover:text-red-700"
                disabled={notifications.length === 0}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Tout supprimer
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications Tabs */}
      <Tabs defaultValue="unread" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="unread" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Non lues ({unreadNotifications.length})
          </TabsTrigger>
          <TabsTrigger value="read" className="flex items-center gap-2">
            <Check className="h-4 w-4" />
            Lues ({readNotifications.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="unread" className="mt-6">
          {unreadNotifications.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">Aucune notification non lue</h3>
                <p className="text-muted-foreground">
                  Toutes vos notifications ont été lues !
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {unreadNotifications.map((notification) => (
                <NotificationCard key={notification.id} notification={notification} />
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="read" className="mt-6">
          {readNotifications.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Check className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">Aucune notification lue</h3>
                <p className="text-muted-foreground">
                  Les notifications que vous avez lues apparaîtront ici.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {readNotifications.map((notification) => (
                <NotificationCard key={notification.id} notification={notification} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NotificationsPage;
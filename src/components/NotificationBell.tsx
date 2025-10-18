import React, { useState } from 'react';
import { Bell, X, Check, Trash2, Settings, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useNotifications } from '@/services/NotificationService';

export function NotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, removeNotification } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return '✅';
      case 'warning':
        return '⚠️';
      case 'error':
        return '❌';
      default:
        return 'ℹ️';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'text-green-600';
      case 'warning':
        return 'text-yellow-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-blue-600';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
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
      </DialogTrigger>
      
      <DialogContent className="max-w-md max-h-[600px] p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold">
              Notificações
            </DialogTitle>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllAsRead}
                  className="text-xs"
                >
                  <Check className="h-4 w-4 mr-1" />
                  Marcar todas como lidas
                </Button>
              )}
              <NotificationSettings />
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[400px]">
          <div className="p-4 space-y-3">
            {notifications.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhuma notificação</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <Card 
                  key={notification.id} 
                  className={`transition-all duration-200 hover:shadow-md ${
                    !notification.read ? 'border-l-4 border-l-primary bg-primary/5' : ''
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg">
                            {getNotificationIcon(notification.type)}
                          </span>
                          <h4 className={`font-medium text-sm ${getNotificationColor(notification.type)}`}>
                            {notification.title}
                          </h4>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                          )}
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                          {notification.message}
                        </p>
                        
                        <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400">
                          {new Date(notification.timestamp).toLocaleDateString('pt-BR')}
                        </span>
                          
                          <div className="flex items-center gap-1">
                            {notification.actionUrl && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-xs h-6 px-2"
                                onClick={() => {
                                  window.location.href = notification.actionUrl!;
                                  setIsOpen(false);
                                }}
                              >
                                <ExternalLink className="h-3 w-3 mr-1" />
                                {notification.actionText || 'Ver'}
                              </Button>
                            )}
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-xs h-6 w-6 p-0"
                              onClick={() => removeNotification(notification.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

function NotificationSettings() {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState({
    push: true,
    email: true,
    sms: false,
    orderUpdates: true,
    stockAlerts: true,
    marketing: false,
    systemUpdates: true,
  });

  const handleSettingChange = (key: string, value: boolean) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    localStorage.setItem('neox_notification_settings', JSON.stringify(newSettings));
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Settings className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Configurações de Notificação</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div>
            <h4 className="font-medium mb-3">Canais de Notificação</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="push">Notificações Push</Label>
                <Switch
                  id="push"
                  checked={settings.push}
                  onCheckedChange={(checked) => handleSettingChange('push', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="email">Email</Label>
                <Switch
                  id="email"
                  checked={settings.email}
                  onCheckedChange={(checked) => handleSettingChange('email', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="sms">SMS</Label>
                <Switch
                  id="sms"
                  checked={settings.sms}
                  onCheckedChange={(checked) => handleSettingChange('sms', checked)}
                />
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h4 className="font-medium mb-3">Tipos de Notificação</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="orderUpdates">Atualizações de Pedidos</Label>
                <Switch
                  id="orderUpdates"
                  checked={settings.orderUpdates}
                  onCheckedChange={(checked) => handleSettingChange('orderUpdates', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="stockAlerts">Alertas de Estoque</Label>
                <Switch
                  id="stockAlerts"
                  checked={settings.stockAlerts}
                  onCheckedChange={(checked) => handleSettingChange('stockAlerts', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="marketing">Marketing</Label>
                <Switch
                  id="marketing"
                  checked={settings.marketing}
                  onCheckedChange={(checked) => handleSettingChange('marketing', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="systemUpdates">Atualizações do Sistema</Label>
                <Switch
                  id="systemUpdates"
                  checked={settings.systemUpdates}
                  onCheckedChange={(checked) => handleSettingChange('systemUpdates', checked)}
                />
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

import { useState, useEffect, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  actionText?: string;
}

export interface NotificationSettings {
  push: boolean;
  email: boolean;
  sms: boolean;
  orderUpdates: boolean;
  stockAlerts: boolean;
  marketing: boolean;
  systemUpdates: boolean;
}

class NotificationService {
  private static instance: NotificationService;
  private notifications: Notification[] = [];
  private settings: NotificationSettings = {
    push: true,
    email: true,
    sms: false,
    orderUpdates: true,
    stockAlerts: true,
    marketing: false,
    systemUpdates: true,
  };
  private listeners: Array<(notifications: Notification[]) => void> = [];

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  private constructor() {
    this.loadFromStorage();
    this.requestPermission();
  }

  private loadFromStorage() {
    const stored = localStorage.getItem('neox_notifications');
    if (stored) {
      this.notifications = JSON.parse(stored).map((n: any) => ({
        ...n,
        timestamp: new Date(n.timestamp),
      }));
    }

    const storedSettings = localStorage.getItem('neox_notification_settings');
    if (storedSettings) {
      this.settings = JSON.parse(storedSettings);
    }
  }

  private saveToStorage() {
    localStorage.setItem('neox_notifications', JSON.stringify(this.notifications));
    localStorage.setItem('neox_notification_settings', JSON.stringify(this.settings));
  }

  private async requestPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener([...this.notifications]));
  }

  subscribe(listener: (notifications: Notification[]) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  addNotification(notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date(),
      read: false,
    };

    this.notifications.unshift(newNotification);
    
    // Keep only last 100 notifications
    if (this.notifications.length > 100) {
      this.notifications = this.notifications.slice(0, 100);
    }

    this.saveToStorage();
    this.notifyListeners();

    // Show toast notification
    toast({
      title: newNotification.title,
      description: newNotification.message,
      variant: newNotification.type === 'error' ? 'destructive' : 'default',
    });

    // Show browser notification if enabled
    if (this.settings.push && 'Notification' in window && Notification.permission === 'granted') {
      new Notification(newNotification.title, {
        body: newNotification.message,
        icon: '/favicon.ico',
        tag: newNotification.id,
      });
    }
  }

  markAsRead(id: string) {
    const notification = this.notifications.find(n => n.id === id);
    if (notification) {
      notification.read = true;
      this.saveToStorage();
      this.notifyListeners();
    }
  }

  markAllAsRead() {
    this.notifications.forEach(n => n.read = true);
    this.saveToStorage();
    this.notifyListeners();
  }

  removeNotification(id: string) {
    this.notifications = this.notifications.filter(n => n.id !== id);
    this.saveToStorage();
    this.notifyListeners();
  }

  clearAll() {
    this.notifications = [];
    this.saveToStorage();
    this.notifyListeners();
  }

  getNotifications(): Notification[] {
    return [...this.notifications];
  }

  getUnreadCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }

  getSettings(): NotificationSettings {
    return { ...this.settings };
  }

  updateSettings(newSettings: Partial<NotificationSettings>) {
    this.settings = { ...this.settings, ...newSettings };
    this.saveToStorage();
  }

  // Convenience methods for common notifications
  notifyOrderUpdate(orderId: string, status: string) {
    if (!this.settings.orderUpdates) return;

    this.addNotification({
      title: 'Atualização do Pedido',
      message: `Pedido #${orderId} foi atualizado para: ${status}`,
      type: 'info',
      actionUrl: `/painel/pedidos/${orderId}`,
      actionText: 'Ver Pedido',
    });
  }

  notifyStockAlert(productName: string, currentStock: number) {
    if (!this.settings.stockAlerts) return;

    this.addNotification({
      title: 'Alerta de Estoque',
      message: `Produto "${productName}" está com estoque baixo (${currentStock} unidades)`,
      type: 'warning',
      actionUrl: '/painel/estoque',
      actionText: 'Ver Estoque',
    });
  }

  notifyPaymentReceived(orderId: string, amount: number) {
    this.addNotification({
      title: 'Pagamento Recebido',
      message: `Pagamento de R$ ${amount.toFixed(2)} confirmado para o pedido #${orderId}`,
      type: 'success',
      actionUrl: `/painel/financeiro/pagamentos`,
      actionText: 'Ver Pagamentos',
    });
  }

  notifySystemUpdate(message: string) {
    if (!this.settings.systemUpdates) return;

    this.addNotification({
      title: 'Atualização do Sistema',
      message,
      type: 'info',
    });
  }

  notifyError(title: string, message: string) {
    this.addNotification({
      title,
      message,
      type: 'error',
    });
  }

  notifySuccess(title: string, message: string) {
    this.addNotification({
      title,
      message,
      type: 'success',
    });
  }
}

export const notificationService = NotificationService.getInstance();

// React hook for notifications
export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const unsubscribe = notificationService.subscribe((newNotifications) => {
      setNotifications(newNotifications);
      setUnreadCount(notificationService.getUnreadCount());
    });

    // Initial load
    setNotifications(notificationService.getNotifications());
    setUnreadCount(notificationService.getUnreadCount());

    return unsubscribe;
  }, []);

  const markAsRead = useCallback((id: string) => {
    notificationService.markAsRead(id);
  }, []);

  const markAllAsRead = useCallback(() => {
    notificationService.markAllAsRead();
  }, []);

  const removeNotification = useCallback((id: string) => {
    notificationService.removeNotification(id);
  }, []);

  const clearAll = useCallback(() => {
    notificationService.clearAll();
  }, []);

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
  };
}

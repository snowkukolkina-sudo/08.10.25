import PushNotification from 'react-native-push-notification';
import AsyncStorage from '@react-native-async-storage/async-storage';

const NOTIFICATION_SETTINGS_KEY = 'notification_settings';

export class NotificationService {
  static isInitialized = false;

  static async initialize() {
    try {
      // Configure push notifications
      PushNotification.configure({
        onRegister: (token) => {
          console.log('Push notification token:', token);
          this.saveToken(token.token);
        },
        onNotification: (notification) => {
          console.log('Push notification received:', notification);
          this.handleNotification(notification);
        },
        onAction: (notification) => {
          console.log('Push notification action:', notification);
        },
        onRegistrationError: (error) => {
          console.error('Push notification registration error:', error);
        },
        permissions: {
          alert: true,
          badge: true,
          sound: true,
        },
        popInitialNotification: true,
        requestPermissions: true,
      });

      // Create notification channel for Android
      PushNotification.createChannel(
        {
          channelId: 'dandy-courier',
          channelName: 'DANDY Courier',
          channelDescription: 'Уведомления для курьеров DANDY',
          playSound: true,
          soundName: 'default',
          importance: 4,
          vibrate: true,
        },
        (created) => console.log(`Channel created: ${created}`)
      );

      this.isInitialized = true;
    } catch (error) {
      console.error('Notification service initialization error:', error);
    }
  }

  static async saveToken(token) {
    try {
      await AsyncStorage.setItem('push_token', token);
    } catch (error) {
      console.error('Save token error:', error);
    }
  }

  static async getToken() {
    try {
      return await AsyncStorage.getItem('push_token');
    } catch (error) {
      console.error('Get token error:', error);
      return null;
    }
  }

  static handleNotification(notification) {
    // Handle different types of notifications
    switch (notification.type) {
      case 'new_order':
        this.showNewOrderNotification(notification);
        break;
      case 'order_update':
        this.showOrderUpdateNotification(notification);
        break;
      case 'order_cancelled':
        this.showOrderCancelledNotification(notification);
        break;
      default:
        this.showDefaultNotification(notification);
    }
  }

  static showNewOrderNotification(notification) {
    PushNotification.localNotification({
      channelId: 'dandy-courier',
      title: 'Новый заказ!',
      message: `Заказ #${notification.order_number} на сумму ${notification.total_amount} ₽`,
      playSound: true,
      soundName: 'default',
      vibrate: true,
      vibration: 300,
      priority: 'high',
      importance: 'high',
      actions: ['Принять', 'Отклонить'],
      userInfo: {
        orderId: notification.order_id,
        type: 'new_order',
      },
    });
  }

  static showOrderUpdateNotification(notification) {
    PushNotification.localNotification({
      channelId: 'dandy-courier',
      title: 'Обновление заказа',
      message: `Заказ #${notification.order_number} - ${notification.status}`,
      playSound: true,
      soundName: 'default',
      vibrate: true,
      vibration: 200,
      priority: 'normal',
      importance: 'normal',
      userInfo: {
        orderId: notification.order_id,
        type: 'order_update',
      },
    });
  }

  static showOrderCancelledNotification(notification) {
    PushNotification.localNotification({
      channelId: 'dandy-courier',
      title: 'Заказ отменен',
      message: `Заказ #${notification.order_number} был отменен`,
      playSound: true,
      soundName: 'default',
      vibrate: true,
      vibration: 300,
      priority: 'high',
      importance: 'high',
      userInfo: {
        orderId: notification.order_id,
        type: 'order_cancelled',
      },
    });
  }

  static showDefaultNotification(notification) {
    PushNotification.localNotification({
      channelId: 'dandy-courier',
      title: notification.title || 'DANDY Courier',
      message: notification.message || 'Новое уведомление',
      playSound: true,
      soundName: 'default',
      vibrate: true,
      vibration: 200,
      priority: 'normal',
      importance: 'normal',
      userInfo: notification.userInfo || {},
    });
  }

  static async showLocalNotification(title, message, data = {}) {
    try {
      PushNotification.localNotification({
        channelId: 'dandy-courier',
        title,
        message,
        playSound: true,
        soundName: 'default',
        vibrate: true,
        vibration: 200,
        priority: 'normal',
        importance: 'normal',
        userInfo: data,
      });
    } catch (error) {
      console.error('Show local notification error:', error);
    }
  }

  static async scheduleNotification(title, message, date, data = {}) {
    try {
      PushNotification.localNotificationSchedule({
        channelId: 'dandy-courier',
        title,
        message,
        date,
        playSound: true,
        soundName: 'default',
        vibrate: true,
        vibration: 200,
        priority: 'normal',
        importance: 'normal',
        userInfo: data,
      });
    } catch (error) {
      console.error('Schedule notification error:', error);
    }
  }

  static async cancelAllNotifications() {
    try {
      PushNotification.cancelAllLocalNotifications();
    } catch (error) {
      console.error('Cancel notifications error:', error);
    }
  }

  static async cancelNotification(id) {
    try {
      PushNotification.cancelLocalNotifications({ id });
    } catch (error) {
      console.error('Cancel notification error:', error);
    }
  }

  static async getDeliveredNotifications() {
    try {
      return new Promise((resolve) => {
        PushNotification.getDeliveredNotifications((notifications) => {
          resolve(notifications);
        });
      });
    } catch (error) {
      console.error('Get delivered notifications error:', error);
      return [];
    }
  }

  static async clearDeliveredNotifications() {
    try {
      PushNotification.removeAllDeliveredNotifications();
    } catch (error) {
      console.error('Clear delivered notifications error:', error);
    }
  }

  static async checkPermissions() {
    try {
      return new Promise((resolve) => {
        PushNotification.checkPermissions((permissions) => {
          resolve(permissions);
        });
      });
    } catch (error) {
      console.error('Check permissions error:', error);
      return { alert: false, badge: false, sound: false };
    }
  }

  static async requestPermissions() {
    try {
      return new Promise((resolve) => {
        PushNotification.requestPermissions((permissions) => {
          resolve(permissions);
        });
      });
    } catch (error) {
      console.error('Request permissions error:', error);
      return { alert: false, badge: false, sound: false };
    }
  }
}

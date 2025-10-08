import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Platform, PermissionsAndroid } from 'react-native';
import PushNotification from 'react-native-push-notification';
import messaging from '@react-native-firebase/messaging';

// Screens
import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen-Enhanced';
import OrderDetailScreen from './src/screens/OrderDetailScreen-Enhanced';
import MapScreen from './src/screens/MapScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import ProfileScreen from './src/screens/ProfileScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Главная навигация с табами
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#0b5c3b',
        tabBarInactiveTintColor: '#6b7280',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#e5e7eb',
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Заказы',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>📦</Text>,
        }}
      />
      <Tab.Screen
        name="Map"
        component={MapScreen}
        options={{
          tabBarLabel: 'Карта',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>🗺</Text>,
        }}
      />
      <Tab.Screen
        name="History"
        component={HistoryScreen}
        options={{
          tabBarLabel: 'История',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>📊</Text>,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Профиль',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>👤</Text>,
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  useEffect(() => {
    // Запрос разрешений
    requestPermissions();
    
    // Настройка push-уведомлений
    configurePushNotifications();
    
    // Настройка Firebase Cloud Messaging
    configureFirebaseMessaging();
  }, []);

  const requestPermissions = async () => {
    if (Platform.OS === 'android') {
      try {
        // Разрешение на геолокацию
        const locationGranted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Разрешение на геолокацию',
            message: 'Приложению нужен доступ к вашему местоположению для навигации',
            buttonNeutral: 'Спросить позже',
            buttonNegative: 'Отмена',
            buttonPositive: 'OK',
          }
        );

        // Разрешение на уведомления (Android 13+)
        if (Platform.Version >= 33) {
          await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
          );
        }

        console.log('✅ Разрешения получены');
      } catch (err) {
        console.warn('❌ Ошибка получения разрешений:', err);
      }
    }
  };

  const configurePushNotifications = () => {
    // Конфигурация локальных уведомлений
    PushNotification.configure({
      onRegister: function (token) {
        console.log('TOKEN:', token);
      },

      onNotification: function (notification) {
        console.log('NOTIFICATION:', notification);
        
        // Обработка нажатия на уведомление
        if (notification.userInteraction) {
          // Открыть нужный экран
          console.log('Пользователь нажал на уведомление');
        }
      },

      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },

      popInitialNotification: true,
      requestPermissions: Platform.OS === 'ios',
    });

    // Создать канал для Android
    PushNotification.createChannel(
      {
        channelId: 'dandy-courier-orders',
        channelName: 'Заказы',
        channelDescription: 'Уведомления о новых заказах',
        playSound: true,
        soundName: 'default',
        importance: 4,
        vibrate: true,
      },
      (created) => console.log(`Канал создан: ${created}`)
    );
  };

  const configureFirebaseMessaging = async () => {
    // Запрос разрешения на уведомления (iOS)
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      console.log('✅ Разрешение на уведомления получено');
      
      // Получить FCM токен
      const fcmToken = await messaging().getToken();
      console.log('FCM Token:', fcmToken);
      // Отправить токен на сервер
    }

    // Обработка фоновых сообщений
    messaging().setBackgroundMessageHandler(async (remoteMessage) => {
      console.log('Фоновое сообщение:', remoteMessage);
    });

    // Обработка сообщений когда приложение открыто
    messaging().onMessage(async (remoteMessage) => {
      console.log('Сообщение получено:', remoteMessage);
      
      // Показать локальное уведомление
      PushNotification.localNotification({
        channelId: 'dandy-courier-orders',
        title: remoteMessage.notification?.title || 'Новое уведомление',
        message: remoteMessage.notification?.body || '',
        playSound: true,
        soundName: 'default',
        importance: 'high',
        vibrate: true,
        vibration: 300,
      });
    });
  };

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Main" component={MainTabs} />
        <Stack.Screen 
          name="OrderDetail" 
          component={OrderDetailScreen}
          options={{
            headerShown: true,
            headerTitle: 'Детали заказа',
            headerStyle: {
              backgroundColor: '#0b5c3b',
            },
            headerTintColor: '#fff',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const Text = ({ children, style }) => {
  return <text style={style}>{children}</text>;
};

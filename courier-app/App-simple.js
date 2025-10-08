import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  StatusBar,
} from 'react-native';

// Простая версия приложения для тестирования
const App = () => {
  const [currentScreen, setCurrentScreen] = useState('login');
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([
    {
      id: 1,
      orderNumber: 'ORD-001',
      customerName: 'Иван Петров',
      customerPhone: '+7 (999) 123-45-67',
      totalAmount: 850,
      status: 'pending',
      deliveryAddress: 'ул. Ленина, д. 10, кв. 5',
      items: [
        { name: 'Пепперони', quantity: 1, price: 399 },
        { name: 'Кока-Кола', quantity: 2, price: 89 },
      ]
    },
    {
      id: 2,
      orderNumber: 'ORD-002',
      customerName: 'Мария Сидорова',
      customerPhone: '+7 (999) 234-56-78',
      totalAmount: 1200,
      status: 'confirmed',
      deliveryAddress: 'пр. Мира, д. 25, кв. 12',
      items: [
        { name: 'Маргарита', quantity: 1, price: 349 },
        { name: 'Филадельфия', quantity: 1, price: 459 },
        { name: 'Калифорния', quantity: 1, price: 389 },
      ]
    },
    {
      id: 3,
      orderNumber: 'ORD-003',
      customerName: 'Алексей Иванов',
      customerPhone: '+7 (999) 345-67-89',
      totalAmount: 650,
      status: 'ready',
      deliveryAddress: 'ул. Пушкина, д. 5, кв. 8',
      items: [
        { name: 'Калифорния', quantity: 1, price: 389 },
        { name: 'Кока-Кола', quantity: 1, price: 89 },
      ]
    }
  ]);

  const handleLogin = () => {
    setUser({
      id: 1,
      username: 'courier1',
      name: 'Анна Курьерова',
      role: 'courier'
    });
    setCurrentScreen('orders');
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentScreen('login');
  };

  const updateOrderStatus = (orderId, newStatus) => {
    setOrders(orders.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    ));
    Alert.alert('Успех', 'Статус заказа обновлен');
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#ff9800',
      confirmed: '#2196f3',
      preparing: '#ffc107',
      ready: '#4caf50',
      delivered: '#9c27b0',
      cancelled: '#f44336',
    };
    return colors[status] || '#666666';
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: 'Новый',
      confirmed: 'Принят',
      preparing: 'Готовится',
      ready: 'Готов',
      delivered: 'Доставлен',
      cancelled: 'Отменен',
    };
    return labels[status] || status;
  };

  const renderLoginScreen = () => (
    <View style={styles.screen}>
      <View style={styles.logoContainer}>
        <Text style={styles.logo}>🍕</Text>
        <Text style={styles.title}>DANDY Courier</Text>
        <Text style={styles.subtitle}>Приложение для курьеров</Text>
      </View>
      
      <View style={styles.loginContainer}>
        <Text style={styles.loginTitle}>Вход в систему</Text>
        <Text style={styles.loginInfo}>
          Демо пользователь: courier1 / 123
        </Text>
        
        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.loginButtonText}>Войти как курьер</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderOrdersScreen = () => (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Заказы</Text>
        <TouchableOpacity onPress={handleLogout}>
          <Text style={styles.logoutButton}>Выйти</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.ordersList}>
        {orders.map(order => (
          <View key={order.id} style={styles.orderCard}>
            <View style={styles.orderHeader}>
              <Text style={styles.orderNumber}>#{order.orderNumber}</Text>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
                <Text style={styles.statusText}>{getStatusLabel(order.status)}</Text>
              </View>
            </View>
            
            <Text style={styles.customerName}>👤 {order.customerName}</Text>
            <Text style={styles.customerPhone}>📞 {order.customerPhone}</Text>
            <Text style={styles.deliveryAddress}>📍 {order.deliveryAddress}</Text>
            <Text style={styles.orderTotal}>💰 {order.totalAmount} ₽</Text>
            
            <View style={styles.orderActions}>
              {order.status === 'pending' && (
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => updateOrderStatus(order.id, 'confirmed')}
                >
                  <Text style={styles.actionButtonText}>Принять</Text>
                </TouchableOpacity>
              )}
              {order.status === 'confirmed' && (
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => updateOrderStatus(order.id, 'preparing')}
                >
                  <Text style={styles.actionButtonText}>Начать доставку</Text>
                </TouchableOpacity>
              )}
              {order.status === 'ready' && (
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => updateOrderStatus(order.id, 'delivered')}
                >
                  <Text style={styles.actionButtonText}>Завершить</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0b5c3b" />
      {currentScreen === 'login' ? renderLoginScreen() : renderOrdersScreen()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  screen: {
    flex: 1,
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 40,
  },
  logo: {
    fontSize: 80,
    marginBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0b5c3b',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
  loginContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    elevation: 4,
  },
  loginTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0b5c3b',
    textAlign: 'center',
    marginBottom: 20,
  },
  loginInfo: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  loginButton: {
    backgroundColor: '#0b5c3b',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingTop: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0b5c3b',
  },
  logoutButton: {
    color: '#ff4444',
    fontSize: 16,
    fontWeight: 'bold',
  },
  ordersList: {
    flex: 1,
  },
  orderCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0b5c3b',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  customerName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
    color: '#333',
  },
  customerPhone: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  deliveryAddress: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  orderTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0b5c3b',
    marginBottom: 12,
  },
  orderActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionButton: {
    backgroundColor: '#0b5c3b',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default App;

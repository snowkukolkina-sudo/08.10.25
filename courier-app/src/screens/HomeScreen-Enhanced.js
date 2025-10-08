import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { OrderService } from '../services/OrderService';
import { LocationService } from '../services/LocationService';

const HomeScreen = ({ navigation }) => {
  const [courier, setCourier] = useState(null);
  const [newOrders, setNewOrders] = useState([]);
  const [activeOrders, setActiveOrders] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [onShift, setOnShift] = useState(false);
  const [todayStats, setTodayStats] = useState({
    delivered: 0,
    earned: 0,
    hoursOnShift: 0,
  });

  useEffect(() => {
    loadCourierData();
    loadOrders();
    startLocationTracking();

    // Обновляем заказы каждые 10 секунд
    const interval = setInterval(loadOrders, 10000);
    return () => clearInterval(interval);
  }, []);

  const loadCourierData = async () => {
    try {
      const courierData = await AsyncStorage.getItem('courier');
      if (courierData) {
        setCourier(JSON.parse(courierData));
      }
      const shiftStatus = await AsyncStorage.getItem('onShift');
      setOnShift(shiftStatus === 'true');
    } catch (error) {
      console.error('Error loading courier data:', error);
    }
  };

  const loadOrders = async () => {
    try {
      const orders = await OrderService.getAvailableOrders();
      const today = await OrderService.getTodayStats();
      
      setNewOrders(orders.filter(o => o.status === 'ready'));
      setActiveOrders(orders.filter(o => ['accepted', 'picked_up', 'in_transit'].includes(o.status)));
      setTodayStats(today);
    } catch (error) {
      console.error('Error loading orders:', error);
    }
  };

  const startLocationTracking = async () => {
    if (onShift) {
      LocationService.startTracking();
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadOrders();
    setRefreshing(false);
  };

  const acceptOrder = async (orderId) => {
    try {
      await OrderService.acceptOrder(orderId);
      Alert.alert('✅ Заказ принят!', 'Заказ добавлен в активные');
      loadOrders();
    } catch (error) {
      Alert.alert('❌ Ошибка', 'Не удалось принять заказ');
    }
  };

  const rejectOrder = async (orderId) => {
    Alert.alert(
      'Отклонить заказ?',
      'Вы уверены что хотите отклонить этот заказ?',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Отклонить',
          style: 'destructive',
          onPress: async () => {
            try {
              await OrderService.rejectOrder(orderId);
              loadOrders();
            } catch (error) {
              Alert.alert('Ошибка', 'Не удалось отклонить заказ');
            }
          },
        },
      ]
    );
  };

  const toggleShift = async () => {
    const newStatus = !onShift;
    setOnShift(newStatus);
    await AsyncStorage.setItem('onShift', newStatus.toString());
    
    if (newStatus) {
      LocationService.startTracking();
      Alert.alert('✅ Смена начата', 'Удачной работы!');
    } else {
      LocationService.stopTracking();
      Alert.alert('🏁 Смена закончена', 'Хорошего отдыха!');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      ready: '#f59e0b',
      accepted: '#3b82f6',
      picked_up: '#8b5cf6',
      in_transit: '#06b6d4',
      delivered: '#10b981',
    };
    return colors[status] || '#6b7280';
  };

  const getStatusText = (status) => {
    const texts = {
      ready: '📦 Готов к выдаче',
      accepted: '✅ Принят',
      picked_up: '🏪 Забран',
      in_transit: '🚴 В пути',
      delivered: '✅ Доставлен',
    };
    return texts[status] || status;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerName}>
            🚴 {courier?.name || 'Курьер'}
          </Text>
          <View style={styles.headerStats}>
            <Text style={styles.headerStat}>⭐ {courier?.rating || '5.0'}</Text>
            <Text style={styles.headerStat}>•</Text>
            <Text style={styles.headerStat}>
              {onShift ? '🟢 На смене' : '⚪ Не на смене'}
            </Text>
          </View>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
          <View style={styles.profileButton}>
            <Text style={styles.profileIcon}>👤</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Today Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{todayStats.delivered}</Text>
          <Text style={styles.statLabel}>Доставлено</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{todayStats.earned}₽</Text>
          <Text style={styles.statLabel}>Заработано</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{todayStats.hoursOnShift}ч</Text>
          <Text style={styles.statLabel}>На смене</Text>
        </View>
      </View>

      {/* Shift Toggle */}
      <TouchableOpacity
        style={[styles.shiftButton, onShift ? styles.shiftButtonActive : styles.shiftButtonInactive]}
        onPress={toggleShift}
      >
        <Text style={styles.shiftButtonText}>
          {onShift ? '🏁 ЗАКОНЧИТЬ СМЕНУ' : '▶️ НАЧАТЬ СМЕНУ'}
        </Text>
      </TouchableOpacity>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* New Orders */}
        {newOrders.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>🔔 Новые заказы</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{newOrders.length}</Text>
              </View>
            </View>

            {newOrders.map((order) => (
              <View key={order.id} style={styles.orderCard}>
                <View style={styles.orderHeader}>
                  <Text style={styles.orderId}>📦 Заказ #{order.id}</Text>
                  <Text style={styles.orderAmount}>{order.total}₽</Text>
                </View>

                <View style={styles.orderInfo}>
                  <Text style={styles.orderItems}>
                    🍕 {order.items?.length || 0} позиции
                  </Text>
                </View>

                <View style={styles.locationBlock}>
                  <Text style={styles.locationLabel}>📍 Забрать:</Text>
                  <Text style={styles.locationText}>ДЭНДИ (Немчиновка)</Text>
                  <Text style={styles.locationDistance}>
                    📏 {order.restaurantDistance || '500м'} • ⏱ {order.restaurantTime || '2 мин'}
                  </Text>
                </View>

                <View style={styles.locationBlock}>
                  <Text style={styles.locationLabel}>📍 Доставить:</Text>
                  <Text style={styles.locationText}>{order.address}</Text>
                  <Text style={styles.locationDistance}>
                    📏 {order.customerDistance || '3.5км'} • ⏱ {order.deliveryTime || '15 мин'}
                  </Text>
                </View>

                <View style={styles.paymentBlock}>
                  <Text style={styles.paymentText}>
                    💵 {order.paymentMethod === 'cash' ? 'Наличные' : 'Картой'}
                    {order.changeFrom && ` (сдача с ${order.changeFrom}₽)`}
                  </Text>
                </View>

                <View style={styles.orderActions}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.acceptButton]}
                    onPress={() => acceptOrder(order.id)}
                  >
                    <Text style={styles.actionButtonText}>✅ ПРИНЯТЬ</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.rejectButton]}
                    onPress={() => rejectOrder(order.id)}
                  >
                    <Text style={styles.actionButtonText}>❌ ОТКЛОНИТЬ</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Active Orders */}
        {activeOrders.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>📋 В работе</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{activeOrders.length}</Text>
              </View>
            </View>

            {activeOrders.map((order) => (
              <TouchableOpacity
                key={order.id}
                style={styles.activeOrderCard}
                onPress={() => navigation.navigate('OrderDetail', { orderId: order.id })}
              >
                <View style={styles.activeOrderHeader}>
                  <Text style={styles.activeOrderId}>📦 #{order.id}</Text>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusColor(order.status) },
                    ]}
                  >
                    <Text style={styles.statusBadgeText}>
                      {getStatusText(order.status)}
                    </Text>
                  </View>
                </View>
                <Text style={styles.activeOrderAddress}>{order.address}</Text>
                <Text style={styles.activeOrderDistance}>
                  📏 {order.distance} • ⏱ {order.estimatedTime}
                </Text>
                <View style={styles.activeOrderFooter}>
                  <Text style={styles.activeOrderAmount}>{order.total}₽</Text>
                  <Text style={styles.activeOrderAction}>Подробнее →</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Empty State */}
        {newOrders.length === 0 && activeOrders.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={styles.emptyTitle}>Нет активных заказов</Text>
            <Text style={styles.emptyText}>
              {onShift
                ? 'Новые заказы появятся здесь'
                : 'Начните смену чтобы получать заказы'}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#0b5c3b',
    padding: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flex: 1,
  },
  headerName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  headerStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerStat: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileIcon: {
    fontSize: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0b5c3b',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  shiftButton: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  shiftButtonActive: {
    backgroundColor: '#dc2626',
  },
  shiftButtonInactive: {
    backgroundColor: '#10b981',
  },
  shiftButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  badge: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  orderCard: {
    backgroundColor: '#fffbeb',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#fbbf24',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderId: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  orderAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0b5c3b',
  },
  orderInfo: {
    marginBottom: 12,
  },
  orderItems: {
    fontSize: 14,
    color: '#6b7280',
  },
  locationBlock: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  locationLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 4,
  },
  locationText: {
    fontSize: 14,
    color: '#1f2937',
    marginBottom: 4,
  },
  locationDistance: {
    fontSize: 12,
    color: '#6b7280',
  },
  paymentBlock: {
    backgroundColor: '#dbeafe',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  paymentText: {
    fontSize: 14,
    color: '#1e40af',
    fontWeight: '600',
  },
  orderActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  acceptButton: {
    backgroundColor: '#10b981',
  },
  rejectButton: {
    backgroundColor: '#6b7280',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  activeOrderCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activeOrderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  activeOrderId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  activeOrderAddress: {
    fontSize: 14,
    color: '#1f2937',
    marginBottom: 4,
  },
  activeOrderDistance: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 12,
  },
  activeOrderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  activeOrderAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0b5c3b',
  },
  activeOrderAction: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
});

export default HomeScreen;

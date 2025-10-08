import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
  Platform,
} from 'react-native';
import { OrderService } from '../services/OrderService';

const OrderDetailScreen = ({ route, navigation }) => {
  const { orderId } = route.params;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrderDetails();
  }, [orderId]);

  const loadOrderDetails = async () => {
    try {
      const data = await OrderService.getOrderById(orderId);
      setOrder(data);
      setLoading(false);
    } catch (error) {
      console.error('Error loading order:', error);
      Alert.alert('Ошибка', 'Не удалось загрузить данные заказа');
      navigation.goBack();
    }
  };

  const callCustomer = () => {
    if (order?.customerPhone) {
      Linking.openURL(`tel:${order.customerPhone}`);
    }
  };

  const openMap = (address) => {
    const url = Platform.select({
      ios: `maps:0,0?q=${encodeURIComponent(address)}`,
      android: `geo:0,0?q=${encodeURIComponent(address)}`,
    });
    Linking.openURL(url);
  };

  const openYandexMaps = (address) => {
    const url = `yandexmaps://maps.yandex.ru/?text=${encodeURIComponent(address)}`;
    Linking.canOpenURL(url).then((supported) => {
      if (supported) {
        Linking.openURL(url);
      } else {
        Linking.openURL(`https://yandex.ru/maps/?text=${encodeURIComponent(address)}`);
      }
    });
  };

  const open2GIS = (address) => {
    const url = `dgis://2gis.ru/search/${encodeURIComponent(address)}`;
    Linking.canOpenURL(url).then((supported) => {
      if (supported) {
        Linking.openURL(url);
      } else {
        Linking.openURL(`https://2gis.ru/search/${encodeURIComponent(address)}`);
      }
    });
  };

  const updateOrderStatus = async (newStatus) => {
    try {
      await OrderService.updateOrderStatus(orderId, newStatus);
      Alert.alert('✅ Статус обновлен', getStatusMessage(newStatus));
      loadOrderDetails();
    } catch (error) {
      Alert.alert('❌ Ошибка', 'Не удалось обновить статус');
    }
  };

  const getStatusMessage = (status) => {
    const messages = {
      at_restaurant: 'Вы отметили что прибыли в ресторан',
      picked_up: 'Заказ забран, можно начинать доставку',
      in_transit: 'Вы в пути к клиенту',
      delivered: 'Заказ успешно доставлен!',
    };
    return messages[status] || 'Статус обновлен';
  };

  const showNavigationOptions = () => {
    Alert.alert(
      '🗺 Выберите навигацию',
      'В каком приложении открыть маршрут?',
      [
        {
          text: '🟡 Яндекс.Карты',
          onPress: () => openYandexMaps(order.address),
        },
        {
          text: '🟢 2GIS',
          onPress: () => open2GIS(order.address),
        },
        {
          text: '📍 Карты устройства',
          onPress: () => openMap(order.address),
        },
        {
          text: 'Отмена',
          style: 'cancel',
        },
      ]
    );
  };

  if (loading || !order) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Загрузка...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Назад</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Заказ #{order.id}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Order Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🍕 Состав заказа</Text>
          <View style={styles.itemsContainer}>
            {order.items?.map((item, index) => (
              <View key={index} style={styles.itemCard}>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  {item.extras && (
                    <Text style={styles.itemExtras}>+ {item.extras}</Text>
                  )}
                  <Text style={styles.itemQuantity}>Количество: {item.quantity}</Text>
                </View>
                <View style={styles.itemPricing}>
                  <Text style={styles.itemPrice}>{item.price}₽</Text>
                  <Text style={styles.itemTotal}>= {item.total}₽</Text>
                </View>
              </View>
            ))}
          </View>
          <View style={styles.totalContainer}>
            <Text style={styles.totalLabel}>Итого:</Text>
            <Text style={styles.totalAmount}>{order.total}₽</Text>
          </View>
        </View>

        {/* Customer Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>👤 Клиент</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Имя:</Text>
              <Text style={styles.infoValue}>{order.customerName}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Телефон:</Text>
              <Text style={styles.infoValue}>{order.customerPhone}</Text>
            </View>
            <TouchableOpacity
              style={styles.callButton}
              onPress={callCustomer}
            >
              <Text style={styles.callButtonText}>📞 ПОЗВОНИТЬ</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Restaurant Location */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📍 Откуда забрать</Text>
          <View style={styles.locationCard}>
            <Text style={styles.locationName}>🏪 ДЭНДИ Пицца</Text>
            <Text style={styles.locationAddress}>
              МО, село Немчиновка
            </Text>
            <Text style={styles.locationDistance}>
              📏 {order.restaurantDistance || '500м'} • ⏱ {order.restaurantTime || '2 мин'}
            </Text>
            <TouchableOpacity
              style={styles.mapButton}
              onPress={() => showNavigationOptions()}
            >
              <Text style={styles.mapButtonText}>🧭 ПОСТРОИТЬ МАРШРУТ</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Delivery Location */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📍 Куда доставить</Text>
          <View style={styles.locationCard}>
            <Text style={styles.locationName}>🏠 Адрес клиента</Text>
            <Text style={styles.locationAddress}>{order.address}</Text>
            {order.apartment && (
              <Text style={styles.locationDetail}>Квартира: {order.apartment}</Text>
            )}
            {order.entrance && (
              <Text style={styles.locationDetail}>Подъезд: {order.entrance}</Text>
            )}
            {order.floor && (
              <Text style={styles.locationDetail}>Этаж: {order.floor}</Text>
            )}
            {order.intercom && (
              <Text style={styles.locationDetail}>Домофон: {order.intercom}</Text>
            )}
            <Text style={styles.locationDistance}>
              📏 {order.customerDistance || '3.5км'} • ⏱ {order.deliveryTime || '15 мин'}
            </Text>
            <TouchableOpacity
              style={styles.mapButton}
              onPress={() => showNavigationOptions()}
            >
              <Text style={styles.mapButtonText}>🧭 ПОСТРОИТЬ МАРШРУТ</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Payment Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💵 Оплата</Text>
          <View style={styles.paymentCard}>
            <Text style={styles.paymentMethod}>
              {order.paymentMethod === 'cash' ? '💵 Наличные' : '💳 Картой'}
            </Text>
            {order.paymentMethod === 'cash' && order.changeFrom && (
              <Text style={styles.paymentChange}>
                Сдача с {order.changeFrom}₽
              </Text>
            )}
            {order.paymentMethod === 'card' && (
              <Text style={styles.paymentNote}>
                ✅ Оплачено онлайн
              </Text>
            )}
          </View>
        </View>

        {/* Comment */}
        {order.comment && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>💬 Комментарий к заказу</Text>
            <View style={styles.commentCard}>
              <Text style={styles.commentText}>{order.comment}</Text>
            </View>
          </View>
        )}

        {/* Delivery Time */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⏱ Время доставки</Text>
          <View style={styles.timeCard}>
            <Text style={styles.timeLabel}>Доставить до:</Text>
            <Text style={styles.timeValue}>{order.deliveryTime || '19:45'}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionsContainer}>
        {order.status === 'accepted' && (
          <TouchableOpacity
            style={[styles.actionButton, styles.atRestaurantButton]}
            onPress={() => updateOrderStatus('at_restaurant')}
          >
            <Text style={styles.actionButtonText}>🏪 Я В РЕСТОРАНЕ</Text>
          </TouchableOpacity>
        )}
        {order.status === 'at_restaurant' && (
          <TouchableOpacity
            style={[styles.actionButton, styles.pickedUpButton]}
            onPress={() => updateOrderStatus('picked_up')}
          >
            <Text style={styles.actionButtonText}>📦 ЗАБРАЛ ЗАКАЗ</Text>
          </TouchableOpacity>
        )}
        {order.status === 'picked_up' && (
          <TouchableOpacity
            style={[styles.actionButton, styles.inTransitButton]}
            onPress={() => updateOrderStatus('in_transit')}
          >
            <Text style={styles.actionButtonText}>🚴 Я В ПУТИ</Text>
          </TouchableOpacity>
        )}
        {order.status === 'in_transit' && (
          <TouchableOpacity
            style={[styles.actionButton, styles.deliveredButton]}
            onPress={() => updateOrderStatus('delivered')}
          >
            <Text style={styles.actionButtonText}>✅ ДОСТАВЛЕНО</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },
  header: {
    backgroundColor: '#0b5c3b',
    padding: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSpacer: {
    width: 60,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  itemsContainer: {
    gap: 8,
  },
  itemCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  itemExtras: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 4,
  },
  itemQuantity: {
    fontSize: 13,
    color: '#6b7280',
  },
  itemPricing: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  itemPrice: {
    fontSize: 14,
    color: '#6b7280',
  },
  itemTotal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0b5c3b',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0b5c3b',
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffd24d',
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  callButton: {
    backgroundColor: '#10b981',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  callButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  locationCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  locationName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  locationAddress: {
    fontSize: 15,
    color: '#1f2937',
    marginBottom: 4,
  },
  locationDetail: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 2,
  },
  locationDistance: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 8,
    marginBottom: 12,
  },
  mapButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
  },
  mapButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  paymentCard: {
    backgroundColor: '#dbeafe',
    borderRadius: 12,
    padding: 16,
  },
  paymentMethod: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 8,
  },
  paymentChange: {
    fontSize: 15,
    color: '#1e40af',
  },
  paymentNote: {
    fontSize: 15,
    color: '#10b981',
    fontWeight: '600',
  },
  commentCard: {
    backgroundColor: '#fef3c7',
    borderRadius: 12,
    padding: 16,
  },
  commentText: {
    fontSize: 15,
    color: '#92400e',
    lineHeight: 22,
  },
  timeCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  timeLabel: {
    fontSize: 16,
    color: '#6b7280',
  },
  timeValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#dc2626',
  },
  actionsContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  actionButton: {
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
  },
  atRestaurantButton: {
    backgroundColor: '#f59e0b',
  },
  pickedUpButton: {
    backgroundColor: '#8b5cf6',
  },
  inTransitButton: {
    backgroundColor: '#06b6d4',
  },
  deliveredButton: {
    backgroundColor: '#10b981',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default OrderDetailScreen;

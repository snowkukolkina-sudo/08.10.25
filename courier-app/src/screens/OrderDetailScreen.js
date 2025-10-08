import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  Linking,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Chip,
  Button,
  ActivityIndicator,
  Text,
  Divider,
  List,
  IconButton,
} from 'react-native-paper';
import { OrderService } from '../services/OrderService';
import { LocationService } from '../services/LocationService';
import { theme } from '../theme/theme';

const OrderDetailScreen = ({ route, navigation }) => {
  const { orderId } = route.params;
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    loadOrderDetails();
  }, [orderId]);

  const loadOrderDetails = async () => {
    try {
      setIsLoading(true);
      const orderData = await OrderService.getOrderById(orderId);
      setOrder(orderData);
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось загрузить детали заказа');
      console.error('Load order details error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus, message) => {
    try {
      setIsUpdating(true);
      await OrderService.updateOrderStatus(orderId, newStatus, message);
      Alert.alert('Успех', 'Статус заказа обновлен');
      loadOrderDetails();
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось обновить статус заказа');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCallCustomer = () => {
    if (order.customer_phone) {
      Linking.openURL(`tel:${order.customer_phone}`);
    } else {
      Alert.alert('Ошибка', 'Номер телефона клиента не указан');
    }
  };

  const handleOpenMaps = () => {
    if (order.delivery_address && order.delivery_address.coordinates) {
      const { latitude, longitude } = order.delivery_address.coordinates;
      const url = `https://maps.google.com/maps?daddr=${latitude},${longitude}`;
      Linking.openURL(url);
    } else {
      Alert.alert('Ошибка', 'Адрес доставки не указан');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: theme.colors.warning,
      confirmed: theme.colors.info,
      preparing: theme.colors.accent,
      ready: theme.colors.success,
      delivered: theme.colors.primary,
      cancelled: theme.colors.error,
    };
    return colors[status] || theme.colors.primary;
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

  const formatDateTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderOrderItems = () => {
    if (!order.items || order.items.length === 0) {
      return (
        <Paragraph style={styles.noItems}>Товары не указаны</Paragraph>
      );
    }

    return order.items.map((item, index) => (
      <View key={index} style={styles.orderItem}>
        <View style={styles.itemInfo}>
          <Text style={styles.itemName}>{item.product_name}</Text>
          <Text style={styles.itemSku}>SKU: {item.product_sku}</Text>
          {item.notes && (
            <Text style={styles.itemNotes}>Примечание: {item.notes}</Text>
          )}
        </View>
        <View style={styles.itemQuantity}>
          <Text style={styles.itemQuantityText}>x{item.quantity}</Text>
        </View>
        <View style={styles.itemPrice}>
          <Text style={styles.itemPriceText}>{item.total_price} ₽</Text>
        </View>
      </View>
    ));
  };

  const renderStatusActions = () => {
    const actions = [];

    switch (order.status) {
      case 'pending':
        actions.push(
          <Button
            key="accept"
            mode="contained"
            onPress={() => handleStatusUpdate('confirmed', 'Заказ принят курьером')}
            style={styles.actionButton}
            disabled={isUpdating}
          >
            Принять заказ
          </Button>
        );
        break;
      case 'confirmed':
        actions.push(
          <Button
            key="start"
            mode="contained"
            onPress={() => handleStatusUpdate('preparing', 'Курьер выехал за заказом')}
            style={styles.actionButton}
            disabled={isUpdating}
          >
            Начать доставку
          </Button>
        );
        break;
      case 'preparing':
        actions.push(
          <Button
            key="arrive"
            mode="contained"
            onPress={() => handleStatusUpdate('ready', 'Курьер прибыл в ресторан')}
            style={styles.actionButton}
            disabled={isUpdating}
          >
            Прибыл в ресторан
          </Button>
        );
        break;
      case 'ready':
        actions.push(
          <Button
            key="deliver"
            mode="contained"
            onPress={() => handleStatusUpdate('delivered', 'Заказ доставлен клиенту')}
            style={styles.actionButton}
            disabled={isUpdating}
          >
            Завершить доставку
          </Button>
        );
        break;
    }

    return actions;
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Загрузка деталей заказа...</Text>
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Заказ не найден</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Order Header */}
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.orderHeader}>
            <Title style={styles.orderNumber}>#{order.order_number}</Title>
            <Chip
              style={[styles.statusChip, { backgroundColor: getStatusColor(order.status) }]}
              textStyle={styles.statusText}
            >
              {getStatusLabel(order.status)}
            </Chip>
          </View>
          
          <Paragraph style={styles.orderTime}>
            Создан: {formatDateTime(order.created_at)}
          </Paragraph>
          
          {order.estimated_delivery && (
            <Paragraph style={styles.estimatedDelivery}>
              Ожидаемое время доставки: {formatDateTime(order.estimated_delivery)}
            </Paragraph>
          )}
        </Card.Content>
      </Card>

      {/* Customer Info */}
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Информация о клиенте</Title>
          
          <View style={styles.customerInfo}>
            <View style={styles.customerItem}>
              <Text style={styles.customerLabel}>Имя:</Text>
              <Text style={styles.customerValue}>{order.customer_name || 'Не указано'}</Text>
            </View>
            
            <View style={styles.customerItem}>
              <Text style={styles.customerLabel}>Телефон:</Text>
              <View style={styles.phoneContainer}>
                <Text style={styles.customerValue}>{order.customer_phone || 'Не указан'}</Text>
                {order.customer_phone && (
                  <IconButton
                    icon="phone"
                    size={20}
                    onPress={handleCallCustomer}
                    style={styles.phoneButton}
                  />
                )}
              </View>
            </View>
            
            {order.customer_email && (
              <View style={styles.customerItem}>
                <Text style={styles.customerLabel}>Email:</Text>
                <Text style={styles.customerValue}>{order.customer_email}</Text>
              </View>
            )}
          </View>
        </Card.Content>
      </Card>

      {/* Delivery Address */}
      {order.delivery_address && (
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Адрес доставки</Title>
            
            <View style={styles.addressContainer}>
              <Text style={styles.addressText}>
                {order.delivery_address.address || 'Адрес не указан'}
              </Text>
              <IconButton
                icon="map"
                size={20}
                onPress={handleOpenMaps}
                style={styles.mapButton}
              />
            </View>
            
            {order.delivery_address.notes && (
              <Text style={styles.addressNotes}>
                Примечание: {order.delivery_address.notes}
              </Text>
            )}
          </Card.Content>
        </Card>
      )}

      {/* Order Items */}
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Состав заказа</Title>
          {renderOrderItems()}
          
          <Divider style={styles.divider} />
          
          <View style={styles.orderSummary}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Сумма заказа:</Text>
              <Text style={styles.summaryValue}>{order.subtotal} ₽</Text>
            </View>
            
            {order.tax_amount > 0 && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>НДС:</Text>
                <Text style={styles.summaryValue}>{order.tax_amount} ₽</Text>
              </View>
            )}
            
            {order.delivery_fee > 0 && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Доставка:</Text>
                <Text style={styles.summaryValue}>{order.delivery_fee} ₽</Text>
              </View>
            )}
            
            <Divider style={styles.divider} />
            
            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>Итого:</Text>
              <Text style={styles.totalValue}>{order.total_amount} ₽</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Payment Info */}
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Оплата</Title>
          
          <View style={styles.paymentInfo}>
            <Text style={styles.paymentMethod}>
              Способ оплаты: {order.payment_method || 'Не указан'}
            </Text>
            <Text style={styles.paymentStatus}>
              Статус: {order.payment_status === 'paid' ? 'Оплачено' : 'Не оплачено'}
            </Text>
          </View>
        </Card.Content>
      </Card>

      {/* Notes */}
      {order.notes && (
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Примечания</Title>
            <Text style={styles.notesText}>{order.notes}</Text>
          </Card.Content>
        </Card>
      )}

      {/* Actions */}
      <View style={styles.actionsContainer}>
        {renderStatusActions()}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: theme.colors.text,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    color: theme.colors.error,
  },
  card: {
    margin: 16,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  statusChip: {
    borderRadius: 16,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  orderTime: {
    fontSize: 14,
    color: theme.colors.placeholder,
  },
  estimatedDelivery: {
    fontSize: 14,
    color: theme.colors.info,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: 12,
  },
  customerInfo: {
    gap: 8,
  },
  customerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  customerLabel: {
    fontSize: 14,
    color: theme.colors.placeholder,
    fontWeight: '500',
  },
  customerValue: {
    fontSize: 14,
    color: theme.colors.text,
    flex: 1,
    textAlign: 'right',
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-end',
  },
  phoneButton: {
    marginLeft: 8,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  addressText: {
    fontSize: 14,
    color: theme.colors.text,
    flex: 1,
  },
  mapButton: {
    marginLeft: 8,
  },
  addressNotes: {
    fontSize: 12,
    color: theme.colors.placeholder,
    marginTop: 8,
    fontStyle: 'italic',
  },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.background,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.text,
  },
  itemSku: {
    fontSize: 12,
    color: theme.colors.placeholder,
  },
  itemNotes: {
    fontSize: 12,
    color: theme.colors.info,
    fontStyle: 'italic',
  },
  itemQuantity: {
    width: 40,
    alignItems: 'center',
  },
  itemQuantityText: {
    fontSize: 14,
    color: theme.colors.text,
  },
  itemPrice: {
    width: 80,
    alignItems: 'flex-end',
  },
  itemPriceText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.primary,
  },
  noItems: {
    fontSize: 14,
    color: theme.colors.placeholder,
    textAlign: 'center',
    paddingVertical: 20,
  },
  divider: {
    marginVertical: 12,
  },
  orderSummary: {
    gap: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    color: theme.colors.text,
  },
  summaryValue: {
    fontSize: 14,
    color: theme.colors.text,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  paymentInfo: {
    gap: 8,
  },
  paymentMethod: {
    fontSize: 14,
    color: theme.colors.text,
  },
  paymentStatus: {
    fontSize: 14,
    color: theme.colors.text,
  },
  notesText: {
    fontSize: 14,
    color: theme.colors.text,
    fontStyle: 'italic',
  },
  actionsContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  actionButton: {
    marginBottom: 12,
  },
});

export default OrderDetailScreen;

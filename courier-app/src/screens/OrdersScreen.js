import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Chip,
  Button,
  ActivityIndicator,
  Text,
  Searchbar,
  FAB,
} from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { OrderService } from '../services/OrderService';
import { theme } from '../theme/theme';

const OrdersScreen = ({ navigation }) => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState(null);

  const statusOptions = [
    { key: null, label: 'Все', color: theme.colors.primary },
    { key: 'pending', label: 'Новые', color: theme.colors.warning },
    { key: 'confirmed', label: 'Принятые', color: theme.colors.info },
    { key: 'preparing', label: 'Готовятся', color: theme.colors.accent },
    { key: 'ready', label: 'Готовы', color: theme.colors.success },
    { key: 'delivered', label: 'Доставлены', color: theme.colors.primary },
  ];

  useFocusEffect(
    useCallback(() => {
      loadOrders();
    }, [])
  );

  const loadOrders = async () => {
    try {
      setIsLoading(true);
      const ordersData = await OrderService.getCourierOrders();
      setOrders(ordersData);
      applyFilters(ordersData, searchQuery, selectedStatus);
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось загрузить заказы');
      console.error('Load orders error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadOrders();
    setIsRefreshing(false);
  };

  const applyFilters = (ordersList, query, status) => {
    let filtered = ordersList;

    // Filter by status
    if (status) {
      filtered = filtered.filter(order => order.status === status);
    }

    // Filter by search query
    if (query.trim()) {
      filtered = filtered.filter(order =>
        order.order_number.toLowerCase().includes(query.toLowerCase()) ||
        order.customer_name?.toLowerCase().includes(query.toLowerCase()) ||
        order.customer_phone?.includes(query)
      );
    }

    setFilteredOrders(filtered);
  };

  const handleSearchChange = (query) => {
    setSearchQuery(query);
    applyFilters(orders, query, selectedStatus);
  };

  const handleStatusFilter = (status) => {
    setSelectedStatus(status);
    applyFilters(orders, searchQuery, status);
  };

  const getStatusColor = (status) => {
    const statusOption = statusOptions.find(option => option.key === status);
    return statusOption ? statusOption.color : theme.colors.primary;
  };

  const getStatusLabel = (status) => {
    const statusOption = statusOptions.find(option => option.key === status);
    return statusOption ? statusOption.label : status;
  };

  const formatOrderTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleOrderPress = (order) => {
    navigation.navigate('OrderDetail', { orderId: order.id });
  };

  const handleQuickAction = async (order, action) => {
    try {
      let newStatus;
      let message;

      switch (action) {
        case 'accept':
          newStatus = 'confirmed';
          message = 'Заказ принят';
          break;
        case 'start':
          newStatus = 'preparing';
          message = 'Начата доставка';
          break;
        case 'complete':
          newStatus = 'delivered';
          message = 'Заказ доставлен';
          break;
        default:
          return;
      }

      await OrderService.updateOrderStatus(order.id, newStatus);
      Alert.alert('Успех', message);
      loadOrders();
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось обновить статус заказа');
    }
  };

  const renderOrderItem = ({ item: order }) => (
    <Card style={styles.orderCard} onPress={() => handleOrderPress(order)}>
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

        <View style={styles.orderInfo}>
          <Paragraph style={styles.customerName}>
            👤 {order.customer_name || 'Без имени'}
          </Paragraph>
          <Paragraph style={styles.customerPhone}>
            📞 {order.customer_phone || 'Нет телефона'}
          </Paragraph>
          <Paragraph style={styles.orderTime}>
            🕐 {formatOrderTime(order.created_at)}
          </Paragraph>
          <Paragraph style={styles.orderTotal}>
            💰 {order.total_amount} ₽
          </Paragraph>
        </View>

        {order.delivery_address && (
          <View style={styles.deliveryInfo}>
            <Paragraph style={styles.deliveryAddress}>
              📍 {order.delivery_address.address || 'Адрес не указан'}
            </Paragraph>
          </View>
        )}

        <View style={styles.orderActions}>
          {order.status === 'pending' && (
            <Button
              mode="contained"
              onPress={() => handleQuickAction(order, 'accept')}
              style={styles.actionButton}
            >
              Принять
            </Button>
          )}
          {order.status === 'confirmed' && (
            <Button
              mode="contained"
              onPress={() => handleQuickAction(order, 'start')}
              style={styles.actionButton}
            >
              Начать доставку
            </Button>
          )}
          {order.status === 'ready' && (
            <Button
              mode="contained"
              onPress={() => handleQuickAction(order, 'complete')}
              style={styles.actionButton}
            >
              Завершить
            </Button>
          )}
        </View>
      </Card.Content>
    </Card>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateIcon}>📦</Text>
      <Title style={styles.emptyStateTitle}>Нет заказов</Title>
      <Paragraph style={styles.emptyStateText}>
        {selectedStatus
          ? `Нет заказов со статусом "${getStatusLabel(selectedStatus)}"`
          : 'Нет доступных заказов для доставки'
        }
      </Paragraph>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Загрузка заказов...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Searchbar
          placeholder="Поиск заказов..."
          onChangeText={handleSearchChange}
          value={searchQuery}
          style={styles.searchbar}
        />
        
        <View style={styles.statusFilters}>
          {statusOptions.map((option) => (
            <Chip
              key={option.key}
              selected={selectedStatus === option.key}
              onPress={() => handleStatusFilter(option.key)}
              style={[
                styles.filterChip,
                selectedStatus === option.key && { backgroundColor: option.color }
              ]}
              textStyle={[
                styles.filterChipText,
                selectedStatus === option.key && { color: 'white' }
              ]}
            >
              {option.label}
            </Chip>
          ))}
        </View>
      </View>

      <FlatList
        data={filteredOrders}
        renderItem={renderOrderItem}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[theme.colors.primary]}
          />
        }
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />

      <FAB
        style={styles.fab}
        icon="refresh"
        onPress={handleRefresh}
        disabled={isRefreshing}
      />
    </View>
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
  header: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 10,
    elevation: 2,
  },
  searchbar: {
    marginBottom: 10,
  },
  statusFilters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterChip: {
    marginRight: 8,
    marginBottom: 8,
  },
  filterChipText: {
    fontSize: 12,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 80,
  },
  orderCard: {
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
  orderInfo: {
    marginBottom: 12,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  customerPhone: {
    fontSize: 14,
    color: theme.colors.text,
    marginBottom: 4,
  },
  orderTime: {
    fontSize: 14,
    color: theme.colors.placeholder,
    marginBottom: 4,
  },
  orderTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  deliveryInfo: {
    marginBottom: 12,
    padding: 8,
    backgroundColor: theme.colors.background,
    borderRadius: 8,
  },
  deliveryAddress: {
    fontSize: 14,
    color: theme.colors.text,
  },
  orderActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionButton: {
    marginLeft: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: theme.colors.placeholder,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.primary,
  },
});

export default OrdersScreen;

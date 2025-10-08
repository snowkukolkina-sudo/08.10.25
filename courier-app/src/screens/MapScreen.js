import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  Dimensions,
} from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import {
  Card,
  Title,
  Paragraph,
  Button,
  ActivityIndicator,
  Text,
  Chip,
  FAB,
} from 'react-native-paper';
import { OrderService } from '../services/OrderService';
import { LocationService } from '../services/LocationService';
import { theme } from '../theme/theme';

const { width, height } = Dimensions.get('window');

const MapScreen = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTrackingLocation, setIsTrackingLocation] = useState(false);
  const mapRef = useRef(null);

  useEffect(() => {
    initializeMap();
    return () => {
      LocationService.stopLocationTracking();
    };
  }, []);

  const initializeMap = async () => {
    try {
      setIsLoading(true);
      
      // Get current location
      const location = await LocationService.getCurrentPosition();
      setCurrentLocation(location);
      
      // Load orders
      await loadOrders();
      
      // Start location tracking
      startLocationTracking();
      
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось инициализировать карту');
      console.error('Map initialization error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadOrders = async () => {
    try {
      const ordersData = await OrderService.getCourierOrders();
      setOrders(ordersData);
    } catch (error) {
      console.error('Load orders error:', error);
    }
  };

  const startLocationTracking = () => {
    setIsTrackingLocation(true);
    LocationService.startLocationTracking((location) => {
      setCurrentLocation(location);
      
      // Update map region to follow user
      if (mapRef.current) {
        mapRef.current.animateToRegion({
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
      }
    });
  };

  const stopLocationTracking = () => {
    setIsTrackingLocation(false);
    LocationService.stopLocationTracking();
  };

  const handleOrderPress = (order) => {
    setSelectedOrder(order);
    
    // Center map on order location
    if (order.delivery_address && order.delivery_address.coordinates) {
      const { latitude, longitude } = order.delivery_address.coordinates;
      
      if (mapRef.current) {
        mapRef.current.animateToRegion({
          latitude,
          longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
      }
      
      // Calculate route if we have current location
      if (currentLocation) {
        calculateRoute(currentLocation, { latitude, longitude });
      }
    }
  };

  const calculateRoute = async (start, end) => {
    try {
      // This is a simplified route calculation
      // In a real app, you would use a routing service like Google Directions API
      const route = [
        start,
        {
          latitude: (start.latitude + end.latitude) / 2,
          longitude: (start.longitude + end.longitude) / 2,
        },
        end,
      ];
      
      setRouteCoordinates(route);
    } catch (error) {
      console.error('Route calculation error:', error);
    }
  };

  const getOrderStatusColor = (status) => {
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

  const getOrderStatusLabel = (status) => {
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

  const renderOrderCard = () => {
    if (!selectedOrder) return null;

    return (
      <Card style={styles.orderCard}>
        <Card.Content>
          <View style={styles.orderHeader}>
            <Title style={styles.orderNumber}>#{selectedOrder.order_number}</Title>
            <Chip
              style={[
                styles.statusChip,
                { backgroundColor: getOrderStatusColor(selectedOrder.status) }
              ]}
              textStyle={styles.statusText}
            >
              {getOrderStatusLabel(selectedOrder.status)}
            </Chip>
          </View>

          <Paragraph style={styles.customerName}>
            👤 {selectedOrder.customer_name || 'Без имени'}
          </Paragraph>
          
          <Paragraph style={styles.customerPhone}>
            📞 {selectedOrder.customer_phone || 'Нет телефона'}
          </Paragraph>
          
          <Paragraph style={styles.orderTotal}>
            💰 {selectedOrder.total_amount} ₽
          </Paragraph>

          {selectedOrder.delivery_address && (
            <Paragraph style={styles.deliveryAddress}>
              📍 {selectedOrder.delivery_address.address || 'Адрес не указан'}
            </Paragraph>
          )}

          <View style={styles.orderActions}>
            {selectedOrder.status === 'pending' && (
              <Button
                mode="contained"
                onPress={() => handleQuickAction(selectedOrder, 'accept')}
                style={styles.actionButton}
              >
                Принять
              </Button>
            )}
            {selectedOrder.status === 'confirmed' && (
              <Button
                mode="contained"
                onPress={() => handleQuickAction(selectedOrder, 'start')}
                style={styles.actionButton}
              >
                Начать доставку
              </Button>
            )}
            {selectedOrder.status === 'ready' && (
              <Button
                mode="contained"
                onPress={() => handleQuickAction(selectedOrder, 'complete')}
                style={styles.actionButton}
              >
                Завершить
              </Button>
            )}
          </View>
        </Card.Content>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Загрузка карты...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          latitude: currentLocation?.latitude || 55.7558,
          longitude: currentLocation?.longitude || 37.6176,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        showsUserLocation={true}
        showsMyLocationButton={true}
        showsCompass={true}
        showsScale={true}
      >
        {/* Current location marker */}
        {currentLocation && (
          <Marker
            coordinate={currentLocation}
            title="Мое местоположение"
            description="Текущее местоположение курьера"
            pinColor="blue"
          />
        )}

        {/* Order markers */}
        {orders.map((order) => {
          if (!order.delivery_address?.coordinates) return null;
          
          const { latitude, longitude } = order.delivery_address.coordinates;
          
          return (
            <Marker
              key={order.id}
              coordinate={{ latitude, longitude }}
              title={`Заказ #${order.order_number}`}
              description={`${order.customer_name || 'Без имени'} - ${order.total_amount} ₽`}
              pinColor={getOrderStatusColor(order.status)}
              onPress={() => handleOrderPress(order)}
            />
          );
        })}

        {/* Route polyline */}
        {routeCoordinates.length > 0 && (
          <Polyline
            coordinates={routeCoordinates}
            strokeColor={theme.colors.primary}
            strokeWidth={3}
            lineDashPattern={[5, 5]}
          />
        )}
      </MapView>

      {/* Order details card */}
      {renderOrderCard()}

      {/* Location tracking FAB */}
      <FAB
        style={styles.trackingFab}
        icon={isTrackingLocation ? 'stop' : 'play'}
        onPress={isTrackingLocation ? stopLocationTracking : startLocationTracking}
        label={isTrackingLocation ? 'Остановить' : 'Отслеживать'}
      />

      {/* Refresh FAB */}
      <FAB
        style={styles.refreshFab}
        icon="refresh"
        onPress={loadOrders}
        small
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  map: {
    width: width,
    height: height,
  },
  orderCard: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    elevation: 8,
    maxHeight: height * 0.4,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  statusChip: {
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  customerName: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  customerPhone: {
    fontSize: 12,
    color: theme.colors.text,
    marginBottom: 4,
  },
  orderTotal: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: 4,
  },
  deliveryAddress: {
    fontSize: 12,
    color: theme.colors.text,
    marginBottom: 12,
  },
  orderActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionButton: {
    marginLeft: 8,
  },
  trackingFab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    top: 100,
    backgroundColor: theme.colors.primary,
  },
  refreshFab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    top: 200,
    backgroundColor: theme.colors.accent,
  },
});

export default MapScreen;

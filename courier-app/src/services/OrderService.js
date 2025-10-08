import { AuthService } from './AuthService';
import { API_BASE_URL } from '../config/api';

export class OrderService {
  static async getCourierOrders(status = null) {
    try {
      let url = `${API_BASE_URL}/api/v1/orders`;
      const params = new URLSearchParams();
      
      if (status) {
        params.append('status', status);
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await AuthService.makeAuthenticatedRequest(url);
      const data = await response.json();

      if (data.success) {
        return data.data;
      } else {
        throw new Error(data.error || 'Ошибка получения заказов');
      }
    } catch (error) {
      console.error('Get orders error:', error);
      throw error;
    }
  }

  static async getOrderById(orderId) {
    try {
      const response = await AuthService.makeAuthenticatedRequest(
        `${API_BASE_URL}/api/v1/orders/${orderId}`
      );
      const data = await response.json();

      if (data.success) {
        return data.data;
      } else {
        throw new Error(data.error || 'Ошибка получения заказа');
      }
    } catch (error) {
      console.error('Get order error:', error);
      throw error;
    }
  }

  static async updateOrderStatus(orderId, status, notes = null) {
    try {
      const response = await AuthService.makeAuthenticatedRequest(
        `${API_BASE_URL}/api/v1/orders/${orderId}/status`,
        {
          method: 'PATCH',
          body: JSON.stringify({ status, notes }),
        }
      );
      const data = await response.json();

      if (data.success) {
        return data.data;
      } else {
        throw new Error(data.error || 'Ошибка обновления статуса');
      }
    } catch (error) {
      console.error('Update order status error:', error);
      throw error;
    }
  }

  static async acceptOrder(orderId) {
    return this.updateOrderStatus(orderId, 'confirmed', 'Заказ принят курьером');
  }

  static async startDelivery(orderId) {
    return this.updateOrderStatus(orderId, 'preparing', 'Курьер выехал за заказом');
  }

  static async arriveAtRestaurant(orderId) {
    return this.updateOrderStatus(orderId, 'ready', 'Курьер прибыл в ресторан');
  }

  static async startDeliveryToCustomer(orderId) {
    return this.updateOrderStatus(orderId, 'delivered', 'Курьер выехал к клиенту');
  }

  static async completeDelivery(orderId, notes = null) {
    return this.updateOrderStatus(orderId, 'delivered', notes || 'Заказ доставлен');
  }

  static async cancelOrder(orderId, reason) {
    try {
      const response = await AuthService.makeAuthenticatedRequest(
        `${API_BASE_URL}/api/v1/orders/${orderId}/cancel`,
        {
          method: 'PATCH',
          body: JSON.stringify({ reason }),
        }
      );
      const data = await response.json();

      if (data.success) {
        return data.data;
      } else {
        throw new Error(data.error || 'Ошибка отмены заказа');
      }
    } catch (error) {
      console.error('Cancel order error:', error);
      throw error;
    }
  }

  static async getOrderHistory() {
    try {
      const response = await AuthService.makeAuthenticatedRequest(
        `${API_BASE_URL}/api/v1/orders?status=delivered&limit=50`
      );
      const data = await response.json();

      if (data.success) {
        return data.data;
      } else {
        throw new Error(data.error || 'Ошибка получения истории');
      }
    } catch (error) {
      console.error('Get order history error:', error);
      throw error;
    }
  }

  static async getOrderStatistics() {
    try {
      const response = await AuthService.makeAuthenticatedRequest(
        `${API_BASE_URL}/api/v1/orders/stats`
      );
      const data = await response.json();

      if (data.success) {
        return data.data;
      } else {
        throw new Error(data.error || 'Ошибка получения статистики');
      }
    } catch (error) {
      console.error('Get order statistics error:', error);
      throw error;
    }
  }
}

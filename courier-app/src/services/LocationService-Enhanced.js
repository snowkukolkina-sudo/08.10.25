import Geolocation from '@react-native-community/geolocation';
import AsyncStorage from '@react-native-async-storage/async-storage';

class LocationService {
  constructor() {
    this.watchId = null;
    this.currentLocation = null;
    this.trackingInterval = null;
    this.apiUrl = 'http://localhost:3000/api/courier';
  }

  // Запустить отслеживание GPS
  startTracking() {
    console.log('📍 Запуск GPS трекинга...');
    
    // Получить текущую позицию
    this.getCurrentPosition();
    
    // Отслеживать изменения позиции
    this.watchId = Geolocation.watchPosition(
      (position) => {
        this.currentLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp,
        };
        
        console.log('📍 Позиция обновлена:', this.currentLocation);
        this.sendLocationToServer();
      },
      (error) => {
        console.error('❌ Ошибка геолокации:', error);
      },
      {
        enableHighAccuracy: true,
        distanceFilter: 50, // Обновлять каждые 50 метров
        interval: 10000, // Каждые 10 секунд
        fastestInterval: 5000, // Минимум 5 секунд между обновлениями
      }
    );

    // Отправлять координаты на сервер каждые 15 секунд
    this.trackingInterval = setInterval(() => {
      this.sendLocationToServer();
    }, 15000);
  }

  // Остановить отслеживание
  stopTracking() {
    console.log('🛑 Остановка GPS трекинга...');
    
    if (this.watchId !== null) {
      Geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }

    if (this.trackingInterval) {
      clearInterval(this.trackingInterval);
      this.trackingInterval = null;
    }

    this.currentLocation = null;
  }

  // Получить текущую позицию
  async getCurrentPosition() {
    return new Promise((resolve, reject) => {
      Geolocation.getCurrentPosition(
        (position) => {
          this.currentLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp,
          };
          resolve(this.currentLocation);
        },
        (error) => {
          console.error('Ошибка получения позиции:', error);
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 10000,
        }
      );
    });
  }

  // Отправить координаты на сервер
  async sendLocationToServer() {
    if (!this.currentLocation) return;

    try {
      const courierId = await this.getCourierId();
      if (!courierId) return;

      const response = await fetch(`${this.apiUrl}/location`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          courierId,
          latitude: this.currentLocation.latitude,
          longitude: this.currentLocation.longitude,
          accuracy: this.currentLocation.accuracy,
          timestamp: this.currentLocation.timestamp,
        }),
      });

      if (response.ok) {
        console.log('✅ Координаты отправлены на сервер');
      }
    } catch (error) {
      console.error('❌ Ошибка отправки координат:', error);
    }
  }

  // Получить ID курьера из хранилища
  async getCourierId() {
    try {
      const courier = await AsyncStorage.getItem('courier');
      if (courier) {
        const courierData = JSON.parse(courier);
        return courierData.id;
      }
    } catch (error) {
      console.error('Ошибка получения ID курьера:', error);
    }
    return null;
  }

  // Рассчитать расстояние между двумя точками (Haversine formula)
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Радиус Земли в км
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) *
        Math.cos(this.deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Расстояние в км
    return distance;
  }

  deg2rad(deg) {
    return deg * (Math.PI / 180);
  }

  // Форматировать расстояние для отображения
  formatDistance(distanceInKm) {
    if (distanceInKm < 1) {
      return `${Math.round(distanceInKm * 1000)}м`;
    }
    return `${distanceInKm.toFixed(1)}км`;
  }

  // Рассчитать примерное время в пути (средняя скорость 30 км/ч)
  estimateTime(distanceInKm) {
    const averageSpeed = 30; // км/ч
    const timeInHours = distanceInKm / averageSpeed;
    const timeInMinutes = Math.round(timeInHours * 60);
    
    if (timeInMinutes < 60) {
      return `${timeInMinutes} мин`;
    }
    const hours = Math.floor(timeInMinutes / 60);
    const minutes = timeInMinutes % 60;
    return `${hours}ч ${minutes}мин`;
  }

  // Получить текущие координаты
  getLocation() {
    return this.currentLocation;
  }

  // Проверить разрешения
  async checkPermissions() {
    return new Promise((resolve) => {
      Geolocation.getCurrentPosition(
        () => resolve(true),
        () => resolve(false),
        { enableHighAccuracy: false, timeout: 2000 }
      );
    });
  }
}

export default new LocationService();

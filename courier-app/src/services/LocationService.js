import Geolocation from 'react-native-geolocation-service';
import { PermissionsAndroid, Platform, Alert } from 'react-native';

export class LocationService {
  static isInitialized = false;
  static currentLocation = null;
  static watchId = null;

  static async initialize() {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Разрешение на геолокацию',
            message: 'Приложению необходимо разрешение на доступ к геолокации для работы с заказами',
            buttonNeutral: 'Спросить позже',
            buttonNegative: 'Отмена',
            buttonPositive: 'OK',
          }
        );

        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          throw new Error('Разрешение на геолокацию не предоставлено');
        }
      }

      this.isInitialized = true;
      await this.getCurrentPosition();
    } catch (error) {
      console.error('Location service initialization error:', error);
      Alert.alert('Ошибка', 'Не удалось инициализировать геолокацию');
    }
  }

  static async getCurrentPosition() {
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
          console.error('Get current position error:', error);
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

  static startLocationTracking(callback) {
    if (!this.isInitialized) {
      console.error('Location service not initialized');
      return;
    }

    this.watchId = Geolocation.watchPosition(
      (position) => {
        this.currentLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp,
        };
        
        if (callback) {
          callback(this.currentLocation);
        }
      },
      (error) => {
        console.error('Location tracking error:', error);
      },
      {
        enableHighAccuracy: true,
        distanceFilter: 10, // Update every 10 meters
        interval: 5000, // Update every 5 seconds
        fastestInterval: 2000, // Fastest update every 2 seconds
      }
    );
  }

  static stopLocationTracking() {
    if (this.watchId) {
      Geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
  }

  static calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) *
        Math.cos(this.deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in kilometers
    return distance;
  }

  static deg2rad(deg) {
    return deg * (Math.PI / 180);
  }

  static getCurrentLocation() {
    return this.currentLocation;
  }

  static async getAddressFromCoordinates(latitude, longitude) {
    try {
      const response = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=ru`
      );
      const data = await response.json();
      
      return {
        address: data.localityInfo?.administrative?.[0]?.name || 'Неизвестный адрес',
        city: data.city || data.locality || 'Неизвестный город',
        country: data.countryName || 'Россия',
      };
    } catch (error) {
      console.error('Get address error:', error);
      return {
        address: 'Неизвестный адрес',
        city: 'Неизвестный город',
        country: 'Россия',
      };
    }
  }

  static async getCoordinatesFromAddress(address) {
    try {
      const response = await fetch(
        `https://api.bigdatacloud.net/data/forward-geocode-client?query=${encodeURIComponent(address)}&localityLanguage=ru`
      );
      const data = await response.json();
      
      if (data.results && data.results.length > 0) {
        const result = data.results[0];
        return {
          latitude: result.latitude,
          longitude: result.longitude,
          address: result.formattedAddress,
        };
      }
      
      throw new Error('Адрес не найден');
    } catch (error) {
      console.error('Get coordinates error:', error);
      throw error;
    }
  }
}

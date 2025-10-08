import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  Switch,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  List,
  Divider,
  Switch as PaperSwitch,
  Button,
  Text,
} from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { theme } from '../theme/theme';

const SETTINGS_KEYS = {
  NOTIFICATIONS: 'notifications_enabled',
  LOCATION_TRACKING: 'location_tracking_enabled',
  AUTO_ACCEPT_ORDERS: 'auto_accept_orders',
  SOUND_ENABLED: 'sound_enabled',
  VIBRATION_ENABLED: 'vibration_enabled',
  DARK_MODE: 'dark_mode_enabled',
};

const SettingsScreen = () => {
  const [settings, setSettings] = useState({
    notifications: true,
    locationTracking: true,
    autoAcceptOrders: false,
    soundEnabled: true,
    vibrationEnabled: true,
    darkMode: false,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const loadedSettings = {};
      
      for (const [key, storageKey] of Object.entries(SETTINGS_KEYS)) {
        const value = await AsyncStorage.getItem(storageKey);
        loadedSettings[key.toLowerCase()] = value !== null ? JSON.parse(value) : getDefaultValue(key);
      }
      
      setSettings(loadedSettings);
    } catch (error) {
      console.error('Load settings error:', error);
    }
  };

  const getDefaultValue = (key) => {
    switch (key) {
      case 'NOTIFICATIONS':
      case 'LOCATION_TRACKING':
      case 'SOUND_ENABLED':
      case 'VIBRATION_ENABLED':
        return true;
      case 'AUTO_ACCEPT_ORDERS':
      case 'DARK_MODE':
        return false;
      default:
        return false;
    }
  };

  const updateSetting = async (key, value) => {
    try {
      const storageKey = SETTINGS_KEYS[key];
      await AsyncStorage.setItem(storageKey, JSON.stringify(value));
      
      setSettings(prev => ({
        ...prev,
        [key.toLowerCase()]: value,
      }));
    } catch (error) {
      console.error('Update setting error:', error);
      Alert.alert('Ошибка', 'Не удалось сохранить настройку');
    }
  };

  const handleResetSettings = () => {
    Alert.alert(
      'Сброс настроек',
      'Вы уверены, что хотите сбросить все настройки к значениям по умолчанию?',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Сбросить',
          style: 'destructive',
          onPress: resetAllSettings,
        },
      ]
    );
  };

  const resetAllSettings = async () => {
    try {
      for (const storageKey of Object.values(SETTINGS_KEYS)) {
        await AsyncStorage.removeItem(storageKey);
      }
      
      const defaultSettings = {};
      for (const key of Object.keys(SETTINGS_KEYS)) {
        defaultSettings[key.toLowerCase()] = getDefaultValue(key);
      }
      
      setSettings(defaultSettings);
      Alert.alert('Успех', 'Настройки сброшены к значениям по умолчанию');
    } catch (error) {
      console.error('Reset settings error:', error);
      Alert.alert('Ошибка', 'Не удалось сбросить настройки');
    }
  };

  const handleClearCache = () => {
    Alert.alert(
      'Очистка кэша',
      'Это удалит все временные данные приложения. Продолжить?',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Очистить',
          style: 'destructive',
          onPress: clearCache,
        },
      ]
    );
  };

  const clearCache = async () => {
    try {
      // Clear all AsyncStorage data except settings
      const keys = await AsyncStorage.getAllKeys();
      const settingsKeys = Object.values(SETTINGS_KEYS);
      const keysToRemove = keys.filter(key => !settingsKeys.includes(key));
      
      await AsyncStorage.multiRemove(keysToRemove);
      Alert.alert('Успех', 'Кэш очищен');
    } catch (error) {
      console.error('Clear cache error:', error);
      Alert.alert('Ошибка', 'Не удалось очистить кэш');
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Notifications Settings */}
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Уведомления</Title>
          
          <List.Item
            title="Push-уведомления"
            description="Получать уведомления о новых заказах"
            left={(props) => <List.Icon {...props} icon="bell" />}
            right={() => (
              <PaperSwitch
                value={settings.notifications}
                onValueChange={(value) => updateSetting('NOTIFICATIONS', value)}
                color={theme.colors.primary}
              />
            )}
          />
          
          <Divider />
          
          <List.Item
            title="Звуковые уведомления"
            description="Воспроизводить звук при получении уведомлений"
            left={(props) => <List.Icon {...props} icon="volume-high" />}
            right={() => (
              <PaperSwitch
                value={settings.soundEnabled}
                onValueChange={(value) => updateSetting('SOUND_ENABLED', value)}
                color={theme.colors.primary}
              />
            )}
          />
          
          <Divider />
          
          <List.Item
            title="Вибрация"
            description="Вибрация при получении уведомлений"
            left={(props) => <List.Icon {...props} icon="vibrate" />}
            right={() => (
              <PaperSwitch
                value={settings.vibrationEnabled}
                onValueChange={(value) => updateSetting('VIBRATION_ENABLED', value)}
                color={theme.colors.primary}
              />
            )}
          />
        </Card.Content>
      </Card>

      {/* Location Settings */}
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Геолокация</Title>
          
          <List.Item
            title="Отслеживание местоположения"
            description="Автоматическое отслеживание местоположения курьера"
            left={(props) => <List.Icon {...props} icon="map-marker" />}
            right={() => (
              <PaperSwitch
                value={settings.locationTracking}
                onValueChange={(value) => updateSetting('LOCATION_TRACKING', value)}
                color={theme.colors.primary}
              />
            )}
          />
        </Card.Content>
      </Card>

      {/* Order Settings */}
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Заказы</Title>
          
          <List.Item
            title="Автоматический прием заказов"
            description="Автоматически принимать новые заказы"
            left={(props) => <List.Icon {...props} icon="auto-fix" />}
            right={() => (
              <PaperSwitch
                value={settings.autoAcceptOrders}
                onValueChange={(value) => updateSetting('AUTO_ACCEPT_ORDERS', value)}
                color={theme.colors.primary}
              />
            )}
          />
        </Card.Content>
      </Card>

      {/* Appearance Settings */}
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Внешний вид</Title>
          
          <List.Item
            title="Темная тема"
            description="Использовать темную тему приложения"
            left={(props) => <List.Icon {...props} icon="theme-light-dark" />}
            right={() => (
              <PaperSwitch
                value={settings.darkMode}
                onValueChange={(value) => updateSetting('DARK_MODE', value)}
                color={theme.colors.primary}
              />
            )}
          />
        </Card.Content>
      </Card>

      {/* App Info */}
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.sectionTitle}>О приложении</Title>
          
          <List.Item
            title="Версия"
            description="1.0.0"
            left={(props) => <List.Icon {...props} icon="information" />}
          />
          
          <Divider />
          
          <List.Item
            title="Разработчик"
            description="DANDY Team"
            left={(props) => <List.Icon {...props} icon="account-group" />}
          />
          
          <Divider />
          
          <List.Item
            title="Лицензия"
            description="MIT License"
            left={(props) => <List.Icon {...props} icon="file-document" />}
          />
        </Card.Content>
      </Card>

      {/* Actions */}
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Действия</Title>
          
          <Button
            mode="outlined"
            onPress={handleClearCache}
            style={styles.actionButton}
            icon="delete-sweep"
          >
            Очистить кэш
          </Button>
          
          <Button
            mode="outlined"
            onPress={handleResetSettings}
            style={styles.actionButton}
            icon="restore"
            textColor={theme.colors.error}
          >
            Сбросить настройки
          </Button>
        </Card.Content>
      </Card>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          DANDY Courier App v1.0.0
        </Text>
        <Text style={styles.footerText}>
          © 2024 DANDY Team. Все права защищены.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  card: {
    margin: 16,
    marginTop: 0,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: 12,
  },
  actionButton: {
    marginBottom: 12,
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: theme.colors.placeholder,
    textAlign: 'center',
    marginBottom: 4,
  },
});

export default SettingsScreen;

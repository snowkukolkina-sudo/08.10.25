import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Button,
  Avatar,
  List,
  Divider,
  ActivityIndicator,
  Text,
} from 'react-native-paper';
import { AuthService } from '../services/AuthService';
import { OrderService } from '../services/OrderService';
import { theme } from '../theme/theme';

const ProfileScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [statistics, setStatistics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      setIsLoading(true);
      
      // Load user data
      const userData = await AuthService.getStoredUser();
      setUser(userData);
      
      // Load statistics
      const stats = await OrderService.getOrderStatistics();
      setStatistics(stats);
      
    } catch (error) {
      console.error('Load profile data error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Выход',
      'Вы уверены, что хотите выйти из приложения?',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Выйти',
          style: 'destructive',
          onPress: () => {
            AuthService.logout();
            navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            });
          },
        },
      ]
    );
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Загрузка профиля...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Profile Header */}
      <Card style={styles.profileCard}>
        <Card.Content style={styles.profileContent}>
          <Avatar.Text
            size={80}
            label={user?.first_name?.[0] || user?.username?.[0] || 'К'}
            style={styles.avatar}
          />
          
          <View style={styles.profileInfo}>
            <Title style={styles.profileName}>
              {user?.first_name} {user?.last_name}
            </Title>
            <Paragraph style={styles.profileRole}>
              Курьер • {user?.username}
            </Paragraph>
            <Paragraph style={styles.profileEmail}>
              {user?.email}
            </Paragraph>
          </View>
        </Card.Content>
      </Card>

      {/* Statistics */}
      {statistics && (
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Статистика</Title>
            
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{statistics.total_orders || 0}</Text>
                <Text style={styles.statLabel}>Всего заказов</Text>
              </View>
              
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{statistics.completed_orders || 0}</Text>
                <Text style={styles.statLabel}>Доставлено</Text>
              </View>
              
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{statistics.total_earnings || 0} ₽</Text>
                <Text style={styles.statLabel}>Заработано</Text>
              </View>
            </View>
          </Card.Content>
        </Card>
      )}

      {/* Profile Actions */}
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Действия</Title>
          
          <List.Item
            title="История заказов"
            description="Просмотр выполненных заказов"
            left={(props) => <List.Icon {...props} icon="history" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => {
              // Navigate to order history
              Alert.alert('Информация', 'История заказов будет доступна в следующей версии');
            }}
          />
          
          <Divider />
          
          <List.Item
            title="Настройки"
            description="Настройки приложения"
            left={(props) => <List.Icon {...props} icon="settings" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => {
              // Navigate to settings
              Alert.alert('Информация', 'Настройки будут доступны в следующей версии');
            }}
          />
          
          <Divider />
          
          <List.Item
            title="Справка"
            description="Помощь и поддержка"
            left={(props) => <List.Icon {...props} icon="help-circle" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => {
              Alert.alert(
                'Справка',
                'DANDY Courier App v1.0\n\nДля получения поддержки обращайтесь к администратору системы.'
              );
            }}
          />
        </Card.Content>
      </Card>

      {/* Account Info */}
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Информация об аккаунте</Title>
          
          <View style={styles.accountInfo}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Статус:</Text>
              <Text style={styles.infoValue}>
                {user?.status === 'active' ? 'Активен' : 'Неактивен'}
              </Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Последний вход:</Text>
              <Text style={styles.infoValue}>
                {user?.last_login ? formatDate(user.last_login) : 'Неизвестно'}
              </Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Телефон:</Text>
              <Text style={styles.infoValue}>
                {user?.phone || 'Не указан'}
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Logout Button */}
      <View style={styles.logoutContainer}>
        <Button
          mode="outlined"
          onPress={handleLogout}
          style={styles.logoutButton}
          textColor={theme.colors.error}
        >
          Выйти из аккаунта
        </Button>
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
  profileCard: {
    margin: 16,
    elevation: 2,
  },
  profileContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    backgroundColor: theme.colors.primary,
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  profileRole: {
    fontSize: 14,
    color: theme.colors.placeholder,
    marginTop: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: theme.colors.text,
    marginTop: 2,
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
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  statLabel: {
    fontSize: 12,
    color: theme.colors.placeholder,
    marginTop: 4,
    textAlign: 'center',
  },
  accountInfo: {
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 14,
    color: theme.colors.placeholder,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: theme.colors.text,
  },
  logoutContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  logoutButton: {
    borderColor: theme.colors.error,
  },
});

export default ProfileScreen;

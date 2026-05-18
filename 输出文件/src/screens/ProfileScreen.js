import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { getColors } from '../utils/colors';

export default function ProfileScreen({ navigation }) {
  const { currentUser, masteredWordIds, streak, totalStudyMinutes, settings, logout } = useApp();

  const isDark = settings.theme === 'dark';
  const colors = getColors(isDark);

  const getAvatarText = () => {
    return currentUser ? currentUser.charAt(0).toUpperCase() : 'T';
  };

  const handleLogout = async () => {
    Alert.alert(
      '退出登录',
      '确定要退出当前账号吗？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '确定',
          style: 'destructive',
          onPress: async () => {
            await logout();
            Alert.alert('提示', '已退出登录，现在以游客身份使用');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* User Card */}
        <View style={[styles.userCard, { backgroundColor: colors.card }]}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{getAvatarText()}</Text>
            </View>
          </View>
          <View style={styles.userInfo}>
            <Text style={[styles.username, { color: colors.text }]}>
              {currentUser || '游客'}
            </Text>
            <Text style={[styles.userStatus, { color: colors.textSecondary }]}>
              {currentUser ? '已登录' : '未登录'}
            </Text>
          </View>
          {currentUser ? (
            <TouchableOpacity
              style={[styles.switchButton, { borderColor: colors.danger }]}
              onPress={handleLogout}
            >
              <Text style={[styles.switchButtonText, { color: colors.danger }]}>
                退出登录
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.switchButton, { borderColor: colors.primary }]}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={[styles.switchButtonText, { color: colors.primary }]}>
                登录
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Achievement Badges */}
        <View style={[styles.achievementCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>成就徽章</Text>
          <View style={styles.badges}>
            <View style={[styles.badgeItem, { opacity: 1 }]}>
              <View style={[styles.badgeIconContainer, { backgroundColor: 'rgba(0,0,0,0.03)', borderColor: colors.border }]}>
                <Ionicons name="sunny-outline" size={28} color={colors.primary} />
              </View>
              <Text style={[styles.badgeLabel, { color: colors.text }]}>早起打卡</Text>
            </View>
            <View style={[styles.badgeItem, { opacity: 1 }]}>
              <View style={[styles.badgeIconContainer, { backgroundColor: 'rgba(0,0,0,0.03)', borderColor: colors.border }]}>
                <Ionicons name="ribbon-outline" size={28} color={colors.primary} />
              </View>
              <Text style={[styles.badgeLabel, { color: colors.text }]}>百词斩</Text>
            </View>
            <View style={[styles.badgeItem, { opacity: 0.5 }]}>
              <View style={[styles.badgeIconContainer, { backgroundColor: 'rgba(0,0,0,0.03)', borderColor: colors.border }]}>
                <Ionicons name="lock-closed-outline" size={28} color={colors.textTertiary} />
              </View>
              <Text style={[styles.badgeLabel, { color: colors.textTertiary }]}>未解锁</Text>
            </View>
          </View>
        </View>

        {/* Settings Links */}
        <View style={[styles.settingsCard, { backgroundColor: colors.card }]}>
          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => navigation.navigate('LearningSettings')}
          >
            <View style={styles.settingLeft}>
              <Ionicons name="book-outline" size={20} color={colors.textSecondary} />
              <Text style={[styles.settingLabel, { color: colors.text }]}>学习设置</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => navigation.navigate('AppearanceSettings')}
          >
            <View style={styles.settingLeft}>
              <Ionicons name="color-palette-outline" size={20} color={colors.textSecondary} />
              <Text style={[styles.settingLabel, { color: colors.text }]}>外观</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => navigation.navigate('Settings')}
          >
            <View style={styles.settingLeft}>
              <Ionicons name="settings-outline" size={20} color={colors.textSecondary} />
              <Text style={[styles.settingLabel, { color: colors.text }]}>更多设置</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
          </TouchableOpacity>
        </View>

        {/* Stats Summary */}
        <View style={[styles.statsCard, { backgroundColor: colors.card }]}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: colors.primary }]}>{streak}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>连续天数</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: colors.success }]}>
                {masteredWordIds.length}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>掌握单词</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: colors.purple }]}>
                {totalStudyMinutes}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>学习分钟</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  backButton: {
    padding: 8,
  },
  userCard: {
    marginHorizontal: 16,
    padding: 20,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#8b5cf6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
  },
  userInfo: {
    flex: 1,
  },
  username: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  userStatus: {
    fontSize: 14,
    marginTop: 4,
  },
  switchButton: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  switchButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  achievementCard: {
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  badges: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  badgeItem: {
    alignItems: 'center',
    gap: 8,
  },
  badgeIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  badgeLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  settingsCard: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  settingLabel: {
    fontSize: 16,
  },
  divider: {
    height: 1,
    marginLeft: 48,
  },
  statsCard: {
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#e5e7eb',
  },
});

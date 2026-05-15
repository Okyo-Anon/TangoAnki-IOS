import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { getColors } from '../utils/colors';

export default function LoginScreen({ navigation }) {
  const { switchUser } = useApp();
  const [username, setUsername] = useState('');
  const { settings } = useApp();
  const isDark = settings.theme === 'dark';
  const colors = getColors(isDark);

  const handleLogin = async () => {
    const trimmedUsername = username.trim();
    if (!trimmedUsername) {
      Alert.alert('提示', '请输入用户名');
      return;
    }
    if (trimmedUsername.length < 2) {
      Alert.alert('提示', '用户名至少需要2个字符');
      return;
    }
    await switchUser(trimmedUsername);
    Alert.alert('成功', `已切换到账号：${trimmedUsername}`);
    navigation.goBack();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Login Card */}
        <View style={[styles.loginCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.title, { color: colors.text }]}>切换账号</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            输入用户名登录或注册新账号
          </Text>

          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.background,
                color: colors.text,
                borderColor: colors.border,
              },
            ]}
            placeholder="请输入用户名"
            placeholderTextColor={colors.textTertiary}
            value={username}
            onChangeText={setUsername}
            autoFocus
            maxLength={20}
          />

          <TouchableOpacity
            style={[styles.loginButton, { backgroundColor: colors.primary }]}
            onPress={handleLogin}
          >
            <Text style={styles.loginButtonText}>确定</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    paddingVertical: 8,
  },
  backButton: {
    padding: 8,
  },
  loginCard: {
    borderRadius: 16,
    padding: 24,
    marginTop: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    marginBottom: 16,
  },
  loginButton: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

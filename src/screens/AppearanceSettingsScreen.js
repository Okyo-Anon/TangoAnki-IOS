import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { getColors } from '../utils/colors';

export default function AppearanceSettingsScreen({ navigation }) {
  const { settings, updateSettings } = useApp();
  const isDark = settings.theme === 'dark';
  const colors = getColors(isDark);

  const themeOptions = [
    { value: 'light', label: '浅色', icon: 'sunny-outline' },
    { value: 'dark', label: '深色', icon: 'moon-outline' },
    { value: 'system', label: '跟随系统', icon: 'phone-portrait-outline' },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>外观</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>主题</Text>
          <View style={styles.optionsContainer}>
            {themeOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.optionCard,
                  { backgroundColor: colors.background, borderColor: colors.border },
                  settings.theme === option.value && {
                    backgroundColor: colors.primaryLight,
                    borderColor: colors.primary,
                  },
                ]}
                onPress={() => updateSettings({ theme: option.value })}
              >
                <Ionicons
                  name={option.icon}
                  size={28}
                  color={settings.theme === option.value ? colors.primary : colors.textSecondary}
                />
                <Text
                  style={[
                    styles.optionLabel,
                    { color: colors.text },
                    settings.theme === option.value && { color: colors.primary },
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  placeholder: {
    width: 40,
  },
  content: {
    padding: 16,
  },
  section: {
    borderRadius: 16,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  optionsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  optionCard: {
    flex: 1,
    paddingVertical: 20,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    gap: 8,
  },
  optionLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
});

import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { getColors } from '../utils/colors';

export default function FloatingBottomTabBar({ state, descriptors, navigation }) {
  const { settings } = useApp();
  const isDark = settings.theme === 'dark';
  const colors = getColors(isDark);

  const icons = {
    Home: 'home-outline',
    Content: 'book-outline',
    Stats: 'stats-chart-outline',
  };

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.blurContainer,
          { width: '100%', minWidth: 300 },
          isDark ? styles.darkBackground : styles.lightBackground
        ]}
      >
        <View style={[styles.tabBar, { width: '100%', backgroundColor: 'transparent' }]}>
          {state.routes.map((route, index) => {
            const { options } = descriptors[route.key];
            const label = options.tabBarLabel !== undefined ? options.tabBarLabel : route.name;
            const isFocused = state.index === index;

            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });
              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            return (
              <TouchableOpacity
                key={index}
                accessibilityRole="button"
                accessibilityState={isFocused ? { selected: true } : {}}
                onPress={onPress}
                style={styles.tabItem}
              >
                <Ionicons
                  name={icons[route.name]}
                  size={24}
                  color={isFocused ? colors.primary : colors.textTertiary}
                />
                <Text
                  style={[
                    styles.tabLabel,
                    { color: isFocused ? colors.primary : colors.textTertiary },
                  ]}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  blurContainer: {
    borderRadius: 30,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  lightBackground: {
    backgroundColor: 'rgba(255,255,255,0.95)',
  },
  darkBackground: {
    backgroundColor: 'rgba(30,30,30,0.95)',
  },
  tabBar: {
    flexDirection: 'row',
    height: 75,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  tabLabel: {
    fontSize: 10,
    marginTop: 2,
  },
});
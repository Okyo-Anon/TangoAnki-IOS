import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { getColors } from '../utils/colors';

const TAB_BAR_HEIGHT = 49;
const TOP_PADDING = 6;
const SAFE_AREA_BOTTOM = Platform.OS === 'ios' ? 34 : 0;

export default function BottomTabBar({ state, descriptors, navigation }) {
  const { settings } = useApp();
  const isDark = settings.theme === 'dark';
  const colors = getColors(isDark);

  const icons = {
    Home: 'home-outline',
    Content: 'book-outline',
    Stats: 'stats-chart-outline',
  };

  return (
    <BlurView intensity={80} tint={isDark ? 'dark' : 'light'} style={styles.blur}>
      <View style={[styles.tabBar, { height: TAB_BAR_HEIGHT + TOP_PADDING + SAFE_AREA_BOTTOM, paddingTop: TOP_PADDING, paddingBottom: SAFE_AREA_BOTTOM }]}>
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
    </BlurView>
  );
}

const styles = StyleSheet.create({
  blur: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  tabBar: {
    flexDirection: 'row',
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
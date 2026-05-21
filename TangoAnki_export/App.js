import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator, TransitionPresets } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AppProvider } from './src/context/AppContext';
import HomeScreen from './src/screens/HomeScreen';
import LearnScreen from './src/screens/LearnScreen';
import StatsScreen from './src/screens/StatsScreen';
import ContentScreen from './src/screens/ContentScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import LoginScreen from './src/screens/LoginScreen';
import LearningSettingsScreen from './src/screens/LearningSettingsScreen';
import AppearanceSettingsScreen from './src/screens/AppearanceSettingsScreen';
import WordDetailScreen from './src/screens/WordDetailScreen';
import WordListScreen from './src/screens/WordListScreen';
import ResultScreen from './src/screens/ResultScreen';
import SpellingScreen from './src/screens/SpellingScreen';
import RecentLearningScreen from './src/screens/RecentLearningScreen';
import AllLearningScreen from './src/screens/AllLearningScreen';
import BottomTabBar from './src/components/BottomTabBar';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// 自定义从底部滑入 + 缩放动画（用于 Modal）
const forScaleFromBottom = ({ current }) => {
  const translateY = current.progress.interpolate({
    inputRange: [0, 1],
    outputRange: [50, 0],
  });
  const scale = current.progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0.96, 1],
  });
  const opacity = current.progress.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0.8, 1],
  });

  return {
    cardStyle: {
      opacity,
      transform: [{ translateY }, { scale }],
    },
  };
};

function MainTabs() {
  return (
    <Tab.Navigator
      tabBar={props => <BottomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ tabBarLabel: '首页' }}
      />
      <Tab.Screen
        name="Stats"
        component={StatsScreen}
        options={{ tabBarLabel: '统计' }}
      />
      <Tab.Screen
        name="Content"
        component={ContentScreen}
        options={{ tabBarLabel: '内容' }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <NavigationContainer>
          <StatusBar style="auto" />
          <Stack.Navigator
            screenOptions={{
              headerShown: false,
            }}
          >
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen
              name="Learn"
              component={LearnScreen}
              options={{
                ...TransitionPresets.ModalSlideFromBottomIOS,
                cardStyleInterpolator: forScaleFromBottom,
              }}
            />
            <Stack.Screen
              name="Result"
              component={ResultScreen}
              options={{
                ...TransitionPresets.ModalSlideFromBottomIOS,
                cardStyleInterpolator: forScaleFromBottom,
              }}
            />
            <Stack.Screen
              name="Profile"
              component={ProfileScreen}
            />
            <Stack.Screen
              name="Settings"
              component={SettingsScreen}
            />
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{
                ...TransitionPresets.ModalSlideFromBottomIOS,
                cardStyleInterpolator: forScaleFromBottom,
              }}
            />
            <Stack.Screen
              name="LearningSettings"
              component={LearningSettingsScreen}
            />
            <Stack.Screen
              name="AppearanceSettings"
              component={AppearanceSettingsScreen}
            />
            <Stack.Screen
              name="WordDetail"
              component={WordDetailScreen}
              options={{
                ...TransitionPresets.ModalSlideFromBottomIOS,
                cardStyleInterpolator: forScaleFromBottom,
              }}
            />
            <Stack.Screen
              name="Spelling"
              component={SpellingScreen}
              options={{
                ...TransitionPresets.ModalSlideFromBottomIOS,
                cardStyleInterpolator: forScaleFromBottom,
              }}
            />
            <Stack.Screen
              name="WordList"
              component={WordListScreen}
            />
            <Stack.Screen
              name="RecentLearning"
              component={RecentLearningScreen}
            />
            <Stack.Screen
              name="AllLearning"
              component={AllLearningScreen}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </AppProvider>
    </SafeAreaProvider>
  );
}
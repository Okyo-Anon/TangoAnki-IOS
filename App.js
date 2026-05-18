import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
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
import ResultScreen from './src/screens/ResultScreen';
import SpellingScreen from './src/screens/SpellingScreen';
import TabBar from './src/components/TabBar';
import FloatingBottomTabBar from './src/components/FloatingBottomTabBar';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      tabBar={props => <FloatingBottomTabBar {...props} />}
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
                presentation: 'fullScreenModal',
                animation: 'slide_from_bottom',
              }}
            />
            <Stack.Screen
              name="Result"
              component={ResultScreen}
              options={{
                presentation: 'fullScreenModal',
                animation: 'slide_from_bottom',
              }}
            />
            <Stack.Screen
              name="Profile"
              component={ProfileScreen}
              options={{
                presentation: 'card',
              }}
            />
            <Stack.Screen
              name="Settings"
              component={SettingsScreen}
              options={{
                presentation: 'card',
              }}
            />
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{
                presentation: 'modal',
                animation: 'slide_from_bottom',
              }}
            />
            <Stack.Screen
              name="LearningSettings"
              component={LearningSettingsScreen}
              options={{
                presentation: 'card',
              }}
            />
            <Stack.Screen
              name="AppearanceSettings"
              component={AppearanceSettingsScreen}
              options={{
                presentation: 'card',
              }}
            />
            <Stack.Screen
              name="WordDetail"
              component={WordDetailScreen}
              options={{
                presentation: 'modal',
                animation: 'slide_from_bottom',
              }}
            />
            <Stack.Screen
              name="Spelling"
              component={SpellingScreen}
              options={{
                presentation: 'fullScreenModal',
                animation: 'slide_from_bottom',
              }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </AppProvider>
    </SafeAreaProvider>
  );
}

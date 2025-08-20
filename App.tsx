import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import OnboardingScreen from './src/screens/OnboardingScreen';
import HomeScreen from './src/screens/HomeScreen';
import PlannerScreen from './src/screens/PlannerScreen';
import MonetizeScreen from './src/screens/MonetizeScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import TrendRemix from './src/screens/TrendRemix';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerTitle: route.name,
          tabBarIcon: ({ color, size }) => {
            const map: Record<string, keyof typeof Ionicons.glyphMap> = {
              Onboarding: 'rocket-outline',
              Today: 'today-outline',
              Planner: 'calendar-outline',
              Monetize: 'cash-outline',
              Remix: 'sparkles-outline',
              Settings: 'settings-outline',
            };
            const name = map[route.name] || 'ellipse-outline';
            return <Ionicons name={name} size={size} color={color} />;
          },
        })}
      >
        <Tab.Screen name="Onboarding" component={OnboardingScreen} />
        <Tab.Screen name="Today" component={HomeScreen} />
        <Tab.Screen name="Planner" component={PlannerScreen} />
        <Tab.Screen name="Monetize" component={MonetizeScreen} />
        <Tab.Screen name="Remix" component={TrendRemix} />
        <Tab.Screen name="Settings" component={SettingsScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
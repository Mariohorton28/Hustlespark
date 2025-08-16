import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '@/screens/HomeScreen';
import ScriptStudio from '@/screens/ScriptStudio';
import PlannerScreen from '@/screens/PlannerScreen';
import MonetizeScreen from '@/screens/MonetizeScreen';
import SettingsScreen from '@/screens/SettingsScreen';
import TrendRemix from '@/screens/TrendRemix';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function HomeStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="HomeMain" component={HomeScreen} options={{ title: 'Today' }} />
      <Stack.Screen name="ScriptStudio" component={ScriptStudio} options={{ title: 'Script Studio' }} />
    </Stack.Navigator>
  );
}

export default function Tabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Home" component={HomeStack} />
      <Tab.Screen name="Remix" component={TrendRemix} />
      <Tab.Screen name="Planner" component={PlannerScreen} />
      <Tab.Screen name="Monetize" component={MonetizeScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

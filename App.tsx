import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Animated, Easing } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Image } from 'expo-image';

import OnboardingScreen from './src/screens/OnboardingScreen';
import HomeScreen from './src/screens/HomeScreen';
import PlannerScreen from './src/screens/PlannerScreen';
import MonetizeScreen from './src/screens/MonetizeScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import TrendRemix from './src/screens/TrendRemix';
import RecordScreen from './src/screens/RecordScreen';

import { loadPlans } from './src/lib/planStore';
import { BrandingProvider, useBranding } from './src/theme/branding';
import { isOnboardingDone } from './src/lib/onboardingStore';

import Toast from 'react-native-toast-message';

// -------- Custom toast theme: purple pill + orange check --------
const toastConfig = {
  success: ({ text1 }: any) => (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#7C3AED', // purple pill
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 999,
        marginHorizontal: 20,
        shadowColor: '#000',
        shadowOpacity: 0.15,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 3 },
      }}
    >
      <Ionicons name="checkmark-circle" size={22} color="#F97316" style={{ marginRight: 8 }} />
      <Text style={{ color: '#fff', fontWeight: '800', fontSize: 15 }}>
        {text1}
      </Text>
    </View>
  ),
  error: ({ text1 }: any) => (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#EF4444', // red pill
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 999,
        marginHorizontal: 20,
        shadowColor: '#000',
        shadowOpacity: 0.15,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 3 },
      }}
    >
      <Ionicons name="close-circle" size={22} color="#fff" style={{ marginRight: 8 }} />
      <Text style={{ color: '#fff', fontWeight: '800', fontSize: 15 }}>
        {text1}
      </Text>
    </View>
  ),
};
// ----------------------------------------------------------------

const Tab = createBottomTabNavigator();

function PlannerIcon({ color, size, focused, count }: { color: string; size: number; focused: boolean; count: number }) {
  const scale = useRef(new Animated.Value(1)).current;
  const prev = useRef<number>(count);

  useEffect(() => {
    if (count > (prev.current ?? 0)) {
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.15, duration: 160, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.timing(scale, { toValue: 1, duration: 160, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ]).start();
    }
    prev.current = count;
  }, [count]);

  return (
    <View style={{ width: size + 8, height: size + 8, alignItems: 'center', justifyContent: 'center' }}>
      <Ionicons name={focused ? 'calendar' : 'calendar-outline'} size={size} color={color} />
      {count > 0 && (
        <Animated.View
          style={{
            position: 'absolute',
            top: -2,
            right: -2,
            transform: [{ scale }],
            backgroundColor: '#7C3AED',
            borderRadius: 999,
            minWidth: 18,
            height: 18,
            paddingHorizontal: 4,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ color: '#fff', fontWeight: '800', fontSize: 11 }}>
            {count > 99 ? '99+' : count}
          </Text>
        </Animated.View>
      )}
    </View>
  );
}

function Shell() {
  const [pendingCount, setPendingCount] = useState(0);
  const [onboardingCount, setOnboardingCount] = useState(1);
  const [monetizeCount] = useState(1);
  const { brand } = useBranding();

  async function refreshBadges() {
    const plans = await loadPlans();
    const pending = plans.filter(p => p.status !== 'posted').length;
    setPendingCount(pending);

    const done = await isOnboardingDone();
    setOnboardingCount(done ? 0 : 1);
  }

  useEffect(() => {
    refreshBadges();
    const id = setInterval(refreshBadges, 10000);
    return () => clearInterval(id);
  }, []);

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
      {brand.logoUrl ? (
        <View style={{ alignItems: 'center', paddingVertical: 6 }}>
          <Image source={{ uri: brand.logoUrl }} style={{ height: 28, width: 140 }} contentFit="contain" />
        </View>
      ) : null}

      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: brand.primary || '#7C3AED',
          tabBarInactiveTintColor: '#94A3B8',
          tabBarLabelStyle: { fontWeight: '600' },
          tabBarStyle: { height: 60, paddingTop: 8, paddingBottom: 12, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#E5E7EB' },
          tabBarIcon: ({ color, size, focused }) => {
            switch (route.name) {
              case 'Onboarding':
                return <Ionicons name={focused ? 'person-add' : 'person-add-outline'} size={size} color={color} />;
              case 'Today':
                return <Ionicons name={focused ? 'home' : 'home-outline'} size={size} color={color} />;
              case 'Planner':
                return <PlannerIcon color={color} size={size} focused={focused} count={pendingCount} />;

              case 'Monetize': {
                // ✅ Use Monetize tab logo URL if set; fallback to Ionicons if empty
                if (brand.monetizeLogoUrl) {
                  return (
                    <Image
                      source={{ uri: brand.monetizeLogoUrl }}
                      style={{ width: size + 4, height: size + 4, opacity: focused ? 1 : 0.7 }}
                      contentFit="contain"
                    />
                  );
                }
                return <Ionicons name={focused ? 'cash' : 'cash-outline'} size={size} color={color} />;
              }

              case 'Remix':
                return <Ionicons name={focused ? 'sparkles' : 'sparkles-outline'} size={size} color={color} />;
              case 'Record':
                return <Ionicons name={focused ? 'videocam' : 'videocam-outline'} size={size} color={color} />;
              case 'Settings':
                return <Ionicons name={focused ? 'settings' : 'settings-outline'} size={size} color={color} />;
              default:
                return <Ionicons name="ellipse" size={size} color={color} />;
            }
          },
        })}
      >
        <Tab.Screen
          name="Onboarding"
          component={OnboardingScreen}
          options={{
            tabBarBadge: onboardingCount > 0 ? onboardingCount : undefined,
            tabBarBadgeStyle: { backgroundColor: brand.primary || '#7C3AED', color: '#fff' },
          }}
        />
        <Tab.Screen name="Today" component={HomeScreen} />
        <Tab.Screen name="Planner" component={PlannerScreen} />
        <Tab.Screen
          name="Monetize"
          component={MonetizeScreen}
          options={{
            tabBarBadge: monetizeCount > 0 ? monetizeCount : undefined,
            tabBarBadgeStyle: { backgroundColor: '#F59E0B', color: '#fff' },
          }}
        />
        <Tab.Screen name="Remix" component={TrendRemix} />
        <Tab.Screen name="Record" component={RecordScreen} />
        <Tab.Screen name="Settings" component={SettingsScreen} />
      </Tab.Navigator>
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <BrandingProvider>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <NavigationContainer>
          <Shell />
        </NavigationContainer>
      </SafeAreaProvider>
      <Toast position="bottom" bottomOffset={60} visibilityTime={2000} config={toastConfig} />
    </BrandingProvider>
  );
}
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'onboardingDone';

export async function setOnboardingDone() {
  await AsyncStorage.setItem(KEY, 'true');
}

export async function isOnboardingDone(): Promise<boolean> {
  const val = await AsyncStorage.getItem(KEY);
  return val === 'true';
}

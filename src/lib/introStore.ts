import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'hs:introDismissed';

export async function getIntroDismissed(): Promise<boolean> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw === '1';
  } catch {
    return false;
  }
}

export async function setIntroDismissed(v: boolean): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY, v ? '1' : '0');
  } catch {
    // ignore
  }
}
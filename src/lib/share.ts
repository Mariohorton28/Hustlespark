import { Share } from 'react-native';

export async function shareText(text: string, title: string = 'Share') {
  try {
    await Share.share({ message: text, title });
  } catch {
    // user canceled or share failed silently — no crash
  }
}
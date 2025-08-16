import React, { useRef, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Platform, ActivityIndicator } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Audio, Video } from 'expo-av';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import * as Clipboard from 'expo-clipboard';
import { useBranding } from '../theme/branding';

export default function RecordScreen() {
  const camRef = useRef<CameraView | null>(null);
  const [camPerm, requestCamPerm] = useCameraPermissions();
  const [micPermStatus, setMicPermStatus] = useState<'granted'|'denied'|'undetermined'>('undetermined');
  const [mlGranted, setMlGranted] = useState(false);

  const [facing, setFacing] = useState<'front'|'back'>('back');
  const [recording, setRecording] = useState(false);
  const [uri, setUri] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [booting, setBooting] = useState(true);

  const { brand } = useBranding();

  useEffect(() => {
    (async () => {
      try {
        if (!camPerm || camPerm.status !== 'granted') {
          await requestCamPerm();
        }
        const mic = await Audio.requestPermissionsAsync();
        setMicPermStatus(mic.status as any);
        const ml = await MediaLibrary.requestPermissionsAsync();
        setMlGranted(ml.status === 'granted');
      } finally {
        setBooting(false);
      }
    })();
  }, []);

  async function startRec() {
    if (!camRef.current) return;
    try {
      setRecording(true);
      // @ts-ignore - recordAsync available on CameraView ref in SDK 53
      const rec = await camRef.current.recordAsync({
        quality: Platform.OS === 'ios' ? '1080p' : '720p',
        maxDuration: 120,
      });
      setUri(rec?.uri ?? null);
    } catch (e: any) {
      Alert.alert('Record error', e?.message ?? 'Unknown error');
    } finally {
      setRecording(false);
    }
  }

  async function stopRec() {
    try {
      // @ts-ignore - stopRecording available on CameraView ref in SDK 53
      await camRef.current?.stopRecording();
    } catch {}
  }

  async function saveToPhotos() {
    if (!uri) return;
    if (!mlGranted) {
      const ml = await MediaLibrary.requestPermissionsAsync();
      setMlGranted(ml.status === 'granted');
      if (ml.status !== 'granted') return;
    }
    await MediaLibrary.saveToLibraryAsync(uri);
    Alert.alert('Saved', 'Video saved to your camera roll.');
  }

  async function shareVideo() {
    if (!uri) return;
    const available = await Sharing.isAvailableAsync();
    if (!available) {
      Alert.alert('Sharing not available', 'Try saving to Photos and share from there.');
      return;
    }
    await Sharing.shareAsync(uri, { dialogTitle: 'Share your video' });
  }

  async function copyCaption() {
    const text = 'New post from HustleSpark 💥\n\n#hustle #content #growth';
    await Clipboard.setStringAsync(text);
    setCopied('Caption copied');
    setTimeout(() => setCopied(null), 1200);
  }

  // Permission / boot states
  if (booting || !camPerm) return <View style={s.center}><ActivityIndicator /><Text style={{marginTop:8}}>Preparing camera…</Text></View>;
  if (!camPerm.granted || micPermStatus !== 'granted') {
    return (
      <View style={s.center}>
        <Text style={{ textAlign: 'center', marginBottom: 10 }}>
          Camera/Microphone permission is required.
        </Text>
        <TouchableOpacity style={[s.btn, { backgroundColor: brand.primary }]} onPress={requestCamPerm}>
          <Text style={s.btnText}>Grant Permissions</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      {uri ? (
        <Video
          source={{ uri }}
          style={{ flex: 1 }}
          resizeMode="contain"
          shouldPlay={playing}
          isLooping
          useNativeControls
          onPlaybackStatusUpdate={(st) => setPlaying(!!st.isPlaying)}
        />
      ) : (
        <CameraView
          ref={camRef}
          style={{ flex: 1 }}
          facing={facing}
          videoStabilizationMode="standard"
          mode="video"
        />
      )}

      {/* Controls */}
      <View style={s.controls}>
        {!uri ? (
          <>
            <TouchableOpacity style={[s.btn, s.ghost]} onPress={() => setFacing(facing === 'back' ? 'front' : 'back')}>
              <Text style={[s.btnText, { color: '#111827' }]}>Flip</Text>
            </TouchableOpacity>
            {recording ? (
              <TouchableOpacity style={[s.btn, s.stop]} onPress={stopRec}>
                <Text style={s.btnText}>Stop</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={[s.btn, s.rec]} onPress={startRec}>
                <Text style={s.btnText}>Record</Text>
              </TouchableOpacity>
            )}
            <View style={[s.btn, s.disabled]} />
          </>
        ) : (
          <>
            <TouchableOpacity style={[s.btn, s.ghost]} onPress={() => setUri(null)}>
              <Text style={[s.btnText, { color: '#111827' }]}>Retake</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[s.btn, { backgroundColor: brand.primary }]} onPress={saveToPhotos}>
              <Text style={s.btnText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[s.btn, { backgroundColor: brand.primary }]} onPress={shareVideo}>
              <Text style={s.btnText}>Share</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* Floating caption copy */}
      {uri && (
        <TouchableOpacity style={[s.fab, { backgroundColor: brand.primary }]} onPress={copyCaption} activeOpacity={0.9}>
          <Text style={s.fabText}>{copied ? '✓ Copied' : 'Copy Caption'}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  controls: {
    position: 'absolute', bottom: 20, left: 0, right: 0,
    flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center',
    paddingHorizontal: 16,
  },
  btn: { paddingVertical: 12, paddingHorizontal: 16, borderRadius: 999 },
  btnText: { color: '#fff', fontWeight: '800' },
  rec: { backgroundColor: '#DC2626' },
  stop: { backgroundColor: '#EF4444' },
  ghost: { backgroundColor: '#F3F4F6' },
  disabled: { backgroundColor: 'transparent', opacity: 0.3, paddingVertical: 12, paddingHorizontal: 16, borderRadius: 999 },
  fab: {
    position: 'absolute', right: 16, bottom: 90,
    borderRadius: 9999, paddingVertical: 12, paddingHorizontal: 14,
  },
  fabText: { color: '#fff', fontWeight: '800' },
});

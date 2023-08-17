import * as React from 'react';
import {
  View,
  TouchableOpacity,
  Platform,
  Text,
  StatusBar,
  Animated,
} from 'react-native';
import { LiveStreamView } from '@api.video/react-native-livestream';
import Icon from 'react-native-vector-icons/Ionicons';
import styles, { button } from './style';
import Settings from './components/settings';
import assets from './assets';
import { ZoomPicker } from './components/zoomSlider';

export interface ISettingsState {
  resolution: Resolution;
  framerate: number;
  videoBitrate: number;
  audioBitrate: number;
  rtmpEndpoint: string;
  streamKey: string;
}

export default function App() {
  // LOCAL STATE
  // Stream view
  const [streaming, setStreaming] = React.useState(false);
  const [audioMuted, setAudioMuted] = React.useState(false);
  const [camera, setCamera] = React.useState<'front' | 'back'>('back');
  const [settingsOpen, setSettingsOpen] = React.useState<boolean>(false);
  const [warning, setWarning] = React.useState<{
    display: boolean;
    message: string;
  }>({ display: false, message: '' });
  const [settings, setSettings] = React.useState<ISettingsState>({
    resolution: '360p',
    framerate: 30,
    videoBitrate: assets.sections.video.Bitrate.min,
    audioBitrate: 64000,
    rtmpEndpoint: assets.sections.endpoint['RTMP endpoint'].value,
    streamKey: assets.sections.endpoint['Stream key'].value,
  });

  // CONSTANTS
  const ref = React.useRef<LiveStreamMethods | null>(null);
  const isAndroid = Platform.OS === 'android';
  const style = styles(streaming, isAndroid, warning.display);
  const growAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    const grow = () => {
      Animated.timing(growAnim, {
        toValue: isAndroid ? 265 : 290,
        duration: 200,
        useNativeDriver: false,
      }).start();
    };
    warning.display && grow();
  }, [warning.display, growAnim, isAndroid]);

  // HANDLERS
  const shrink = () => {
    Animated.timing(growAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const handleStreaming = (): void => {
    // Reset warning
    setWarning({ display: false, message: '' });
    // No RTMP
    if (settings.rtmpEndpoint.trim().length === 0) {
      setWarning({
        display: true,
        message: 'Please enter a valid RTMP endpoint in settings',
      });
      return;
    }
    // No stream key
    if (settings.streamKey.trim().length === 0) {
      setWarning({
        display: true,
        message: 'Please enter a valid stream key in settings',
      });
      return;
    }

    if (streaming) {
      ref.current?.stopStreaming();
      setStreaming(false);
    } else {
      ref.current
        ?.startStreaming(settings.streamKey, settings.rtmpEndpoint)
        .then((_: boolean) => {
          setStreaming(true);
        })
        .catch((_: any) => {
          setStreaming(false);
        });
    }
  };

  const handleCamera = (): void => {
    if (camera === 'back') setCamera('front');
    else setCamera('back');
  };

  const handleClickOnSettings = () => {
    setSettingsOpen((_prev) => !_prev);
    shrink();
    setWarning({ display: false, message: '' });
  };

  // RETURN
  return (
    <View style={style.container}>
      <StatusBar animated={true} barStyle="light-content" />

      <LiveStreamView
        style={style.livestreamView}
        ref={ref}
        camera={camera}
        video={{
          bitrate: settings.videoBitrate * 1000,
          fps: settings.framerate,
          resolution: settings.resolution,
        }}
        audio={{
          bitrate: settings.audioBitrate,
          sampleRate: 44100,
          isStereo: true,
        }}
        isMuted={audioMuted}
        enablePinchedZoom={true}
        onConnectionSuccess={() => {
          console.log('Received onConnectionSuccess');
        }}
        onConnectionFailed={(reason: string) => {
          console.log('Received onConnectionFailed: ' + reason);
          setStreaming(false);
        }}
        onDisconnect={() => {
          console.log('Received onDisconnect');
          setStreaming(false);
        }}
      />

      <View style={button({ bottom: isAndroid ? 20 : 40 }).container}>
        <TouchableOpacity style={style.streamButton} onPress={handleStreaming}>
          {streaming ? (
            <Icon name="stop-circle-outline" size={50} color="#FF0001" />
          ) : (
            <Text style={style.streamText}>Start streaming</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={button({ bottom: isAndroid ? 20 : 40, left: 20 }).container}>
        <TouchableOpacity
          style={style.audioButton}
          onPress={() => setAudioMuted((_prev) => !_prev)}
        >
          <Icon
            name={audioMuted ? 'mic-off-outline' : 'mic-outline'}
            size={30}
            color={audioMuted ? '#DC3546' : '#FFFFFF'}
          />
        </TouchableOpacity>
      </View>

      <View
        style={button({ bottom: isAndroid ? 20 : 40, right: 20 }).container}
      >
        <TouchableOpacity style={style.cameraButton} onPress={handleCamera}>
          <Icon name="camera-reverse-outline" size={30} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {!streaming && (
        <Animated.View style={[style.settingsButton, { width: growAnim }]}>
          {warning.display && (
            <View style={style.warningContainer}>
              <Text style={style.warning} numberOfLines={1}>
                {warning.message}
              </Text>
            </View>
          )}
          <TouchableOpacity
            style={style.settingsIcon}
            onPress={handleClickOnSettings}
          >
            <Icon name="settings-outline" size={30} color="#FFFFFF" />
          </TouchableOpacity>
        </Animated.View>
      )}
      <ZoomPicker
        setZoomRatio={(zoomRatio) => ref.current?.setZoomRatio(zoomRatio)}
        zoomRange={{ min: 1, max: 4 }}
      />

      {settingsOpen && (
        <Settings
          closeSettings={() => setSettingsOpen(false)}
          settings={settings}
          setSettings={setSettings}
        />
      )}
    </View>
  );
}

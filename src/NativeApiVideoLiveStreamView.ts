import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';
import type { HostComponent, ViewProps } from 'react-native';
import type {
  DirectEventHandler,
  Float,
  Int32,
  WithDefault,
} from 'react-native/Libraries/Types/CodegenTypes';
import codegenNativeCommands from 'react-native/Libraries/Utilities/codegenNativeCommands';

// Type can't start with a digit so we prefix it with an underscore.
export type NativeResolution = '_240p' | '_360p' | '_480p' | '_720p' | '_1080p';
export type Camera = 'front' | 'back';

export interface NativeProps extends ViewProps {
  camera?: WithDefault<Camera, 'back'>;
  video: {
    bitrate: Int32;
    fps: Int32;
    resolution?: WithDefault<NativeResolution, '720p'>;
    gopDuration: Float;
  };
  isMuted: boolean;
  audio: {
    bitrate: Int32;
    sampleRate?: WithDefault<8000 | 16000 | 32000 | 44100 | 48000, 44100>;
    isStereo: boolean;
  };
  zoomRatio: Float;
  enablePinchedZoom: boolean;

  onConnectionSuccess?: DirectEventHandler<null>;
  onConnectionFailed?: DirectEventHandler<Readonly<{ error: string }>>;
  onDisconnect?: DirectEventHandler<null>;
}

interface NativeCommands {
  startStreaming: (
    viewRef: React.ElementRef<HostComponent<NativeProps>>,
    streamKey: string,
    url?: string
  ) => void;
  stopStreaming: (
    viewRef: React.ElementRef<HostComponent<NativeProps>>
  ) => void;
  setZoomRatioCommand: (
    viewRef: React.ElementRef<HostComponent<NativeProps>>,
    zoomRatio: Float
  ) => void;
}

export const Commands = codegenNativeCommands<NativeCommands>({
  supportedCommands: ['startStreaming', 'stopStreaming', 'setZoomRatioCommand'],
});
export default codegenNativeComponent<NativeProps>('ApiVideoLiveStreamView');

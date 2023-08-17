import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import {
  Platform,
  ViewStyle,
  requireNativeComponent,
  type HostComponent,
} from 'react-native';
import type { Resolution } from './types';
import { Commands, NativeProps } from './NativeApiVideoLiveStreamView';
import type { DirectEventHandler } from 'react-native/Libraries/Types/CodegenTypes';

const LINKING_ERROR =
  `The package '@api.video/react-native-livestream' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo Go\n';

// @ts-expect-error
const isTurboModuleEnabled = global.__turboModuleProxy != null;
const NativeLiveStreamViewComponent = isTurboModuleEnabled
  ? require('./NativeApiVideoLiveStreamView').default
  : requireNativeComponent('ApiVideoLiveStreamView');

const NativeLiveStreamView = NativeLiveStreamViewComponent
  ? NativeLiveStreamViewComponent
  : new Proxy(
      {},
      {
        get() {
          throw new Error(LINKING_ERROR);
        },
      }
    );

type LiveStreamProps = {
  style?: ViewStyle;
  camera?: 'front' | 'back';
  video?: {
    bitrate?: number;
    fps?: number;
    resolution?: Resolution;
    gopDuration?: number;
  };
  isMuted?: boolean;
  audio?: {
    bitrate?: number;
    sampleRate?: 8000 | 16000 | 32000 | 44100 | 48000;
    isStereo?: boolean;
  };
  zoomRatio?: number;
  enablePinchedZoom: Boolean;
  onConnectionSuccess?: () => void;
  onConnectionFailed?: (code: string) => void;
  onDisconnect?: () => void;
};

const LIVE_STREAM_PROPS_DEFAULTS: NativeProps = {
  style: {},
  camera: 'back',
  video: {
    bitrate: 2000000,
    fps: 30,
    resolution: '_720p',
    gopDuration: 1,
  },
  isMuted: false,
  audio: {
    bitrate: 128000,
    sampleRate: 44100,
    isStereo: true,
  },
  zoomRatio: 1.0,
  enablePinchedZoom: true,
};

export type LiveStreamMethods = {
  startStreaming: (streamKey: string, url?: string) => void;
  stopStreaming: () => void;
  setZoomRatio: (zoomRatio: number) => void;
};

const getDefaultBitrate = (resolution: Resolution): number => {
  switch (resolution) {
    case '240p':
      return 800000;
    case '360p':
      return 1000000;
    case '480p':
      return 1300000;
    case '720p':
      return 2000000;
    case '1080p':
      return 3500000;
  }
};

const LiveStreamView = forwardRef<{}, LiveStreamProps>(
  (props, forwardedRef) => {
    const nativeLiveStreamProps: NativeProps = {
      ...LIVE_STREAM_PROPS_DEFAULTS,
      ...props,
      video: {
        ...LIVE_STREAM_PROPS_DEFAULTS.video,
        bitrate: getDefaultBitrate(
          `_${props.video?.resolution}` ||
            LIVE_STREAM_PROPS_DEFAULTS.video?.resolution
        ),
        ...props.video,
      },
      audio: {
        ...LIVE_STREAM_PROPS_DEFAULTS.audio,
        ...props.audio,
      },
      onConnectionSuccess: props.onConnectionSuccess
        ? (event: DirectEventHandler<{}>) => {
            const {} = event.arguments;
            props.onConnectionSuccess?.();
          }
        : undefined,
      onConnectionFailed: props.onConnectionFailed
        ? (event: DirectEventHandler<{ code: string }>) => {
            const { code } = event.arguments;
            props.onConnectionFailed?.(code);
          }
        : undefined,
      onDisconnect: props.onDisconnect
        ? (event: DirectEventHandler<{}>) => {
            const {} = event.arguments;
            props.onDisconnect?.();
          }
        : undefined,
    };

    const nativeRef = useRef<React.ComponentRef<
      HostComponent<NativeProps>
    > | null>(null);

    useImperativeHandle(forwardedRef, () => ({
      startStreaming: (streamKey: string, url?: string) =>
        nativeRef.current &&
        Commands.startStreaming(nativeRef.current, streamKey, url),
      stopStreaming: () =>
        nativeRef.current && Commands.stopStreaming(nativeRef.current),
      setZoomRatio: (zoomRatio: number) =>
        nativeRef.current &&
        Commands.setZoomRatioCommand(nativeRef.current, zoomRatio),
    }));

    return (
      <NativeLiveStreamView
        style={nativeLiveStreamProps.style}
        camera={nativeLiveStreamProps.camera}
        video={nativeLiveStreamProps.video}
        isMuted={nativeLiveStreamProps.isMuted}
        audio={nativeLiveStreamProps.audio}
        zoomRatio={nativeLiveStreamProps.zoomRatio}
        enablePinchedZoom={nativeLiveStreamProps.enablePinchedZoom}
        onConnectionSuccess={nativeLiveStreamProps.onConnectionSuccess}
        onConnectionFailed={nativeLiveStreamProps.onConnectionFailed}
        onDisconnect={nativeLiveStreamProps.onDisconnect}
        ref={nativeRef as any}
      />
    );
  }
);

export * from './types';
export { LiveStreamView };

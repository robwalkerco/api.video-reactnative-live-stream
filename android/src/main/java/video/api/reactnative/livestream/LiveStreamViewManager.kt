package video.api.reactnative.livestream

import android.util.Log
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.annotations.ReactProp
import video.api.reactnative.livestream.utils.getCameraFacing
import video.api.reactnative.livestream.utils.toAudioConfig
import video.api.reactnative.livestream.utils.toVideoConfig


class LiveStreamViewManager : LiveStreamViewManagerSpec<LiveStreamView>() {
  override fun getName() = NAME

  override fun createViewInstance(reactContext: ThemedReactContext): LiveStreamView {
    return LiveStreamView(reactContext)
  }

  override fun getExportedCustomDirectEventTypeConstants(): Map<String, *> {
    return ViewProps.Events.toEventsMap()
  }

  @ReactProp(name = ViewProps.VIDEO_CONFIG)
  override fun setVideo(view: LiveStreamView, value: ReadableMap?) {
    if (value == null) {
      Log.e(TAG, "Missing video config")
      return
    }
    if (view.isStreaming) {
      view.videoBitrate = value.getInt(ViewProps.BITRATE)
    } else {
      view.videoConfig = value.toVideoConfig()
    }
  }

  @ReactProp(name = ViewProps.AUDIO_CONFIG)
  override fun setAudio(view: LiveStreamView, value: ReadableMap?) {
    if (value == null) {
      Log.e(TAG, "Missing audio config")
      return
    }
    view.audioConfig = value.toAudioConfig()
  }

  @ReactProp(name = ViewProps.CAMERA)
  override fun setCamera(view: LiveStreamView, value: String?) {
    value?.let {
      view.camera = it.getCameraFacing()
    }
  }

  @ReactProp(name = ViewProps.IS_MUTED)
  override fun setIsMuted(view: LiveStreamView, value: Boolean) {
    view.isMuted = value
  }

  @ReactProp(name = ViewProps.ZOOM_ENABLED)
  override fun setEnablePinchedZoom(view: LiveStreamView, value: Boolean) {
    view.enablePinchedZoom = value
  }

  @ReactProp(name = ViewProps.ZOOM_RATIO)
  override fun setZoomRatio(view: LiveStreamView, value: Float) {
    view.zoomRatio = value
  }

  @ReactMethod
  override fun startStreaming(view: LiveStreamView, streamKey: String, url: String?) {
    view.startStreaming(streamKey, url)
  }

  @ReactMethod
  override fun stopStreaming(view: LiveStreamView) {
    view.stopStreaming()
  }

  @ReactMethod
  override fun setZoomRatioCommand(view: LiveStreamView, zoomRatio: Float) {
    view.zoomRatio = zoomRatio
  }

  override fun onDropViewInstance(view: LiveStreamView) {
    super.onDropViewInstance(view)
    view.close()
  }

  companion object {
    const val NAME = "ApiVideoLiveStreamView"
    const val TAG = "LivestreamViewManager"
  }
}

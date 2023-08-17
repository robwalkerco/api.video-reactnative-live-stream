package video.api.reactnative.livestream

import android.view.View
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.uimanager.SimpleViewManager

abstract class LiveStreamViewManagerSpec<T : View> : SimpleViewManager<T>() {
  abstract fun setCamera(view: T, value: String?)
  abstract fun setVideo(view: T, value: ReadableMap?)
  abstract fun setIsMuted(view: T, value: Boolean)
  abstract fun setAudio(view: T, value: ReadableMap?)
  abstract fun setZoomRatio(view: T, value: Float)
  abstract fun setEnablePinchedZoom(view: T, value: Boolean)

  abstract fun startStreaming(view: LiveStreamView, streamKey: String, url: String?)
  abstract fun stopStreaming(view: LiveStreamView)
  abstract fun setZoomRatioCommand(view: LiveStreamView, zoomRatio: Float)
}

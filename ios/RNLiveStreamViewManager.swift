import ApiVideoLiveStream
import CoreGraphics
import Foundation

@objc(RNLiveStreamViewManager)
class RNLiveStreamViewManager: RCTViewManager {
    override static func requiresMainQueueSetup() -> Bool {
        return true
    }

    override func view() -> (RNLiveStreamView) {
        return RNLiveStreamView()
    }

    @objc func startStreaming(_ reactTag: NSNumber, withStreamKey streamKey: String, withUrl url: String?/*, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock*/) throws {
        bridge!.uiManager.addUIBlock { (_: RCTUIManager?, viewRegistry: [NSNumber: UIView]?) in
            let view: RNLiveStreamView = (viewRegistry![reactTag] as? RNLiveStreamView)!
            do {
                try view.startStreaming(streamKey, url: url)
               // resolve(nil)
            } catch {
              //  reject("Failed_to_start_streaming", "Could not start streaming", error)
            }
        }
    }

    @objc func stopStreaming(_ reactTag: NSNumber) {
        bridge!.uiManager.addUIBlock { (_: RCTUIManager?, viewRegistry: [NSNumber: UIView]?) in
            let view: RNLiveStreamView = (viewRegistry![reactTag] as? RNLiveStreamView)!
            view.stopStreaming()
        }
    }

    @objc func zoomRatio(_ reactTag: NSNumber, withZoomRatio zoomRatio: Float) {
        bridge!.uiManager.addUIBlock { (_: RCTUIManager?, viewRegistry: [NSNumber: UIView]?) in
            let view: RNLiveStreamView = (viewRegistry![reactTag] as? RNLiveStreamView)!
            view.zoomRatio = zoomRatio
        }
    }
}

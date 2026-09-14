import Foundation
import WebKit

/// Register once on the existing WKWebView before loading React.
/// Pass exact origins from the project's existing trusted-host configuration.
@MainActor
public final class ManoReadyMessageHandler: NSObject, WKScriptMessageHandler {
    public static let name = "manoLaunch"
    private let allowedOrigins: Set<String>
    private let onReady: () -> Void

    public init(allowedOrigins: Set<String>, onReady: @escaping () -> Void) {
        self.allowedOrigins = allowedOrigins
        self.onReady = onReady
    }

    public func userContentController(_ userContentController: WKUserContentController,
                                      didReceive message: WKScriptMessage) {
        guard message.name == Self.name, message.frameInfo.isMainFrame,
              let body = message.body as? [String: Any],
              body["type"] as? String == "ready",
              body["version"] as? Int == 1 else { return }
        onReady()
    }
}

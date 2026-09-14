import SwiftUI
import WebKit
import CoreLocation

struct TransitWebView: UIViewRepresentable {
    @Binding var startupState: ManoStartupState
    let reloadID: UUID
    private let localDevURL = URL(string: "http://localhost:5173")
    
    func makeCoordinator() -> Coordinator {
        Coordinator(parent: self)
    }
    
    func makeUIView(context: Context) -> WKWebView {
        let preferences = WKWebpagePreferences()
        preferences.allowsContentJavaScript = true
        
        let configuration = WKWebViewConfiguration()
        configuration.defaultWebpagePreferences = preferences
        configuration.allowsInlineMediaPlayback = true
        
        let contentController = WKUserContentController()
        contentController.add(context.coordinator, name: "nativeHaptic")
        contentController.add(context.coordinator, name: "requestNativeLocation")
        
        let readyOrigins: Set<String> = [
            "http://localhost:5173",
            "http://127.0.0.1:5173",
            "http://localhost:3000",
            "http://127.0.0.1:3000"
        ]
        let readyHandler = ManoReadyMessageHandler(allowedOrigins: readyOrigins) { [weak coordinator = context.coordinator] in
            coordinator?.onReadyReceived()
        }
        contentController.add(readyHandler, name: ManoReadyMessageHandler.name)
        
        configuration.userContentController = contentController
        
        let webView = WKWebView(frame: .zero, configuration: configuration)
        webView.navigationDelegate = context.coordinator
        webView.uiDelegate = context.coordinator
        webView.isOpaque = false
        webView.backgroundColor = UIColor(red: 9/255, green: 13/255, blue: 22/255, alpha: 1.0)
        webView.scrollView.backgroundColor = webView.backgroundColor
        webView.scrollView.bounces = false
        webView.scrollView.contentInsetAdjustmentBehavior = .never
        
        context.coordinator.attachWebView(webView)
        
        #if DEBUG
        if #available(iOS 16.4, *) {
            webView.isInspectable = true
        }
        #endif
        
        loadApp(in: webView)

        return webView
    }
    
    func updateUIView(_ uiView: WKWebView, context: Context) {
        if context.coordinator.lastReloadID != reloadID {
            context.coordinator.lastReloadID = reloadID
            loadApp(in: uiView)
        }
    }

    static func dismantleUIView(_ uiView: WKWebView, coordinator: Coordinator) {
        uiView.configuration.userContentController.removeScriptMessageHandler(forName: ManoReadyMessageHandler.name)
    }
    
    private func loadApp(in webView: WKWebView) {
        #if DEBUG
        if let devURL = localDevURL {
            webView.load(URLRequest(url: devURL, cachePolicy: .reloadIgnoringLocalCacheData, timeoutInterval: 5))
            return
        }
        #endif

        if let localURL = Bundle.main.url(forResource: "index", withExtension: "html", subdirectory: "WebDist") {
            webView.loadFileURL(localURL, allowingReadAccessTo: localURL.deletingLastPathComponent())
            return
        }

        let appURL = (Bundle.main.object(forInfoDictionaryKey: "TransitAppURL") as? String).flatMap(URL.init(string:))
        if let appURL = appURL, ["http", "https"].contains(appURL.scheme ?? "") {
            webView.load(URLRequest(url: appURL, cachePolicy: .reloadIgnoringLocalCacheData, timeoutInterval: 10))
        } else {
            showUnavailable(in: webView)
        }
    }

    private func showUnavailable(in webView: WKWebView) {
        webView.loadHTMLString("<meta name='viewport' content='width=device-width'><body style='background:#09090B;color:white;font-family:system-ui;padding:32px'><h2>Manô</h2><p>Serviço indisponível. Verifique sua conexão e abra o aplicativo novamente.</p></body>", baseURL: nil)
    }

    @MainActor
    final class Coordinator: NSObject, WKNavigationDelegate, WKScriptMessageHandler, WKUIDelegate, @preconcurrency CLLocationManagerDelegate {
        var parent: TransitWebView
        var lastReloadID: UUID?
        private weak var webView: WKWebView?
        private let locationManager = CLLocationManager()
        private var lastLocation: CLLocation?
        
        init(parent: TransitWebView) {
            self.parent = parent
            super.init()
            locationManager.delegate = self
            locationManager.desiredAccuracy = kCLLocationAccuracyBest
            locationManager.requestWhenInUseAuthorization()
            locationManager.startUpdatingLocation()
        }
        
        func attachWebView(_ webView: WKWebView) {
            self.webView = webView
        }
        
        func onReadyReceived() {
            parent.startupState = .ready
        }

        private func pushLocationToJS(_ loc: CLLocation) {
            let js = "if(window.updateNativeUserLocation){window.updateNativeUserLocation(\(loc.coordinate.latitude), \(loc.coordinate.longitude), \(loc.horizontalAccuracy));}"
            DispatchQueue.main.async { [weak self] in
                self?.webView?.evaluateJavaScript(js, completionHandler: nil)
            }
        }
        
        func locationManager(_ manager: CLLocationManager, didUpdateLocations locations: [CLLocation]) {
            guard let loc = locations.last else { return }
            self.lastLocation = loc
            pushLocationToJS(loc)
        }
        
        func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
            parent.startupState = .ready
            if let loc = lastLocation {
                pushLocationToJS(loc)
            } else {
                locationManager.requestLocation()
            }
        }
        
        func webView(_ webView: WKWebView, createWebViewWith configuration: WKWebViewConfiguration, for navigationAction: WKNavigationAction, windowFeatures: WKWindowFeatures) -> WKWebView? {
            if navigationAction.targetFrame == nil, let url = navigationAction.request.url,
               ["http", "https"].contains(url.scheme ?? "") {
                UIApplication.shared.open(url)
            }
            return nil
        }
        
        @available(iOS 15.0, *)
        func webView(_ webView: WKWebView, requestGeolocationPermissionFor origin: WKSecurityOrigin, initiatedByFrame frame: WKFrameInfo, decisionHandler: @escaping (WKPermissionDecision) -> Void) {
            decisionHandler(.grant)
        }
        
        func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
            if message.name == "nativeHaptic", let type = message.body as? String {
                Task { @MainActor in
                    HapticBridge.shared.trigger(type: type)
                }
            } else if message.name == "requestNativeLocation" {
                if let loc = lastLocation {
                    pushLocationToJS(loc)
                }
                locationManager.startUpdatingLocation()
            }
        }
        
        func webView(_ webView: WKWebView, didFailProvisionalNavigation navigation: WKNavigation!, withError error: Error) {
            if (error as NSError).code == NSURLErrorCancelled { return }
            parent.startupState = .failed
        }
        
        func webView(_ webView: WKWebView, didFail navigation: WKNavigation!, withError error: Error) {
            if (error as NSError).code == NSURLErrorCancelled { return }
            parent.startupState = .failed
        }
        
        func locationManager(_ manager: CLLocationManager, didFailWithError error: Error) {
            // Silence simulator location errors
        }
    }
}

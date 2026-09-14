import SwiftUI

struct ContentView: View {
    @State private var startupState: ManoStartupState = .loading
    @State private var reloadID = UUID()

    var body: some View {
        ManoLaunchHost(
            startupState: startupState,
            onRetry: {
                startupState = .loading
                reloadID = UUID()
            }
        ) {
            TransitWebView(
                startupState: $startupState,
                reloadID: reloadID
            )
            .ignoresSafeArea(.all)
        }
        .preferredColorScheme(.dark)
    }
}

#Preview {
    ContentView()
}

import SwiftUI

public enum ManoStartupState: Equatable {
    case loading
    case ready
    case failed
}

/// Keep the existing WKWebView alive beneath this overlay.
/// Set startupState to .ready only when React has rendered a usable first screen.
@MainActor
public struct ManoLaunchHost<Content: View>: View {
    private let startupState: ManoStartupState
    private let onRetry: () -> Void
    private let content: Content
    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    @State private var visible = true
    @State private var animationFinished = false
    @State private var timedOut = false
    @State private var attempt = 0

    public init(startupState: ManoStartupState, onRetry: @escaping () -> Void,
                @ViewBuilder content: () -> Content) {
        self.startupState = startupState
        self.onRetry = onRetry
        self.content = content()
    }

    public var body: some View {
        ZStack {
            content
                .allowsHitTesting(!visible)
                .accessibilityHidden(visible)
            if visible {
                ManoLaunchView {
                    animationFinished = true
                    dismissIfReady()
                }
                .overlay(alignment: .bottom) {
                    if animationFinished && startupState != .ready {
                        VStack(spacing: 12) {
                            if timedOut || startupState == .failed {
                                Text("Não foi possível abrir o MANÔ.")
                                    .font(.callout)
                                Button("Tentar novamente") {
                                    timedOut = false
                                    attempt += 1
                                    onRetry()
                                }
                                .buttonStyle(.borderedProminent)
                                .tint(Color(red: 0, green: 105 / 255, blue: 1))
                            } else {
                                ProgressView().tint(.black)
                                    .accessibilityLabel("Carregando o aplicativo")
                            }
                        }
                        .foregroundStyle(.black)
                        .padding(.horizontal, 24)
                        .padding(.bottom, 32)
                    }
                }
                .transition(.opacity)
                .zIndex(1)
            }
        }
        .onChange(of: startupState) { _ in dismissIfReady() }
        .task(id: attempt) {
            do {
                try await Task.sleep(for: .seconds(12))
                guard !Task.isCancelled, visible, startupState != .ready else { return }
                timedOut = true
            } catch { /* Cancellation is expected on retry or removal. */ }
        }
    }

    private func dismissIfReady() {
        guard visible, animationFinished, startupState == .ready else { return }
        withAnimation(.easeOut(duration: reduceMotion ? 0.1 : 0.22)) {
            visible = false
        }
    }
}

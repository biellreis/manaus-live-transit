import SwiftUI

/// Add the four Mano imagesets to the application's asset catalog.
/// Swift 6, iOS 16+. All artwork uses the original logo's common bounds.
@MainActor
public struct ManoLaunchView: View {
    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    @State private var start = Date()
    @State private var settled = false
    private let onFinished: () -> Void

    public init(onFinished: @escaping () -> Void = {}) {
        self.onFinished = onFinished
    }

    public var body: some View {
        GeometryReader { geometry in
            let width = min(geometry.size.width * 435 / 1080, 240)
            TimelineView(.animation(paused: settled)) { timeline in
                let time = settled ? 2.2 : max(0, timeline.date.timeIntervalSince(start))
                ManoArtwork(time: time, reduced: reduceMotion)
                    .frame(width: 1093, height: 1416)
                    .scaleEffect(width / 1093)
                    .frame(width: width, height: width * 1416 / 1093)
                    .position(x: geometry.size.width / 2, y: geometry.size.height / 2)
            }
        }
        .background(Color.white)
        .ignoresSafeArea()
        .accessibilityElement(children: .ignore)
        .accessibilityLabel("MANÔ")
        .task {
            start = Date()
            do {
                try await Task.sleep(for: .seconds(reduceMotion ? 0.3 : 2.2))
                guard !Task.isCancelled else { return }
                settled = true
                onFinished()
            } catch { /* View was removed. */ }
        }
    }
}

private struct ManoArtwork: View {
    let time: Double
    let reduced: Bool
    private func unit(_ x: Double) -> Double { min(1, max(0, x)) }
    private func ease(_ x: Double) -> Double { 1 - pow(1 - unit(x), 3) }
    private func image(_ name: String) -> some View {
        Image(name).resizable().interpolation(.high).frame(width: 1093, height: 1416)
    }

    var body: some View {
        let plate = reduced ? 1 : ease(time / 0.35)
        let u = unit((time - 0.25) / 0.95)
        let reveal = reduced ? 1 : 1 - pow(1 - u, 2)
        let v = unit((time - 0.95) / 0.5)
        let arrowEase = reduced ? 1 : ease(v)
        let back = 1 + 2.1 * pow(v - 1, 3) + 1.1 * pow(v - 1, 2)
        let arrowScale = reduced ? 1 : 0.78 + 0.22 * back
        let name = reduced ? 1 : ease((time - 1.2) / 0.45)

        ZStack {
            ZStack {
                image("ManoPlate")
                image("ManoM")
                    .mask {
                        if reveal >= 0.9999 {
                            Rectangle()
                        } else {
                            ManoRevealPath()
                                .trim(from: 0, to: reveal)
                                .stroke(style: StrokeStyle(lineWidth: 110, lineCap: .butt, lineJoin: .round))
                        }
                    }
                image("ManoArrow")
                    .scaleEffect(arrowScale, anchor: UnitPoint(x: 0.55, y: 0.36))
                    .offset(x: -60.3 * (1 - arrowEase), y: 67.9 * (1 - arrowEase))
                    .opacity(reduced ? 1 : min(1, v * 5))
            }
            .scaleEffect(0.94 + 0.06 * plate, anchor: UnitPoint(x: 0.5, y: 0.38))
            .opacity(plate)
            image("ManoName")
                .offset(y: 30.15 * (1 - name))
                .opacity(name)
        }
    }
}

private struct ManoRevealPath: Shape {
    func path(in rect: CGRect) -> Path {
        var path = Path()
        func p(_ x: CGFloat, _ y: CGFloat) -> CGPoint {
            CGPoint(x: (x - 254) * rect.width / 1093, y: (y - 108) * rect.height / 1416)
        }
        path.move(to: p(254, 862))
        path.addLine(to: p(400, 862))
        path.addCurve(to: p(461, 800), control1: p(434, 862), control2: p(461, 840))
        path.addLine(to: p(461, 512))
        path.addCurve(to: p(665, 512), control1: p(461, 374), control2: p(665, 374))
        path.addLine(to: p(665, 735))
        path.addCurve(to: p(883, 708), control1: p(665, 878), control2: p(870, 878))
        path.addLine(to: p(923, 450))
        path.addCurve(to: p(1138, 437), control1: p(935, 278), control2: p(1138, 290))
        path.addLine(to: p(1138, 802))
        path.addCurve(to: p(1195, 862), control1: p(1138, 841), control2: p(1160, 862))
        path.addLine(to: p(1347, 862))
        return path
    }
}

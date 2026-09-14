import UIKit

@MainActor
final class HapticBridge: NSObject {
    static let shared = HapticBridge()
    
    private let lightGenerator = UIImpactFeedbackGenerator(style: .light)
    private let mediumGenerator = UIImpactFeedbackGenerator(style: .medium)
    private let heavyGenerator = UIImpactFeedbackGenerator(style: .heavy)
    private let selectionGenerator = UISelectionFeedbackGenerator()
    private let notificationGenerator = UINotificationFeedbackGenerator()
    
    private override init() {
        super.init()
        lightGenerator.prepare()
        mediumGenerator.prepare()
        heavyGenerator.prepare()
        selectionGenerator.prepare()
        notificationGenerator.prepare()
    }
    
    func trigger(type: String) {
        switch type {
        case "light":
            lightGenerator.impactOccurred()
            lightGenerator.prepare()
        case "medium":
            mediumGenerator.impactOccurred()
            mediumGenerator.prepare()
        case "heavy":
            heavyGenerator.impactOccurred()
            heavyGenerator.prepare()
        case "selection":
            selectionGenerator.selectionChanged()
            selectionGenerator.prepare()
        case "success":
            notificationGenerator.notificationOccurred(.success)
            notificationGenerator.prepare()
        case "warning":
            notificationGenerator.notificationOccurred(.warning)
            notificationGenerator.prepare()
        case "error":
            notificationGenerator.notificationOccurred(.error)
            notificationGenerator.prepare()
        default:
            mediumGenerator.impactOccurred()
            mediumGenerator.prepare()
        }
    }
}

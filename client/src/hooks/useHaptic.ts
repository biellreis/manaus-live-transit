export function useHaptic() {
  const trigger = (pattern: number | number[]) => {
    const native = (window as Window & { webkit?: { messageHandlers?: { nativeHaptic?: { postMessage: (type: string) => void } } } }).webkit?.messageHandlers?.nativeHaptic;
    if (native) { native.postMessage(Array.isArray(pattern) ? 'success' : pattern <= 10 ? 'light' : 'medium'); return; }
    if (typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch {
        // Ignore devices or browsers with permission restrictions
      }
    }
  };

  return {
    lightTap: () => trigger(10),
    mediumTap: () => trigger(20),
    snapSheet: () => trigger(25),
    arrivalAlert: () => trigger([50, 70, 50, 70, 120])
  };
}

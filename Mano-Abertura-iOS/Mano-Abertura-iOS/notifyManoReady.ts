// Call from a React effect after the first usable screen is rendered.
// Do not wait for live bus data or all map tiles before signaling readiness.
let sent = false;

type NativeWindow = Window & {
  webkit?: {
    messageHandlers?: {
      manoLaunch?: { postMessage(message: { type: 'ready'; version: 1 }): void };
    };
  };
};

export function notifyManoReady(): () => void {
  let secondFrame = 0;
  const firstFrame = requestAnimationFrame(() => {
    secondFrame = requestAnimationFrame(() => {
      const bridge = (window as NativeWindow).webkit?.messageHandlers?.manoLaunch;
      if (sent || !bridge) return;
      bridge.postMessage({ type: 'ready', version: 1 });
      sent = true;
    });
  });
  // Returning cleanup makes it safe to use in React 18 StrictMode effects.
  return () => {
    cancelAnimationFrame(firstFrame);
    cancelAnimationFrame(secondFrame);
  };
}

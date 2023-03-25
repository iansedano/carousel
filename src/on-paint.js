/**
 * Runs `callback` shortly after the next browser Frame is produced.
 * https://www.webperf.tips/tip/measuring-paint-time/
 * Joe Liccini
 */
export function runAfterFramePaint(callback) {
  // Queue a "before Render Steps" callback via requestAnimationFrame.
  requestAnimationFrame(() => {
    const messageChannel = new MessageChannel();

    // Setup the callback to run in a Task
    messageChannel.port1.onmessage = callback;

    // Queue the Task on the Task Queue
    messageChannel.port2.postMessage(undefined);
  });
}

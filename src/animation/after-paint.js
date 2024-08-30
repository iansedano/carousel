/**
 * Runs `callback` shortly after the next browser Frame is produced.
 *
 * https://www.webperf.tips/tip/measuring-paint-time/
 */
export function runAfterFramePaint(callback) {
  requestAnimationFrame(() => {
    const messageChannel = new MessageChannel();

    // Setup the callback to run in a Task
    messageChannel.port1.onmessage = callback;

    // Queue the Task on the Task Queue
    messageChannel.port2.postMessage(undefined);
  });
}

export async function runAfterFramePaintAsync(callback) {
  return new Promise((resolve) => {
    runAfterFramePaint(() => {
      callback();
      resolve();
    });
  });
}

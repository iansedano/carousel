import { sleep } from "./sleep";

const DEFAULT_QUEUE_POLL_INTERVAL = 1000;

export type Event =
  | { type: "callback"; payload: () => void | Promise<void> }
  | { type: "cancel"; payload: null };

export class EventQueue {
  private queue: Array<Event>;
  private lastEventTime: number;

  constructor() {
    this.queue = [];
    this.lastEventTime = 0;
  }

  push(Event: Event) {
    this.queue.push(Event);
  }

  pop(): Event | undefined {
    return this.queue.shift();
  }

  /** Immediately dispatches event and sets last time
   * @returns false if event was a cancel event, true otherwise
   */
  async dispatch(event: Event) {
    this.lastEventTime = Date.now();
    switch (event.type) {
      case "cancel":
        return false;
      case "callback":
        await event.payload();
        return true;
      default:
        return true;
    }
  }

  cancel() {
    this.queue.unshift({ type: "cancel", payload: null });
  }

  async run(
    defaultCallback: () => void | Promise<void> = () => {},
    defaultInterval: number,
    queuePollInterval: number = DEFAULT_QUEUE_POLL_INTERVAL
  ) {
    while (true) {
      await sleep(queuePollInterval);
      const event = this.queue.shift();
      if (event !== undefined) {
        if (!(await this.dispatch(event))) return;
      } else if (Date.now() - this.lastEventTime > defaultInterval) {
        await this.dispatch({ type: "callback", payload: defaultCallback });
      }
    }
  }
}

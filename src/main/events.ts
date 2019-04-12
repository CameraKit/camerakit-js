type CallbackFunction = (opts?: Object) => any;

const eventMap: { [key: string]: Array<CallbackFunction> } = {};

function createEvent(event: string) {
  if (!eventMap[event]) {
    eventMap[event] = [];
  }
}

export function triggerEvent(event: string, opts?: Object): boolean {
  if (!eventMap[event]) {
    return false;
  }

  for (let callback of eventMap[event]) {
    callback();
  }

  return true;
}

export function registerEvent(event: string, callback: CallbackFunction) {
  if (!eventMap[event]) {
    createEvent(event);
  }

  eventMap[event].push(callback);
}

export function unregisterEvent(
  event: string,
  callback: CallbackFunction
): boolean {
  if (!eventMap[event]) {
    return false;
  }

  const index = eventMap[event].indexOf(callback);
  if (index !== -1) {
    eventMap[event].splice(index, 1);
    return true;
  }

  return false;
}

export function unregisterAllEvents(event: string) {
  delete eventMap[event];
  createEvent(event);
}

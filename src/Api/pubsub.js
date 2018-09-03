// @flow

// -----------------------------------------------------------------------------

export type WithPubSub<T> = {
  ...T,
  subscribe: (string, any => void) => void,
  publish: (string, any) => boolean,
  unsubscribe: string => boolean
};

// -----------------------------------------------------------------------------

export default function <T>(obj: T): WithPubSub<T> {
  var topics = {}, subUid = -1;
  const q = {};

  // ---------------------------------------------------------------------------

  q.subscribe = function (topic: string, func: any => void): string {
    if (!topics[topic]) {
      topics[topic] = [];
    }
    if (typeof func !== 'function') {
      throw new Error('missing callback function');
    }
    var token = (++subUid).toString();
    topics[topic].push({
      token: token,
      func: func
    });
    return token;
  };


  // ---------------------------------------------------------------------------

  q.publish = function (topic, args): boolean {
    if (!topics[topic]) {
      return false;
    }
    setTimeout(function () {
      var subscribers = topics[topic],
        len = subscribers ? subscribers.length : 0;

      while (len--) {
        subscribers[len].func(topic, args);
      }
    }, 0);
    return true;
  };

  // ---------------------------------------------------------------------------

  q.unsubscribe = function (token: string): boolean {
    for (var m in topics) {
      if (topics[m]) {
        for (var i = 0, j = topics[m].length; i < j; i++) {
          if (topics[m][i].token === token) {
            topics[m].splice(i, 1);
            return true;
          }
        }
      }
    }
    return false;
  };

  return { ...obj, ...q };
}

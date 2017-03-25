import uuid from 'uuid/v4';

import FrameConnection from './frame-connection';

function listFrames() {
  const frames = new Set([window, window.parent, window.top]);

  for (const iframe of document.querySelectorAll('iframe')) {
    frames.add(iframe.contentWindow);
  }

  return Array.from(frames);
}

function frameConnector(connector, name) {
  let timeoutID;
  const incoming = [];
  const clientID = uuid();

  function send(frame, dest, message) {
    frame.postMessage([clientID, dest, message], '*');
  }

  function recv({ data, source }) {
    if (
      Array.isArray(data) &&
      data.length === 3 &&
      source !== window &&
      data[0] !== clientID &&
      data[1] === clientID
    ) {
      const [from, to, message] = data;
      if (message === 'connect') {
        clearTimeout(timeoutID);
        detach();
        connector.success(new FrameConnection(window, clientID, source, from));
      }
    }
  };

  window.addEventListener('message', recv, false);

  function detach() {
    window.removeEventListener('message', recv, false);
  }

  for (const frame of listFrames()) {
    send(frame, name, 'connect');
  }

  timeoutID = setTimeout(() => {
    detach();
    connector.failure();
  }, 500);
}

export default function(app) {
  return app.registerConnector(frameConnector);
}

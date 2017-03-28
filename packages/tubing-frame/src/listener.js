import FrameConnection from './frame-connection';

function frameListener(listener, name) {
  const incoming = [];

  function send(frame, dest, message) {
    frame.postMessage([name, dest, message], '*');
  }

  function recv({ data, source }) {
    if (
      Array.isArray(data) &&
      data.length === 3 &&
      source !== window &&
      data[0] !== name &&
      data[1] === name
    ) {
      const [from, to, message] = data;
      if (message === 'connect') {
        send(source, from, 'connect');
        listener.connection(new FrameConnection(window, name, source, from));
      }
    }
  };

  window.addEventListener('message', recv, false);

  listener.listening();
}

export default function(app) {
  return app.registerListener(frameListener);
}

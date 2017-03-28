import net from 'net';

import NetConnection from './net-connection';

function netListener(listener, port) {
  const server = net.createServer((connection) => {
    listener.connection(new NetConnection(connection));
  });
  server.listen(port, () => {
    listener.listening();
  });
}

export default function(app) {
  return app.registerListener(netListener);
}

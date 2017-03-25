import http from 'http';
import { Server as UwsServer } from 'uws';

import WebsocketConnection from './websocket-connection';

function createHttpServer(opts) {
  if (~['number', 'string'].indexOf(typeof(opts))) {
    const server = http.createServer(() => {});
    server.listen(opts);
    return server;
  } else if (opts instanceof http.Server) {
    return server;
  }

  throw new Error('Can only create a websocket listener from a port, filename, or http.Server instance');
}

function websocketListener(listener, opts) {
  const httpServer = createHttpServer(opts);

  httpServer.listening
    ? setImmediate(listener.listening)
    : server.on('listening', listener.listening);

  const server = new UwsServer({ server: httpServer });
  server.on('connection', (connection) => {
    listener.connection(new WebsocketConnection(connection));
  });
}

export default function(app) {
  return app.registerListener(websocketListener);
}

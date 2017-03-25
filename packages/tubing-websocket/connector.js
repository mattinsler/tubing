import { w3cwebsocket as WebSocketClient } from 'websocket';

import WebsocketConnection from './websocket-connection';

function websocketConnector(connector, url) {
  const connection = new WebSocketClient(url);

  // connection failure
  function onError() {
    detach(connection);
    connector.failure();
  }
  function onOpen() {
    detach(connection);
    connector.success(new WebsocketConnection(connection));
  }

  function attach(connection) {
    connection.onopen = onOpen;
    connection.onerror = onError;
  }
  function detach(connection) {
    delete connection.onopen;
    delete connection.onerror;
  }

  attach(connection);
}

export default function(app) {
  return app.registerConnector(websocketConnector);
}

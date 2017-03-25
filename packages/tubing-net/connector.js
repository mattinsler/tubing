import net from 'net';

import NetConnection from './net-connection';

// opts = { port, host, path }
function netConnector(connector, opts) {
  const connection = net.connect(opts);

  // connection failure
  function onClose() {
    detach(connection);
    connector.failure();
  }
  function onConnect() {
    detach(connection);
    connector.success(new NetConnection(connection));
  }
  // we need to listen for error but don't need to do anything
  function onError(){}

  function attach(connection) {
    connection.on('close', onClose);
    connection.on('connect', onConnect);
    connection.on('error', onError);
  }
  function detach(connection) {
    connection.removeListener('close', onClose);
    connection.removeListener('connect', onConnect);
    connection.removeListener('error', onError);
  }

  attach(connection);
}

export default function(app) {
  return app.registerConnector(netConnector);
}

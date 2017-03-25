import Socket from './socket';
import PluginContainer from './plugin-container';
import TubingListener from './tubing-listener';
import TubingConnector from './tubing-connector';

class App extends PluginContainer {
  newSocket(connection) {
    const socket = new Socket(connection, this);

    for (const { key, config } of this.plugins) {
      if (typeof(config.socket) === 'function') {
        socket.use(key, config.socket);
      }
    }

    this.emit('socket', socket);
  }

  registerListener(listenerImpl) {
    const listener = new TubingListener(listenerImpl);

    listener.on('listening', (...args) => this.emit('listening', ...args));
    listener.on('connection', connection => {
      connection.on('disconnected', () =>  this.emit('disconnected', connection, listener));
      this.emit('connection', connection, listener);
      this.newSocket(connection);
    });

    return listener;
  }

  registerConnector(connectorImpl) {
    const connector = new TubingConnector(connectorImpl);

    connector.on('connecting', (...args) => this.emit('connecting', ...args));
    connector.on('connected', (...args) => this.emit('connected', ...args));
    connector.on('disconnected', (...args) => this.emit('disconnected', ...args));

    connector.on('connection', (connection) => {
      this.newSocket(connection);
    });

    return connector;
  }
}

export default App;

import { EventEmitter } from 'events';

class NetConnection extends EventEmitter {
  constructor(connection) {
    super();

    let connecting = connection.connecting;
    let connected = connection.readyState === 'open';

    this.__defineGetter__('connection', () => connection);
    this.__defineGetter__('connecting', () => connecting);
    this.__defineGetter__('connected', () => connected);

    connection.on('close', () => {
      connected = false;
      this.emit('disconnected', this);
    });
    connection.on('error', (err) => {
      // debug('[ERROR] NetConnection:\n' + err.stack);
    });
    connection.on('data', (buffer) => {
      this.emit('message', buffer);
    });

    if (connected) {
      this.emit('connected', this);
    } else {
      connection.on('connect', () => {
        connected = true;
        this.emit('connected', this);
      });
    }
  }

  send(buffer) {
    this.connection.write(Buffer(buffer));
  }
}

export default NetConnection;

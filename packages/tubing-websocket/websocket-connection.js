import { EventEmitter } from 'events';

class WebsocketConnection extends EventEmitter {
  constructor(connection) {
    super();

    let connecting = connection.readyState === connection.CONNECTING;
    let connected = connection.readyState === connection.OPEN;

    this.__defineGetter__('connection', () => connection);
    this.__defineGetter__('connecting', () => connecting);
    this.__defineGetter__('connected', () => connected);

    connection.binaryType = 'arraybuffer';

    connection.onclose = () => {
      connected = false;
      this.emit('disconnected', this);
    };
    connection.onerror = (err) => {
      // console.log('ERROR', err);
    };
    connection.onmessage = ({ data }) => {
      this.emit('message', data);
    };

    if (connected) {
      this.emit('connected', this);
    } else {
      connection.onopen = () => {
        connected = true;
        this.emit('connected', this);
      };
    }
  }

  send(buffer) {
    this.connection.send(buffer);
  }
}

export default WebsocketConnection;

import { EventEmitter } from 'events';

class TubingListener extends EventEmitter {
  constructor(listener) {
    super();
    this.listener = listener;
  }

  listen(...args) {
    this.listener({
      listening: () => {
        this.emit('listening', this);
      },
      connection: (connection) => {
        this.emit('connection', connection, this);
      }
    }, ...args);
  }
}

export default TubingListener;

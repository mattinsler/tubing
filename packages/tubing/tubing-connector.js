import { EventEmitter } from 'events';

import fibonacci from './backoff-fibonacci';

const BACKOFF_STRATEGIES = {
  fibonacci
};

class TubingConnector extends EventEmitter {
  constructor(connector, {
    reconnect = true,
    backoff = 'fibonacci',
    backoffMax = 5000
  } = {}) {
    super();
    this.connector = connector;
    this.opts = {
      reconnect,
      backoff,
      backoffMax
    };
  }

  connect(...args) {
    const backoff = BACKOFF_STRATEGIES[this.opts.backoff](this.opts.backoffMax);

    const _connect = () => {
      this.connector({
        success: (connection) => {
          backoff.cancel();

          connection.on('disconnected', () => {
            this.emit('disconnected', connection, this);
            if (this.opts.reconnect) {
              backoff(_connect);
            }
          });

          this.emit('connected', this);
          this.emit('connection', connection, this);
        },
        failure: () => {
          if (this.opts.reconnect) {
            backoff(_connect);
          }
        }
      }, ...args);

      this.emit('connecting', this);
    };

    _connect();
  }
}

export default TubingConnector;

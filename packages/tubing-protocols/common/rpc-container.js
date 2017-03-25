import Flags from './flags';
import createError from './error';

const REQUEST = 'request';
const RESPONSE = 'response';

const flags = new Flags({
  type: [REQUEST, RESPONSE],
  error: [false, true],
  oneway: [false, true]
});

const errors = {
  unknownProcedure(name) {
    return createError({
      message: `Unknown procedure: ${name}`,
      name: 'UnknownProcedureError',
      code: 'UNKNOWN',
      data: { procedure: name }
    }, errors.unknownProcedure);
  },

  timeout(msg) {
    return createError({
      message: `RPC Call timed out: ${msg.procedure}`,
      name: 'TimeoutError',
      code: 'TIMEOUT',
      data: { procedure: msg.procedure }
    }, errors.timeout);
  }
};

class RpcContainer {
  lastID = 0;
  timeoutID = 0;
  messages = {};
  handlers = {};

  constructor({ handlers = {}, protocol } = {}) {
    if (!protocol) { throw new Error('Must provide a protocol number to RpcContainer'); }
    this.protocol = protocol;
    this.handlers = handlers;
  }

  sweep() {
    const now = Date.now();

    for (let id of Object.keys(this.messages)) {
      const msg = this.messages[id];
      if (now >= msg.ts + msg.timeout) {
        msg.reject(errors.timeout(msg));
        delete this.messages[id];
      }
    }
    this.scheduleSweep();
  }
  
  scheduleSweep() {
    const values = Object.values(this.messages);
    if (values.length > 0) {
      if (this.timeoutID) { clearTimeout(this.timeoutID); }
      this.timeoutID = setTimeout(
        () => this.sweep(),
        Math.min(...values.map(m => m.timeout))
      );
    }
  }

  attach(socket) {
    if (this.socket) {
      throw new Error('Already attached to a socket');
    }

    this.socket = socket;
    this.socket.install(this.protocol, this.onMessage);
  }

  detach(socket) {
    if (!this.socket) {
      throw new Error('Cannot detach from a socket when no socket is attached yet');
    }
    if (socket !== this.socket) {
      throw new Error('Cannot detach from a different socket than the one attached');
    }

    this.socket.uninstall(this.protocol, this.onMessage);
    delete this.socket;
  }

  onMessage = ({ header, body }) => {
    const { type, error, oneway } = flags.unpack(header.flags);

    if (type === REQUEST) {
      this.onRequest({ header, error, oneway }, body);
    } else if (type === RESPONSE) {
      this.onResponse({ header, error, oneway }, body);
    }
  }

  async onRequest({ header, error, oneway }, body) {
    console.log('RPC REQUEST', { id: header.id, error, oneway }, body);

    const [procedure, args] = body;
    const handler = this.handlers[procedure];

    if (oneway && handler) {
      handler(...args);
      return;
    }

    try {
      if (!handler) { throw errors.unknownProcedure(procedure); }

      const result = await handler(...args);
      this.socket.send({
        ...header,
        flags: flags.pack({ type: RESPONSE })
      }, result);
    } catch (err) {
      this.socket.send({
        ...header,
        flags: flags.pack({ type: RESPONSE, error: true })
      }, {
        n: err.name,
        m: err.message,
        c: err.code,
        d: err.data
      });
    }
  }

  onResponse({ header, error, oneway }, body) {
    console.log('RPC RESPONSE', { id: header.id, error, oneway }, body);

    const msg = this.messages[header.id];

    if (msg) {
      delete this.messages[header.id];
      if (error) {
        const err = new Error(body.m);
        err.name = body.n;
        err.code = body.c;
        err.data = body.d;
        msg.reject(err);
      } else {
        msg.resolve(body);
      }
    }
  }

  call(procedure, ...args) {
    const body = [procedure, args];
    console.log('SEND RPC REQUEST', body);

    const msg = {
      id: ++this.lastID,
      ts: Date.now(),
      timeout: 10000, // default timeout of 10 seconds
      procedure,
      oneway: false
    };
    msg.promise = new Promise((resolve, reject) => {
      msg.resolve = resolve;
      msg.reject = reject;
    });

    this.messages[msg.id] = msg;

    msg.promise.andForget = () => {
      msg.oneway = true;
      delete this.messages[msg.id];
    };

    msg.promise.withTimeout = (millis) => {
      msg.timeout = millis;
      return msg.promise;
    };

    // allow for other options to be activated
    // this will send the message immediately after the current synchronous event loop
    setImmediate(() => {
      this.socket.send({
        id: msg.id,
        flags: flags.pack({ type: REQUEST, oneway: msg.oneway }),
        protocol: this.protocol
      }, body);

      if (!msg.oneway) {
        this.scheduleSweep();
      }
    });

    return msg.promise;
  }

  handle(procedure, handler) {
    if (this.handlers[procedure]) {
      throw new Error(`There is already an RPC handler for ${procedure}`);
    }
    this.handlers[procedure] = handler;
  }
}

export default RpcContainer;

import msgpack from 'msgpack-lite';

import PluginContainer from './plugin-container';

const Codec = msgpack.createCodec({ binarraybuffer: true, preset: true });

const Header = {
  length: 4,
  parse(buffer) {
    const protocol = buffer[0];
    const flags = buffer[1];
    const id = buffer[3] | (buffer[2] << 8);

    return {
      id,
      flags,
      protocol
    };
  }
};

function isPromise(obj) {
  return !!obj && (typeof obj === 'object' || typeof obj === 'function') && typeof obj.then === 'function';
}

class Socket extends PluginContainer {
  protocolModules = {};
  protocolListeners = {};

  constructor(connection, app) {
    super();

    this.app = app;
    this.connection = connection;
    this.connection.on('connecting', this.emit.bind(this, 'connecting'));
    this.connection.on('connected', this.emit.bind(this, 'connected'));
    this.connection.on('disconnected', this.emit.bind(this, 'disconnected'));

    const onMessage = async (data) => {
      const buffer = new Uint8Array(data);
      const header = Header.parse(buffer.slice(0, Header.length));
      const body = buffer.slice(Header.length);
      const decodedBody = msgpack.decode(body, { codec: Codec });

      const message = { header, body: decodedBody };

      await this.applyMiddleware('recv', message);
      this.emit('recv', message);

      const protocolListener = this.protocolListeners[message.header.protocol];
      if (!protocolListener) { return this.emit('message', message); }

      protocolListener(message);
    }

    this.connection.on('message', onMessage);
  }

  install(protocol, fn) {
    if (this.protocolListeners[protocol]) {
      throw new Error(`There is already a protocol listener on protocol ${protocol}`);
    }
    this.protocolListeners[protocol] = fn;
  }

  uninstall(protocol, fn) {
    if (this.protocolListeners[protocol] === fn) {
      delete this.protocolListeners[protocol];
    }
  }

  // use(protocolModule) {
  //   const { protocolName } = protocolModule;
  //   if (!protocolName) {
  //     throw new Error('Protocol modules must define a protocolName');
  //   }
  //   if (this.protocolModules[protocolName]) {
  //     throw new Error(`The ${protocolName} protocol module is already in use`);
  //   }
  //   const m = protocolModule(this);
  //   this.protocolModules[protocolName] = m;
  //   return m;
  // }

  // async applyMiddleware(operation, message) {
  //   const { middlewares }  = this.app;

  //   for (const middleware of middlewares) {
  //     if (typeof middleware[operation] === 'function') {
  //       const res = middleware[operation](message);
  //       if (isPromise(res)) {
  //         await res;
  //       }
  //     }
  //   }
  // }

  async send({ id = 0, flags = 0, protocol = 0 } = {}, body) {
    const message = {
      header: { id, flags, protocol },
      body
    };

    await this.applyMiddleware('send', message);

    const encodedBody = msgpack.encode(message.body, { codec: Codec });

    const buffer = new Uint8Array(4 + encodedBody.byteLength);
    buffer.fill(0);
    buffer.set(new Uint8Array([message.header.protocol]), 0);
    buffer.set(new Uint8Array([message.header.flags]), 1);
    buffer.set(new Uint8Array([
      message.header.id >> 8 & 0xff,
      message.header.id & 0xff
    ]), 2);
    buffer.set(encodedBody, 4);

    this.emit('send', message);

    this.connection.send(buffer);
  }
}

export default Socket;

# tubing

Tubing in a modular socket library that uses the same client/server code regardless of transport.

## High Level Idea

There are two main concepts which are goals of this project.

First, to decouple the creation of a socket from the operation of the socket itself. This
is achieved through the [acceptor-connector pattern](http://www.cs.wustl.edu/~schmidt/PDF/Acc-Con.pdf)
(though I call them listeners and connectors).

Second, to allow for modular "protocols" to be easily built on top of the connections
created by `tubing`. This would be things like RPCs, pub/sub, or any custom application
protocol you might need. Protocols can also add middleware to achieve things like
encryption or authentication.

## Example

The nice thing about tubing is that you write your client and server the same way, regardless
of the underlying transport. The only change is usually the line of code that calls
`connect` or `listen`.

##### Server
```javascript
import tubing from 'tubing';
import listener from 'tubing-websocket/listener';
import { rpcProtocol } from 'tubing-protocols';

const rpcHandlers = {
  echo(value) {
    return value;
  },
  delay(millis, value) {
    return new Promise((resolve) => {
      setTimeout(() => resolve(value), millis);
    });
  }
}

// create the tubing app
const app = tubing();

// add an rpc protocol
app.use('rpc', rpcProtocol(rpcHandlers));

// create a websocket server and listen on port 3000
listener(app).listen(3000);
```

##### Client
```javascript
import tubing from 'tubing';
import connector from 'tubing-websocket/connector';
import { rpcProtocol } from 'tubing-protocols';

// create the tubing app
const app = tubing();

// add an rpc protocol
app.use('rpc', rpcProtocol(rpcHandlers));

// when a new socket is created, make some rpc calls
app.on('socket', async (socket) => {
  const rpc = socket.get('rpc');

  console.log(await rpc.call('echo', 'hello!'));
  console.log(await rpc.call('delay', 2000, 'I waited for you'));
});

// connect to a websocket server on localhost port 3000
connector(app).connect('ws://localhost:3000');
```

## Transports

- [net (TCP)](https://github.com/mattinsler/tubing/tree/master/packages/tubing-net)
- [websocket](https://github.com/mattinsler/tubing/tree/master/packages/tubing-websocket)
- [frame (iframe)](https://github.com/mattinsler/tubing/tree/master/packages/tubing-frame)

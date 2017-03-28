import RpcContainer from '../common/rpc-container';

const PROTOCOL = 100;

function echoProtocol() {
  function handler(socket) {
    const rpc = new RpcContainer({
      protocol: PROTOCOL,
      handlers: {
        echo: (body) => body
      },
    });
    rpc.attach(socket);

    return {
      send(body) {
        return rpc.call('echo', body);
      }
    };
  }

  handler.protocolName = 'echo';

  return handler;
}

export default echoProtocol;

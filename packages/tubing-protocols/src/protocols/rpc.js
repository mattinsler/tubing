import RpcContainer from '../common/rpc-container';

const PROTOCOL = 20;

function rpcProtocol(rpcHandlers = {}) {
  return function(app) {
    return {
      socket(socket) {
        const rpc = new RpcContainer({
          protocol: PROTOCOL,
          handlers: rpcHandlers
        });
        rpc.attach(socket);

        return {
          events: {
            disconnected() {
              rpc.detach(socket);
            }
          },
          module: {
            call: (...args) => rpc.call(...args)
          }
        };
      }
    };
  };
}

export default rpcProtocol;

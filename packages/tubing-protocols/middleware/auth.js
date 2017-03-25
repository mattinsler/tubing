import RpcContainer from '../common/rpc-container';

/*
  middleware should be run for each event keep track
  of the middleware that have run... then you can pick
  up the propagation later...
*/

const PROTOCOL = 10;

export class MemoryAuthStore {
  constructor(users) {
    this.users = users;
  }

  authenticate({ username, password }) {
    const user = this.users.find(u => u.username = username);
    if (user && user.password === password) {
      return user.id;
    }
  }
}

function createRpcContainer(socket, authStore) {
  if (!authStore) {
    return new RpcContainer({ protocol: PROTOCOL });
  }

  return new RpcContainer({
    protocol: PROTOCOL,
    handlers: {
      async login(creds) {
        const user = await authStore.authenticate(creds);
        if (user) {
          socket.auth = { user };
          return user;
        }
        throw new Error('Bad login');
      },
      logout() {
        delete socket.auth;
      }
    }
  });
}

function authMiddleware(authStore) {
  return function(app) {
    return {
      socket(socket) {
        const rpc = createRpcContainer(socket, authStore);
        rpc.attach(socket);

        socket.auth = { loggedIn: false };

        return {
          events: {
            disconnected() {
              rpc.detach(socket);
            }
          },
          // middleware: {
          //   recv(message, next) {
          //     // should we refresh the user object?
          //     next();
          //   }
          // },
          module: {
            async login(creds) {
              const user = await rpc.call('login', creds);
              socket.auth = { loggedIn: true, user };
            },
            logout() {
              socket.auth = { loggedIn: false };
              rpc.call('logout').andForget();
            }
          }
        };
      }
    };
  };
}

export default authMiddleware;

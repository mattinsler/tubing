import tubing from 'tubing';
import { authMiddleware, logMiddleware, rpcProtocol } from 'tubing-protocols';
import { MemoryAuthStore } from 'tubing-protocols/middleware/auth';

const app = tubing();

// maintain peers?
// create id?, session id?
// crypto?

const authStore = new MemoryAuthStore([{
  id: 4,
  name: 'Matt Insler',
  email: 'matt.insler@gmail.com',
  username: 'user',
  password: 'password'
}]);

app.use(logMiddleware());
app.use(authMiddleware(authStore));
app.use('rpc', rpcProtocol({
  echo(value) {
    return value;
  },
  whoami() {
    console.log('whoami?');
  }
}));

// app.on('listening', (listener) => {
//   console.log('Listening');
// });
// app.on('connection', (connection) => {
//   console.log('New connection');
// });
// app.on('disconnected', (connection) => {
//   console.log('Disconnected');
// });
// app.on('socket', (socket) => {
//   console.log('New socket');
// });

export default app;

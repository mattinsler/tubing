import tubing from 'tubing';
import { authMiddleware, logMiddleware, rpcProtocol } from 'tubing-protocols';

const app = tubing();

app.use(logMiddleware());
app.use('auth', authMiddleware());
app.use('rpc', rpcProtocol());

// app.use(authMiddleware({ username: 'mattinsler', password: 'hello123' }));

// app.on('connecting', (connector) => {
//   console.log('Connecting');
// });
// app.on('connected', (connector) => {
//   console.log('Connected');
// });
app.on('disconnected', (connector) => {
  console.log('Disconnected');
});
app.on('socket', async (socket) => {
  const rpc = socket.get('rpc');

  console.log(await rpc.call('echo', 'whaddup'));
  console.log(await rpc.call('whoami'));

  // try {
  //   const auth = socket.get('auth');
  //   const user = await auth.login({ username: 'user', password: 'password' });
  //   console.log(user);

  // } catch (err) {
  //   console.log(err.stack);
  // }

  // socket.get('auth').login('user', 'password');
  // socket.send({}, 'hello world');
});

export default app;

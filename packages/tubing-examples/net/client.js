import connector from 'tubing-net/connector';
import app from '../common/client';

connector(app).connect(21000);

// const socket = connector(app).connect(21000);

// socket.on('connected')
// socket.on('connecting')
// socket.on('')

// connecting...
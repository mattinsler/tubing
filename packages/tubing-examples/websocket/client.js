import connector from 'tubing-websocket/connector';
import app from '../common/client';

connector(app).connect('ws://localhost:3000');

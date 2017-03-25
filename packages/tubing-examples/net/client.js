import connector from 'tubing-net/connector';
import app from '../common/client';

connector(app).connect({ port: 21000 });

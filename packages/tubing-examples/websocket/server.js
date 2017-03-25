import listener from 'tubing-websocket/listener';
import app from '../common/server';

listener(app).listen(3000);

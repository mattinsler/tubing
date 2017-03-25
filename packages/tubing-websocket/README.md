# tubing-websocket

Websocket transport for [tubing](https://github.com/mattinsler/tubing).

## Usage

##### Server
```javascript
// import tubing and create an app ...

import listener from 'tubing-websocket/listener';

listener(app).listen(3000);
/*
  Other options:
  - listener(app).listen(3000, '0.0.0.0');
  - listener(app).listen('/tmp/echo.sock');
  - listener(app).listen(httpServer);
*/
```

##### Client
```javascript
// import tubing and create an app ...

import connector from 'tubing-websocket/connector';

connector(app).connect('ws://localhost:3000');
```

# tubing-net

TCP transport for [tubing](https://github.com/mattinsler/tubing).

## Usage

##### Server
```javascript
// import tubing and create an app ...

import listener from 'tubing-net/listener';

listener(app).listen(3000);
```

##### Client
```javascript
// import tubing and create an app ...

import connector from 'tubing-net/connector';

connector(app).connect({ port: 3000 });
/*
  Other options:
  - connector(app).connect({ port: 3000, host: '122.101.10.10' });
  - connector(app).connect({ path: '/tmp/echo.sock' });
*/
```

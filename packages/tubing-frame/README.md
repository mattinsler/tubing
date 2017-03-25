# tubing-frame

IFrame transport for [tubing](https://github.com/mattinsler/tubing).

## Usage

In `tubing-frame` you just specify a name for the server and connect to the name from the client.

The client will search for the server of the specified name on all of the frames it can find.

##### Server
```javascript
// import tubing and create an app ...

import listener from 'tubing-frame/listener';

listener(app).listen('server-name');
```

##### Client
```javascript
// import tubing and create an app ...

import connector from 'tubing-frame/connector';

connector(app).connector('server-name');
```

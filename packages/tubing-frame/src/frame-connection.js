import { EventEmitter } from 'events';

const HEARTBEAT_SENTINEL = new Buffer([7]).toString();

class FrameConnection extends EventEmitter {
  constructor(srcFrame, src, dstFrame, dst) {
    super();

    let connecting = false;
    let connected = true;

    this.__defineGetter__('connecting', () => connecting);
    this.__defineGetter__('connected', () => connected);

    const heartbeat = {
      intervalID: setInterval(() => {
        this.send(HEARTBEAT_SENTINEL);
      }, 500),

      reset: () => {
        if (heartbeat.checkTimeoutID) { clearTimeout(heartbeat.checkTimeoutID); }
        heartbeat.checkTimeoutID = setTimeout(() => {
          clearInterval(heartbeat.intervalID);
          onDisconnect();          
        }, 2500);
      }
    };

    const onDisconnect = () => {
      srcFrame.removeEventListener('message', recv, false);
      connected = false;
      this.emit('disconnected', this);
    };

    heartbeat.reset();

    const recv = ({ data, source }) => {
      if (
        Array.isArray(data) &&
        data.length === 3 &&
        source === dstFrame &&
        data[0] === dst &&
        data[1] === src
      ) {
        if (data[2] === HEARTBEAT_SENTINEL) {
          heartbeat.reset();
        } else {
          this.emit('message', data[2]);
        }
      }
    };

    srcFrame.addEventListener('message', recv, false);

    this.send = function send(buffer) {
      dstFrame.postMessage([src, dst, buffer], '*');
    };

    this.emit('connected', this);
  }
}

export default FrameConnection;

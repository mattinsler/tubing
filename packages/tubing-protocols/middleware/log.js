function logMiddleware() {
  return function(app) {
    return {
      events(name, ...args) {
        console.log('EVENT', name, args.length);
      },
      socket(socket) {
        return {
          events(name, ...args) {
            console.log('SOCKET EVENT', name, args.length);
          }
        };
      }
    };
  };

  // return function(socket) {
  //   return {
  //     send({ header, body }, next) {
  //       console.log('SEND', { header, body });
  //       next();
  //     },
  //     recv({ header, body }, next) {
  //       console.log('RECV', { header, body });
  //       next();
  //     }
  //   };
  // }
}

export default logMiddleware;

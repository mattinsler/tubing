import { isError } from 'util';
import { EventEmitter } from 'events';

class PluginContainer extends EventEmitter {
  plugins = [];
  eventHandlers = [];
  modules = {};
  middlewares = {};

  emit(event, ...args) {
    for (const handler of this.eventHandlers) {
      handler(event, ...args);
    }

    super.emit(event, ...args);
  }

  get(key) {
    return this.modules[key];
  }

  applyMiddleware(event, value) {
    const middlewares = (this.middlewares[event] || []).slice();
    
    return new Promise((resolve, reject) => {
      function step(idx) {
        if (idx === middlewares.length) { return resolve(); }
        function next(err) {
          if (isError(err)) { return reject(err); }
          step(idx + 1);
        }
        const m = middlewares[idx];
        m(value, next);
      }

      step(0);
    });
  }

  use(key, plugin) {
    if (!!key && typeof(key) !== 'string' && !plugin) {
      plugin = key;
      key = undefined;
    }

    const config = plugin(this);

    if (key && config.module) {
      this.modules[key] = config.module;
    }
    if (config.events) {
      if (typeof(config.events) === 'function') {
        this.eventHandlers.push(config.events);
      } else {
        this.eventHandlers.push((event, ...args) => {
          if (typeof(config.events[event]) === 'function') {
            config.events[event](...args);
          }
        });
      }
    }
    if (config.middleware) {
      for (const [key, value] of Object.entries(config.middleware)) {
        if (typeof(value) === 'function') {
          if (!this.middlewares[key]) { this.middlewares[key] = []; }
          this.middlewares[key].push(value);
        }
      }
    }

    this.plugins.push({ key, config });
  }
}

export default PluginContainer;

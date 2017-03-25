function getFlagWidth(n) {
  if (n <= 2) { return 1; }
  if (n <= 4) { return 2; }
  if (n <= 8) { return 3; }
  if (n <= 16) { return 4; }
  if (n <= 32) { return 5; }
  if (n <= 64) { return 6; }
  if (n <= 128) { return 7; }
  if (n <= 256) { return 8; }
  throw new Error('Flags cannot have more than 256 options');
}

function createMask(width) {
  let mask = 0;
  for (let x = 0; x < width; ++x) {
    mask = mask | (1 << x);
  }
  return mask;
}

class Flags {
  flags = [];

  constructor(config = {}) {
    let index = 0;

    for (let [key, options] of Object.entries(config)) {
      if (options.length === 0) {
        throw new Error(`There must be at least 1 option per flag: ${key}`);
      }
      const flagWidth = getFlagWidth(options.length);

      this.flags.push({
        key,
        index,
        mask: createMask(flagWidth),
        default: options[0],
        options,
        optionMap: options.reduce((o, v, x) => {
          o[String(v)] = x;
          return o;
        }, {})
      });

      index += flagWidth;
    }

    if (index > 8) {
      throw new Error('Too many flags');
    }
  }

  pack(values = {}) {
    const result = this.flags.reduce((result, flag) => {
      const v = values[flag.key] !== undefined ? values[flag.key] : flag.default;
      delete values[flag.key];
      const flagValue = flag.optionMap[String(v)];

      if (typeof(flagValue) !== 'number') {
        throw new Error(`Invalid flag value ${flag.key}=${v}`);
      }
      return result | (flagValue << flag.index);
    }, 0);

    if (Object.keys(values).length > 0) {
      throw new Error(`Invalid flag keys: ${Object.keys(values).join(', ')}`);
    }

    return result;
  }

  unpack(data = 0) {
    return this.flags.reduce((result, flag) => {
      result[flag.key] = flag.options[(data >> flag.index) & flag.mask];
      return result;
    }, {});
  }
}

export default Flags;

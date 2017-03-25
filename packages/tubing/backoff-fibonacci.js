function fibonacci(max) {
  let timeoutId = null;
  const last = [0, 1];

  function backoff(fn) {
    const next = last[0] + last[1];
    last[0] = last[1];
    last[1] = next;
    timeoutId = setTimeout(fn, Math.min(next, max));
  }

  backoff.cancel = function cancel() {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    backoff.reset();
  };

  backoff.reset = function reset() {
    last[0] = 0;
    last[1] = 1;
  };

  return backoff;
}

export default fibonacci;

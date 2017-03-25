function createError({ message, name, code, data = {} }, creationMethod) {
  const error = new Error(message);
  Error.captureStackTrace(error, creationMethod);
  error.name = name;
  error.code = code;
  error.data = data;
  return error;
}

export default createError;

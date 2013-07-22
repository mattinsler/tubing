class Sink
  @define: (method) => new @(method)
  
  constructor: (@method) ->
    
  process: (err, cmd) ->
    @method(err, cmd)

module.exports = Sink

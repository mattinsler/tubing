Q = require 'q'
crypto = require 'crypto'
trycatch = require 'trycatch'

class Pipe
  @define: (pipes...) ->
    Pipeline = require './pipeline'
    
    for x in [0...pipes.length]
      if pipes[x] instanceof Pipeline.Definition
        pipes[x] = new PipelinePipe(pipes[x])
      
      else if !(pipes[x] instanceof Pipe)
        if Array.isArray(pipes[x])
          TempType = MethodPipe.bind.apply(MethodPipe, [null].concat(pipes[x]))
          pipes[x] = new TempType()
        else
          pipes[x] = new MethodPipe(pipes[x])
    
    return new ParallelPipe(pipes) if pipes.length > 1
    pipes[0]

class MethodPipe extends Pipe
  constructor: (@method, @args...) ->
    hash = crypto.createHash('sha1').update(@method.toString())
    hash.update(JSON.stringify(@args)) if args? and args.length > 0
    @hash = hash.digest('hex')
    
  process: (context, cmd) ->
    d = Q.defer()
    
    cmd = cmd[0] if Array.isArray(cmd)
    
    handle_error = (err) =>
      err.tubing =
        pipe: @
        pipeline: context.pipeline
      d.reject(err) if err?
    
    if @args? and @args.length > 0
      method.apply(null, @args)
    else
      method = @method
    
    trycatch =>
      ret = method.call context, cmd, (err, data) =>
        return handle_error(err) if err?
        d.resolve(data or cmd)
    
      d.resolve(ret) if ret? and Q.isPromise(ret)
    , handle_error
    
    d.promise

class ParallelPipe extends Pipe
  constructor: (@pipes) ->
    @hash = @pipes.map((p) -> p.hash).join()
  
  process: (context, cmd) ->
    Q.all(@pipes.map (p) -> p.process(context, cmd))

class PipelinePipe extends Pipe
  constructor: (@pipeline_definition) ->
    @hash = @pipeline_definition.pipes.map((p) -> p.hash).join()
    
  process: (context, cmd) ->
    instance = @pipeline_definition.configure(context.config)
    instance.push(cmd)

module.exports = Pipe

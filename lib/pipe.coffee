Q = require 'q'

class Pipe
  @define: (pipes...) ->
    Pipeline = require './pipeline'
    
    for x in [0...pipes.length]
      if pipes[x] instanceof Pipeline.Definition
        pipes[x] = new PipelinePipe(pipes[x])
      
      else if !(pipes[x] instanceof Pipe)
        pipes[x] = new MethodPipe(pipes[x])
    
    return new ParallelPipe(pipes) if pipes.length > 1
    pipes[0]

class MethodPipe extends Pipe
  constructor: (@method) ->
    
  process: (context, cmd) ->
    d = Q.defer()
    
    ret = @method.call context, cmd, (err) ->
      return d.reject(err) if err?
      d.resolve()
    
    d.resolve(ret) if ret? and Q.isPromise(ret)
    
    d.promise

class ParallelPipe extends Pipe
  constructor: (@pipes) ->
  
  process: (context, cmd) ->
    Q.all(@pipes.map (p) -> p.process(context, cmd))

class PipelinePipe extends Pipe
  constructor: (@pipeline_definition) ->
    
  process: (context, cmd) ->
    instance = @pipeline_definition.configure(context.config)
    instance.push(cmd)

module.exports = Pipe

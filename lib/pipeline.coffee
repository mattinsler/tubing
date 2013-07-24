Q = require 'q'

class Definition
  constructor: (@name) ->
    @pipes = []
  
  then: (pipes...) ->
    throw new Error('Cannot call .then without passing in at least 1 pipe') if pipes.length is 0
    
    Pipe = require './pipe'
    @pipes.push(Pipe.define(pipes...))
    @
  
  configure: (config = {}) ->
    new Pipeline(@, config)

class Pipeline
  @Definition: Definition
  
  @define: (name) => new @Definition(name)
  
  constructor: (@definition, @config) ->
    @sinks = []
  
  push: (cmd) ->
    deferred = Q.defer()
    
    finish_pipeline = (err) =>
      if err?
        deferred.reject(err)
        s.process(err, cmd) for s in @sinks
        return
      
      deferred.resolve()
      s.process(null, cmd) for s in @sinks
    
    context = 
      Q: Q
      defer: -> Q.defer()
      config: @config
      pipeline: @
      exit_pipeline: finish_pipeline
    
    q = Q()
    for pipe in @definition.pipes
      q = q.then(pipe.process.bind(pipe, context, cmd))
    
    q.then ->
      finish_pipeline()
    , finish_pipeline
    
    deferred.promise
  
  publish_to: (sink) ->
    @sinks.push(sink)
    @

module.exports = Pipeline

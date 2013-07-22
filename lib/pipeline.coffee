Q = require 'q'

class Definition
  constructor: (@name) ->
    @pipes = []
  
  then: (pipes...) ->
    throw new Error('Cannot call .then without passing in at least 1 pipe') if pipes.length is 0
    
    Pipe = require './pipe'
    @pipes.push(Pipe.define(pipes...))
    @
  
  configure: (opts) ->
    new Pipeline(@, opts)

class Pipeline
  @Definition: Definition
  
  @define: (name) => new @Definition(name)
  
  constructor: (@definition, @config) ->
    @sinks = []
  
  push: (cmd) ->
    deferred = Q.defer()
    
    context = 
      defer: -> Q.defer()
      config: @config
    
    q = Q()
    for pipe in @definition.pipes
      q = q.then(pipe.process.bind(pipe, context, cmd))
    
    q.then =>
      deferred.resolve()
      s.process(null, cmd) for s in @sinks
    , (err) =>
      deferred.reject(err)
      s.process(err, cmd) for s in @sinks
    
    deferred.promise
  
  publish_to: (sink) ->
    @sinks.push(sink)
    @

module.exports = Pipeline

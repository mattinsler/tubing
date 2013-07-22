exports.Sink = require './sink'
exports.Source = require './source'
exports.Pipe = require './pipe'
exports.Pipeline = require './pipeline'

exports.sink = exports.Sink.define.bind(null)
exports.source = exports.Source.define.bind(null)
exports.pipe = exports.Pipe.define.bind(null)
exports.pipeline = exports.Pipeline.define.bind(null)

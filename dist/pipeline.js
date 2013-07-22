(function() {
  var Definition, Pipeline, Q,
    __slice = [].slice;

  Q = require('q');

  Definition = (function() {

    function Definition(name) {
      this.name = name;
      this.pipes = [];
    }

    Definition.prototype.then = function() {
      var Pipe, pipes;
      pipes = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      if (pipes.length === 0) {
        throw new Error('Cannot call .then without passing in at least 1 pipe');
      }
      Pipe = require('./pipe');
      this.pipes.push(Pipe.define.apply(Pipe, pipes));
      return this;
    };

    Definition.prototype.configure = function(opts) {
      return new Pipeline(this, opts);
    };

    return Definition;

  })();

  Pipeline = (function() {

    Pipeline.Definition = Definition;

    Pipeline.define = function(name) {
      return new Pipeline.Definition(name);
    };

    function Pipeline(definition, config) {
      this.definition = definition;
      this.config = config;
      this.sinks = [];
    }

    Pipeline.prototype.push = function(cmd) {
      var context, deferred, pipe, q, _i, _len, _ref,
        _this = this;
      deferred = Q.defer();
      context = {
        defer: function() {
          return Q.defer();
        },
        config: this.config
      };
      q = Q();
      _ref = this.definition.pipes;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        pipe = _ref[_i];
        q = q.then(pipe.process.bind(pipe, context, cmd));
      }
      q.then(function() {
        var s, _j, _len1, _ref1, _results;
        deferred.resolve();
        _ref1 = _this.sinks;
        _results = [];
        for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
          s = _ref1[_j];
          _results.push(s.process(null, cmd));
        }
        return _results;
      }, function(err) {
        var s, _j, _len1, _ref1, _results;
        deferred.reject(err);
        _ref1 = _this.sinks;
        _results = [];
        for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
          s = _ref1[_j];
          _results.push(s.process(err, cmd));
        }
        return _results;
      });
      return deferred.promise;
    };

    Pipeline.prototype.publish_to = function(sink) {
      this.sinks.push(sink);
      return this;
    };

    return Pipeline;

  }).call(this);

  module.exports = Pipeline;

}).call(this);

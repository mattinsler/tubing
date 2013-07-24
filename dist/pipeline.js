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

    Definition.prototype.configure = function(config) {
      if (config == null) {
        config = {};
      }
      return new Pipeline(this, config);
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
      var context, deferred, finish_pipeline, pipe, q, _i, _len, _ref,
        _this = this;
      deferred = Q.defer();
      finish_pipeline = function(err) {
        var s, _i, _j, _len, _len1, _ref, _ref1, _results;
        if (err != null) {
          deferred.reject(err);
          _ref = _this.sinks;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            s = _ref[_i];
            s.process(err, cmd);
          }
          return;
        }
        deferred.resolve();
        _ref1 = _this.sinks;
        _results = [];
        for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
          s = _ref1[_j];
          _results.push(s.process(null, cmd));
        }
        return _results;
      };
      context = {
        Q: Q,
        defer: function() {
          return Q.defer();
        },
        config: this.config,
        pipeline: this,
        exit_pipeline: finish_pipeline
      };
      q = Q();
      _ref = this.definition.pipes;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        pipe = _ref[_i];
        q = q.then(pipe.process.bind(pipe, context, cmd));
      }
      q.then(function() {
        return finish_pipeline();
      }, finish_pipeline);
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

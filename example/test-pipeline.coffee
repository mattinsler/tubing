tubing = require '../lib/tubing'

TwitterSource = (emit) ->
  tweet = -> emit(tweet: 'Hello @mattinsler, you should check out http://awesomebox.es')
  setInterval(tweet, 5000)
  tweet()

LogSink = (err, cmd) ->
  console.log 'LogSink!'
  console.log arguments

TweetTokenizer = (cmd, done) ->
  setTimeout ->
    throw new Error('FOO BAR BAZ!')
  , 1000
  
  cmd.tokens = cmd.tweet.split(/\s+/)
  # done()

extract_urls = (cmd, done) ->
  d = @defer()
  
  setTimeout ->
    cmd.urls = cmd.tokens.filter (token) ->
      /^https?:\/\/?[\/\.a-zA-Z0-9]+/.test(token)
    d.resolve()
  , 2000
  
  d.promise

shorten_urls = (cmd, done) ->
  done()

extract_names = (cmd, done) ->
  cmd.names = cmd.tokens.filter (token) ->
    token[0] is '@' and token.length > 1
  done()



UrlExtractionPipeline = tubing.pipeline('URL Extracter')
  .then(extract_urls)
  .then(shorten_urls)

TwitterPipeline = tubing.pipeline('Twitter Pipeline')
  .then(TweetTokenizer)
  .then(extract_names, UrlExtractionPipeline)


tweet = 'Hello @mattinsler, you should check out http://awesomebox.es'

sink = tubing.sink(LogSink)
source = tubing.source(TwitterSource)

pipeline = TwitterPipeline.configure()

pipeline.publish_to(sink)
source.publish_to(pipeline)

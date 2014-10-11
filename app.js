var express = require('express'),
  bodyParser = require('body-parser'),
  cookieParser = require('cookie-parser'),
  errorHandler = require('errorhandler'),
  methodOverride = require('method-override'),
  logger = require('morgan'),
  session = require('express-session');
var api = require('instagram-node').instagram();
var app = express();

app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(logger());
app.use(cookieParser());
app.use(bodyParser());
app.use(methodOverride());
app.use(session({ secret: 'keyboard cat' }));

app.use(express.static(__dirname + '/public'));

api.use({
  client_id: '1a94b0a8ce554ee08c54aa8fc7648633',
  client_secret: '70a317af5ca94f02962f335643035671'
});

var redirect_uri = 'http://localhost:3000/auth/instagram/callback';

exports.authorize_user = function(req, res) {
  res.redirect(api.get_authorization_url(redirect_uri, { scope: ['likes'], state: 'a state' }));
};

exports.handleauth = function(req, res) {
  api.authorize_user(req.query.code, redirect_uri, function(err, result) {
    if (err) {
      console.log(err.body);
      res.send("Didn't work");
    } else {
      console.log('Yay! Access token is ' + result.access_token);
      res.send('You made it!!');
    }
  });
};

// This is where you would initially send users to authorize
app.get('/account', exports.authorize_user);
// This is your redirect URI
app.get('/auth/instagram/callback', exports.handleauth);

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
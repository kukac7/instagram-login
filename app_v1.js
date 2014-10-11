var express = require('express'),
	passport = require('passport'),
	bodyParser = require('body-parser'),
	cookieParser = require('cookie-parser'),
	errorHandler = require('errorhandler'),
	methodOverride = require('method-override'),
	logger = require('morgan'),
	session = require('express-session'),
	util = require('util'),
	instagramStrategy = require('passport-instagram').Strategy;

var INSTAGRAM_CLIENT_ID = '1a94b0a8ce554ee08c54aa8fc7648633';
var INSTAGRAM_CLIENT_SECRET = '70a317af5ca94f02962f335643035671';

passport.serializeUser(function(user, done) {
	done(null, user);
});

passport.deserializeUser(function(obj, done) {
	done(null, obj);
});

passport.use(new instagramStrategy({
		clientID: INSTAGRAM_CLIENT_ID,
		clientSecret: INSTAGRAM_CLIENT_SECRET,
		callbackURL: 'http://localhost:3000/auth/instagram/callback'
	},
	function(accessToken, refreshToken, profile, done) {
		process.nextTick(function() {
			return done(null, profile);
		});
	}
));

var app = express();

app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(logger());
app.use(cookieParser());
app.use(bodyParser());
app.use(methodOverride());
app.use(session({ secret: 'keyboard cat' }));

app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res) {
	res.render('index', { user: req.user });
});

app.get('/account', ensureAuthenticated, function(req, res) {
	res.render('account', { user: req.user });
});

app.get('/feed', ensureAuthenticated, function(req, res) {
	res.json('feed', { user: req.user });
});

app.get('/login', function(req, res) {
	res.render('login', { user: req.user });
});

app.get('/auth/instagram',
	passport.authenticate('instagram', {scope: ['comments', 'relationships', 'likes']}),
	function(req, res) {

	});

app.get('/auth/instagram/callback',
	passport.authenticate('instagram', { failRedirect: '/login'}),
	function(req, res) {
		res.redirect('/');
	});

app.get('/logout', function(req, res) {
	req.logout();
	res.redirect('/');
});

app.use(function(err, req, res, next) {
	console.error(err.stack);
	res.status(500).send('hiba');
});

var server = app.listen(3000, function() {
	console.log('Listening on port %d', server.address().port);
});

function ensureAuthenticated(req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	}
	res.redirect('/login');
}
'use strict';

var d = require('../lib/request-debug');
var initialized = false;

module.exports = function(req, res, next){
  if(!initialized){
    initialized = true;
    load(req.app, next);
  }else{
    next();
  }
};

function load(app, fn){
  var home = require('../routes/home');
  var play = require('../routes/play');
  var users = require('../routes/users');

  app.get('/', d, home.index);
  app.get('/play', d, play.index);
  app.post('/startNewGame', d, play.startNewGame);
  app.post('/flip/:card', d, play.flipCard);
  app.post('/revealAll', d, play.revealAll);
  app.post('/quit', d, play.quit);
  app.get('/scores', d, play.highscores);
  app.get('/auth', d, users.auth);
  app.get('/register', d, users.register);
  app.post('/auth', d, users.create);
  app.post('/login', d, users.login);
  app.get('/logout', d, users.logout);
  console.log('Routes Loaded');
  fn();
}


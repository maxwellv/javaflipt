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

  app.get('/', d, home.index);
  app.get('/play', d, play.index);
  console.log('Routes Loaded');
  fn();
}


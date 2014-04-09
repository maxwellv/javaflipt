'use strict';

var url = require('url');
var _ = require('lodash');

module.exports = function(req, res, next){
  var path = url.parse(req.url).pathname;
  var urls = ['/', '/auth', '/register', '/login', '/logout', '/gameinfo', '/about', '/scores', '/misc' ]; //reminder: this is a whitelist, not a blacklist

  if(_.contains(urls, path)){
    next();
  }else{
    if(req.session.userId){
      next();
    }else{
      console.log('************************************');
      console.log('*  REQUEST KILLED BY BOUNCE-USER:  *');
      console.log('************************************');
      console.log(path);
      res.redirect('/');
    }
  }
};

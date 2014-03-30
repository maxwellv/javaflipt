'use strict';

var User = require('../models/user');

exports.auth = function(req, res){
  res.render('user/auth', {title:'User Authentication'});
};

exports.register = function(req, res){
  res.render('user/register', {title:'User registration'});
};

exports.show = function(req, res){
  console.log('USER'+req.params.user);
  User.findByName(req.params.user, function(user){
    console.log(req.params.user);
    res.send({user:user});
  });
};

exports.create = function(req, res){
  console.log('USERS EXPORTS CREATE: ', req.body);
  var newUser = new User(req.body);
  newUser.register(function(err, body){
    if (!err){
      res.redirect('/user/login');
    } else {
      res.render('user/register', {title: 'Registration Error. Try Again.'});
    }
  });
};

exports.login = function(req, res){
  User.findByEmailAndPassword(req.body.email, req.body.password, function(user){
    if(user._id){
      req.session.regenerate(function(){
        req.session.userId = user._id.toString();
        req.session.save(function(){
          res.redirect('/');
        });
      });
    }else{
      req.session.destroy(function(){
        res.render('user/auth', {title:'Email or password incorrect.'});
      });
    }
  });
};

exports.logout = function(req, res){
  req.session.destroy(function(){
    res.redirect('/');
  });
};


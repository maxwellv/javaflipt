'use strict';

module.exports = function(req, res, next){
  var User = require('../models/user');

  User.findById(req.session.userId, function(user){
    res.locals.user = user;
    //console.log('LOOKUP-USER FOUND THIS USER:', user);

    next();
  });
};

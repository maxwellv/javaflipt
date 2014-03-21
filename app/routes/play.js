'use strict';

exports.index = function(req, res){
  res.render('play/index', {title: 'The page where you actually play this game'});
};


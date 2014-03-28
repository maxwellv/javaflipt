'use strict';

var User = require('../models/user');
var Game = require('../models/game');
var difficulties = require('../models/difficulties');
var _ = require('lodash');

exports.index = function(req, res){
  var name;
  User.findById(req.session.userId, function(foundUser){
    if (foundUser === null){
      name = 'an anonymous user';
    } else {
      name = foundUser.name;
    }
    res.render('play/index', {title: 'Play JavaFlipt', name: name});
  });
};

exports.startNewGame = function(req, res){
/*
 * startNewGame is only being called by the client-side JavaScript file. We don't need to do any page rendering here.
 * All we have to send back is the game data.
 */
  User.findById(req.session.userId, function(foundUser){
    Game.findById(foundUser.currentGame, function(foundGame){
      if (!foundGame){ //player has no game saved, start a new one at level 0
        var newGame = new Game({player:foundUser.userId, difficulty:0});
        newGame.save(function(savedGame){
          foundUser = new User(foundUser);
          foundUser.currentGame = savedGame._id;
          foundUser.update(function(updatedUser){
            newGame.makeGameSnapshot(function(snapshot){
              snapshot.totalCoins = updatedUser.coins; //we only need to pass totalCoins when (re)starting a game
              res.send({gameState:snapshot, init:true, after:null});
            });
          });
        });
      } else { //player has a game, let's see if it's ended or not, then go from there
        if (foundGame.ended){
          var oldDifficulty = foundGame.difficulty;
          var newDifficulty;
          if (foundGame.currentCoins === 0){ //player hit a bomb on the last game, maybe lower difficulty
            var totalFlipped = _.difference(foundGame.flipped, [false]).length - 1; //get total number of flipped cards from the last game, subtract 1 for the bomb that the player flipped
            console.log('Total flipped:', totalFlipped);
            console.log('Old difficulty:', oldDifficulty);
            newDifficulty = oldDifficulty + Math.min(totalFlipped - oldDifficulty, 0);
            console.log('Lowering difficulty from', oldDifficulty, 'to', newDifficulty);
          } else if (foundGame.won) { //player hit no bombs and won the last game, increase difficulty
            newDifficulty = Math.min(oldDifficulty + 1, difficulties.length - 1); //can't go above whatever the highest difficulty is
          } else { //player quit before hitting a bomb or winning, keep difficulty the same
            //TODO: Actually test quitting in Voltorb Flip; this is assumed behavior
            newDifficulty = oldDifficulty;
          }
          foundUser.coins += foundGame.currentCoins; //give coins no matter what; if the player lost, it'll add zero anyway
          Game.deleteById(foundGame._id.toString(), function(){ //either way, the last game is over, delete it and make a new one
            var newGame = new Game({player:foundUser.userId, difficulty: newDifficulty});
            newGame.save(function(savedGame){
              foundUser = new User(foundUser);
              foundUser.currentGame = savedGame._id;
              foundUser.update(function(updatedUser){
                newGame.makeGameSnapshot(function(snapshot){
                  snapshot.totalCoins = updatedUser.coins; //we only need to pass totalCoins when (re)starting a game
                  res.send({gameState:snapshot, init:true, after:null});
                });
              });
            });
          });
        } else { //player didn't finish the last game, load it
          foundGame = new Game(foundGame);
          foundGame.makeGameSnapshot(function(snapshot){
            snapshot.totalCoins = foundUser.coins; //we only need to pass totalCoins when (re)starting a game
            res.send({gameState:snapshot, init:true, after:null});
          });
        }
      }
    });
  });
};

exports.flipCard = function(req, res){
  User.findById(req.session.userId, function(foundUser){
    Game.findById(foundUser.currentGame, function(foundGame){
      foundGame = new Game(foundGame);
      foundGame.flipCard(parseInt(req.params.card), function(updatedGameSnapshot){
        res.send({gameState:updatedGameSnapshot, init:false, after:null});
      });
    });
  });
};

exports.revealAll = function(req, res){
  User.findById(req.session.userId, function(foundUser){
    Game.findById(foundUser.currentGame, function(foundGame){
      foundGame = new Game(foundGame);
      foundGame.revealAll(function(gameSnapshot){
        res.send({gameState:gameSnapshot, init:false, after:null});
      });
    });
  });
};

exports.quit = function(req, res){
  User.findById(req.session.userId, function(foundUser){
    Game.findById(foundUser.currentGame, function(foundGame){
      foundGame = new Game(foundGame);
      foundGame.quit(function(gameSnapshot){
        res.send({gameState:gameSnapshot, init:false, after:null});
      });
    });
  });
};

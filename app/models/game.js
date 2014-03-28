'use strict';

var Mongo = require('mongodb');
var Game;
var games = global.nss.db.collection('games');
var difficulties = require('./difficulties');
var _ = require('lodash');

module.exports = Game;
function Game(game){
  this.player = game.player; //ObjectID of a user
  this.difficulty = game.difficulty;
  this.board = game.board ? game.board : generateBoard(difficulties[this.difficulty]);
  this.flipped = game.flipped ? game.flipped : [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false];
  this.currentCoins = game.currentCoins ? game.currentCoins : 0;
  this.ended = game.ended ? game.ended : false;
  this.allRevealed = game.allRevealed ? game.allRevealed : false;
  this.won = game.won ? game.won : false; //needed in case the player does not hit a bomb but still quits before winning
  this._id = game._id ? game._id : undefined;
}

function generateBoard(difficulty){
  var board = [];
  //difficulty will have .bombs, .minOnes, .extraOnes
  //for level 3, these values will be 8, 10, 3
  for (var a = 1;a <= difficulty.bombs;a++){//bombs are fixed for each difficulty
    board.push('bomb');
  }
  var totalOnes = difficulty.minOnes + Math.floor(Math.random() * difficulty.extraOnes);
  //var maxOnes = difficulty.minOnes + difficulty.extraOnes - 1;
  //maybe I was going to use that for some other calculation?
  for (var b = 1;b <= totalOnes;b++){
    board.push('one');
  }
  var remainder = 25 - board.length;//the number of spaces remaining for twos and threes
  var minRemainder = 25 - (difficulty.bombs + difficulty.minOnes + difficulty.extraOnes - 1);//the highest possible value for remainder, if all the extraOnes are generated
  var maxRemainder = 25 - (difficulty.bombs + difficulty.minOnes);//the lowest value, if none of the extraOnes are generated
  //TODO: COLLECT MORE DATA FROM VOLTORB FLIP
  var weight = (remainder - minRemainder + 1) / (maxRemainder - minRemainder + 1);
  weight = Math.max(0.2, Math.min(0.8, weight)); //clamped weight between 20% and 80% to keep things reasonable, may change later
  for (var x = 0;x < remainder;x++){
    if (Math.random() > weight){ //effectively, weight is the chance of getting a two instead of a three
      board.push('three');       //a weight closer to 0.0 means more threes
    } else {                     //so a board with a greater remainder will have more twos, and a lower remainder will have more threes
      board.push('two');         //but there's still a decent random factor either way; this is by design
    }
  }
  board = _.shuffle(board);
  return board;
}

Game.prototype.flipCard = function(card, fn){
  var self = this;
  self.flipped[card] = true;
  var flippedCard = self.board[card];
  switch (flippedCard){
    case 'bomb':
      flippedCard = 0;
      break;
    case 'one':
      flippedCard = 1;
      break;
    case 'two':
      flippedCard = 2;
      break;
    case 'three':
      flippedCard = 3;
      break;
  }
  if (flippedCard === 0){
    self.ended = true;
    self.currentCoins = 0;
  } else if (self.currentCoins === 0){
    self.currentCoins = flippedCard;
  } else {
    self.currentCoins = self.currentCoins * flippedCard;//multiplying by 1 will just return the current coins
    var doneYet = checkAllBonuses(self.board, self.flipped); //has the player found all the twos and threes?
    if (doneYet){
      //player won!
      self.ended = true;
      self.won = true;
    } //each board is guaranteed to have more than one bonus, so we can safely put this check right here
  }
  self.update(function(savedGame){
    savedGame = new Game(savedGame);
    savedGame.makeGameSnapshot(function(snapshot){
      fn(snapshot);
    });
  });
};

function checkAllBonuses(board, flipped){
  var finished = true;
  for (var x = 0;x < 25;x++){
    if (board[x] === 'two' || board[x] === 'three'){
      if (flipped[x] === false){ //found one that isn't flipped yet, game is not over
        finished = false;
        break;
      }
    }
  }
  return finished;
}

Game.prototype.quit = function(fn){ //player took the coins and ran, end it here
  var self = this;
  self.ended = true;
  self.update(function(savedGame){
    savedGame = new Game(savedGame);
    savedGame.makeGameSnapshot(function(snapshot){
      fn(snapshot);
    });
  });
};

Game.prototype.revealAll = function(fn){
  if (this.ended === true){//we need the this.ended check to make sure the player can't cheat
    this.allRevealed = true;
  }//if the player somehow did cheat, it'll still send back a snapshot of the current game
  this.makeGameSnapshot(function(snapshot){
    fn(snapshot);
  });
};

Game.prototype.makeGameSnapshot = function(fn){
  var snapshot = {};
  snapshot.difficulty = this.difficulty;
  snapshot.ended = this.ended;
  snapshot.won = this.won;
  snapshot.currentBoard = [];
  snapshot.rowmarkers = [];
  snapshot.columnmarkers = [[0, 0],[0, 0],[0, 0],[0, 0],[0, 0]]; //format: [total score of the row/column, bombs in the row/column]
  snapshot.currentCoins = this.currentCoins;
  var rowScoreCount = 0;
  var rowBombCount = 0;
  for (var x = 0;x < 25;x++){
    var space = this.board[x];
    if (this.allRevealed || this.flipped[x]){
      snapshot.currentBoard.push(this.board[x]);
    } else { //we only send flipped cards to the client, unless allRevealed is true
      snapshot.currentBoard.push(false);
    }
    switch (space){
      case 'three':
        rowScoreCount += 3;
        snapshot.columnmarkers[x % 5][0] += 3;
        break;
      case 'two':
        rowScoreCount += 2;
        snapshot.columnmarkers[x % 5][0] += 2;
        break;
      case 'one':
        rowScoreCount += 1;
        snapshot.columnmarkers[x % 5][0] += 1;
        break;
      case 'bomb':
        rowBombCount += 1;
        snapshot.columnmarkers[x % 5][1] += 1;
        break;
    }
    if (x % 5 === 4){ //have we reached the end of a row?
      snapshot.rowmarkers.push([rowScoreCount, rowBombCount]);
      rowScoreCount = 0;
      rowBombCount = 0;
    }
  }
  fn(snapshot);
};

Game.prototype.save = function(fn){
  games.insert(this, function(err, record){
    fn(record[0]);
  });
};

Game.prototype.update = function(fn){
  var self = this;
  games.update({_id:this._id}, this, function(err, count){
    Game.findById(self._id.toString(), function(record){
      fn(record);
    });
  });
};

Game.deleteById = function(id, fn){
  var _id = new Mongo.ObjectID(id);
  games.remove({_id:_id}, function(err, removedCount){
    fn(removedCount);
  });
};

Game.findById = function(id, fn){
  if (id){
    var _id = new Mongo.ObjectID(id.toString());
    games.findOne({_id:_id}, function(err, record){
      fn(record);
    });
  } else { //there was no game
    fn(null);
  }
};

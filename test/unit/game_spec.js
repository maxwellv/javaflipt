/* jshint expr:true */
'use strict';

var expect = require('chai').expect;
var Game, User, difficulties;
var Mongo = require('mongodb');
var _ = require('lodash');
var g1, g2, u1;

describe('Game', function(){

  before(function(done){
    var initMongo = require('../../app/lib/init-mongo');
    initMongo.db(function(){
      Game = require('../../app/models/game');
      User = require('../../app/models/user');
      difficulties = require('../../app/models/difficulties');
      done();
    });
  });

  beforeEach(function(done){
    this.timeout(5000);
    global.nss.db.dropDatabase(function(Err, result){
      u1 = new User({name: 'Sue', email:'sue@nomail.com', password:'678utf'});
      u1.register(function(err, body){
        g1 = new Game({player: u1._id, difficulty: 0});
        g1.save(function(savedGame){
          done();
        });
      });
    });
  });

  describe('new', function(){
    it('should create a new Game', function(done){
      g2 = new Game({player:u1._id, difficulty: 0});
      expect(g2).to.be.instanceof(Game);
      expect(g2.player).to.equal(u1._id);
      expect(g2.board).to.have.length(25);
      expect(g2.flipped).to.have.length(25);
      expect(g2.currentCoins).to.equal(0);
      expect(g2.ended).to.equal(false);
      expect(g2.allRevealed).to.equal(false);
      expect(g2.won).to.equal(false);
      done();
    });
  });

  describe('save', function(){
    it('should create a new game and put it in the DB', function(done){
      g2 = new Game({player:u1._id, difficulty: 0});
      g2.save(function(savedGame){
        expect(g2.player).to.equal(u1._id);
        expect(g2.board).to.have.length(25);
        expect(g2.flipped).to.have.length(25);
        expect(g2.currentCoins).to.equal(0);
        expect(g2.ended).to.equal(false);
        expect(g2.allRevealed).to.equal(false);
        expect(g2.won).to.equal(false);
        expect(g2._id).to.be.instanceof(Mongo.ObjectID);
        expect(g2._id.toString().length).to.equal(24);
        done();
      });
    });
  });

  describe('update', function(){
    it('should update a saved game', function(done){
      g1.flipped[0] = true;
      g1.update(function(updatedGame){
        expect(updatedGame._id.toString()).to.equal(g1._id.toString());
        expect(updatedGame.flipped[0]).to.equal(true);
        done();
      });
    });
  });

  describe('deleteById', function(){
    it('should delete a saved game', function(done){
      Game.deleteById(g1._id.toString(), function(count){
        expect(count).to.equal(1);
        done();
      });
    });
  });

  describe('findById', function(){
    it('should find a saved game', function(done){
      Game.findById(g1._id.toString(), function(foundGame){
        expect(foundGame.player.toString()).to.equal(g1.player.toString());
        done();
      });
    });

    it('should return null if given a blank ID', function(done){
      Game.findById(null, function(foundGame){
        expect(foundGame).to.equal(null);
        done();
      });
    });
  });

  describe('flipCard', function(){
    it('should flip a card and return a snapshot of the game in progress', function(done){
      g1.flipCard(0, function(snapshot){
        expect(typeof snapshot).to.equal('object');
        expect(snapshot.currentBoard).to.have.length(25);
        expect(snapshot.currentBoard[0]).to.not.equal(false);
        expect(snapshot.currentBoard[24]).to.equal(false);
        expect(snapshot.difficulty).to.equal(0);
        if (snapshot.currentBoard[0] !== 'bomb'){
          expect(snapshot.currentCoins).to.not.equal(0);
        } else {
          expect(snapshot.ended).to.equal(true);
        }
        done();
      });
    });
  });

  describe('quit', function(){
    it('should quit the game', function(done){
      g1.quit(function(snapshot){
        expect(snapshot.ended).to.equal(true);
        done();
      });
    });
  });

  describe('revealAll', function(){
    it('should reveal all the cards', function(done){
      g1.quit(function(){
        g1.revealAll(function(snapshot){
          expect(snapshot.ended).to.equal(true);
          expect(_.difference(snapshot.currentBoard, [false])).to.have.length(25);
          done();
        });
      });
    });

    it('should not reveal all the cards since the game is not over', function(done){
      g1.revealAll(function(snapshot){
        expect(snapshot.ended).to.equal(false);
        expect(_.difference(snapshot.currentBoard, [false])).to.have.length(0);
        done();
      });
    });
  });
});

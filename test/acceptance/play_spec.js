/* jshint expr:true */

'use strict';

process.env.DBNAME = 'javaflipt-test';
var app = require('../../app/app');
var request = require('supertest');
var expect = require('chai').expect;
var _ = require('lodash');
var User, Game, cookie;
var u1;

describe('users', function(){
  this.timeout(10000);
  before(function(done){
    request(app)
    .get('/')
    .end(function(err, res){
      User = require('../../app/models/user');
      Game = require('../../app/models/game');
      done();
    });
  });

  beforeEach(function(done){
    this.timeout(10000); //extra time since we are sending an email here
    global.nss.db.dropDatabase(function(err, result){
      u1 = new User({name:'Sam', email:'max.vance+JAVAFLIPT_ACCEPTANCE_TEST_BEFOREEACH@gmail.com', password:'678utf'});
      u1.register(function(err, ret){
        request(app)
        .post('/login')
        .field('email', 'max.vance+JAVAFLIPT_ACCEPTANCE_TEST_BEFOREEACH@gmail.com')
        .field('password', '678utf')
        .end(function(err, res){
          cookie = res.headers['set-cookie'];
          done();
        });
      });
    });
  });

  describe('GET /play', function(){
    it('should display the page for playing the game', function(done){
      request(app)
      .get('/play')
      .set('cookie', cookie)
      .expect(200, done);
    });

    it('should not display the page due to not being logged in', function(done){
      request(app)
      .get('/play')
      //.set('cookie', cookie)
      .expect(302, done);
    });
  });

  describe('POST /startNewGame', function(){
    it('should do the Ajax call for starting a new game', function(done){
      request(app)
      .post('/startNewGame')
      .set('cookie', cookie)
      .end(function(err, res){
        expect(res.body.gameState).to.be.ok;
        expect(res.body.init).to.be.ok;
        done();
      });
    });

    it('should do the stuff if the player already has a game in progress', function(done){
      request(app)
      .post('/startNewGame')
      .set('cookie', cookie)
      .end(function(err, res){
        request(app)
        .post('/flip/0') //flip any card; this is good enough, I figure
        .set('cookie', cookie)
        .end(function(err, res){
          request(app)
          .post('/startNewGame')
          .set('cookie', cookie)
          .end(function(err, res){
            expect(res.body.gameState).to.be.ok;
            expect(res.body.init).to.be.ok;
            done();
          });
        });
      });
    });
  });

  describe('POST /flip/:card', function(){
    it('should flip a card', function(done){
      request(app)
      .post('/startNewGame')
      .set('cookie', cookie)
      .end(function(err, res){
        request(app)
        .post('/flip/0')
        .set('cookie', cookie)
        .end(function(err, res){
          expect(res.body.gameState).to.be.ok;
          expect(res.body.gameState.currentBoard[0]).to.not.equal(false);
          done();
        });
      });
    });
  });

  describe('POST /revealAll', function(){
    it('should quit and reveal all cards', function(done){
      request(app)
      .post('/startNewGame')
      .set('cookie', cookie)
      .end(function(err, res){
        request(app)
        .post('/quit')
        .set('cookie', cookie)
        .end(function(err, res){
          request(app)
          .post('/revealAll')
          .set('cookie', cookie)
          .end(function(err, res){
            expect(res.body.gameState).to.be.ok;
            expect(_.difference(res.body.gameState.currentBoard, [false])).to.have.length(25);
            done();
          });
        });
      });
    });
  });

  describe('GET /scores', function(){
    it('should get the high scores', function(done){
      request(app)
      .get('/scores')
      .end(function(err, res){
        expect(res.status).to.equal(200);
        done();
      });
    });
  });
});

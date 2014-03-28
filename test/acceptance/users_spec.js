/* jshint expr:true */

'use strict';

process.env.DBNAME = 'javaflipt-test';
var app = require('../../app/app');
var request = require('supertest');
var expect = require('chai').expect;
var User;
var u1;

describe('users', function(){
  this.timeout(10000);
  before(function(done){
    request(app)
    .get('/')
    .end(function(err, res){
      User = require('../../app/models/user');
      done();
    });
  });

  beforeEach(function(done){
    this.timeout(10000); //extra time since we are sending an email here
    global.nss.db.dropDatabase(function(err, result){
      u1 = new User({name:'Sam', email:'max.vance+JAVAFLIPT_ACCEPTANCE_TEST_BEFOREEACH@gmail.com', password:'678utf'});
      u1.register(function(err, ret){
        done();
      });
    });
  });

  describe('GET /', function(){
    it('should display the new home page', function(done){
      request(app)
      .get('/')
      .expect(200, done);
    });
  });

  describe('GET /auth', function(){
    it('should display the authorization page', function(done){
      request(app)
      .get('/auth')
      .end(function(err, res){
        expect(res.status).to.equal(200);
        expect(res.text).to.include('User Authentication');
        done();
      });
    });
  });

  describe('POST /auth', function(){
    it('should register a user', function(done){
      request(app)
      .post('/auth')
      .field('name', 'Bob')
      .field('email', 'max.vance+JAVAFLIPT_ACCEPTANCE_TEST_BOB@gmail.com')
      .field('password', '1234')
      .end(function(err, res){
        expect(res.status).to.equal(302);
        done();
      });
    });
    it('should not register a duplicate user', function(done){
      request(app)
      .post('/auth')
      .field('name', 'Sam')
      .field('email', 'max.vance+JAVAFLIPT_ACCEPTANCE_TEST_BEFOREEACH@gmail.com')
      .field('password', '123456')
      .end(function(err, res){
        expect(res.status).to.equal(200);
        expect(res.text).to.include('Registration Error');
        done();
      });
    });
  });

  describe('POST /login', function(){
    it('should log in a good user', function(done){
      request(app)
      .post('/login')
      .field('email', 'max.vance+JAVAFLIPT_ACCEPTANCE_TEST_BEFOREEACH@gmail.com')
      .field('password', '678utf')
      .end(function(err, res){
        expect(res.status).to.equal(302);
        done();
      });
    });
    it('should not log in a bad user', function(done){
      request(app)
      .post('/login')
      .field('email', 'bob@aol.com')
      .field('password', '1234')
      .end(function(err, res){
        expect(res.status).to.equal(200);
        expect(res.text).to.include('Email or password incorrect.');
        done();
      });
    });
  });

  describe('POST /logout', function(){
    it('should logout user', function(done){
      request(app)
      .get('/logout')
      .end(function(err, res){
        expect(res.status).to.equal(302);
        done();
      });
    });
  });

  /*
  describe('GET /profile', function(){
    it('should get a user\'s profile editing page', function(done){
      request(app)
      .post('/login')
      .field('email', 'max.vance+JAVAFLIPT_ACCEPTANCE_TEST_BEFOREEACH@gmail.com')
      .field('password', '678utf')
      .end(function(err, res){
        var cookie = res.headers['set-cookie'];
        request(app)
        .get('/profile')
        .set('cookie', cookie)
        .end(function(err, res){
          expect(res.status).to.equal(200);
          expect(res.text).to.include('This is the edit profile page.');
          done();
        });
      });
    });
  });

  describe('POST /updateUserInfo', function(){
    it('should update the user\'s name and email address', function(done){
      var file = __dirname + '/../fixtures/testpic-copy.jpg';
      request(app)
      .post('/auth')
      .field('name', 'Bob')
      .field('email', 'max.vance+FINDMYFANS_ACCEPTANCE_TEST_BOB@gmail.com')
      .field('password', '1234')
      .attach('photo', file)
      .end(function(err, res){
        request(app)
        .post('/login')
        .field('email', 'max.vance+FINDMYFANS_ACCEPTANCE_TEST_BOB@gmail.com')
        .field('password', '1234')
        .end(function(err, res){
          var cookie = res.headers['set-cookie'];
          request(app)
          .post('/updateUserInfo')
          .set('cookie', cookie)
          .field('name', 'Bill')
          .field('email', 'fake@fake.com')
          .end(function(err, res){
            expect(res.status).to.equal(302); //should send us back to the main page
            expect(res.text).to.equal('Moved Temporarily. Redirecting to /');
            done();
          });
        });
      });
    });

    it('should not update this user\'s name and email due to dupeCheck failing', function(done){
      request(app)
      .post('/auth')
      .field('name', 'Bob')
      .field('email', 'max.vance+FINDMYFANS_ACCEPTANCE_TEST_BOB@gmail.com')
      .field('password', '1234')
      .end(function(err, res){
        request(app)
        .post('/login')
        .field('email', 'max.vance+FINDMYFANS_ACCEPTANCE_TEST_BOB@gmail.com')
        .field('password', '1234')
        .end(function(err, res){
          var cookie = res.headers['set-cookie'];
          request(app)
          .post('/updateUserInfo')
          .set('cookie', cookie)
          .field('name', 'Sam') //remember that Sam is registered in the beforeEach statement
          .field('email', 'max.vance+FINDMYFANS_ACCEPTANCE_TEST_BEFOREEACH@gmail.com')
          .end(function(err, res){
            expect(res.status).to.equal(302); //should fail
            expect(res.text).to.equal('Moved Temporarily. Redirecting to /profile');
            done();
          });
        });
      });
    });
  });
  */

});

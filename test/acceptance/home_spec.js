/* jshint expr:true */

'use strict';

process.env.DBNAME = 'javaflipt-test';
var app = require('../../app/app');
var request = require('supertest');
var expect = require('chai').expect;


describe('home', function(){
  describe('GET /', function(){
    it('should show the home page', function(done){
      request(app)
      .get('/')
      .end(function(err, res){
        expect(res.status).to.equal(200);
        expect(res.text).to.contain('Welcome to JavaFlipt');
        done();
      });
    });
  });
});

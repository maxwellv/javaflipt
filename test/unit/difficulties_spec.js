/* jshint expr:true */
'use strict';

var expect = require('chai').expect;
var difficulties = require('../../app/models/difficulties');


describe('Difficulties', function(){
  it('should be a list of the difficulties for this game', function(){
    expect(typeof difficulties).to.equal('object');
  });
});

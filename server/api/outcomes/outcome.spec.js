'use strict';

var _ = require('lodash');
var should = require('should');
var app = require('../../app');
var request = require('supertest');
var Outcome = require('./outcome.model');

// describe('GET /api/outcomes', function() {

//   it('should respond with JSON array', function(done) {
//     request(app)
//       .get('/api/outcomes')
//       .expect(200)
//       .expect('Content-Type', /json/)
//       .end(function(err, res) {
//         if (err) return done(err);
//         res.body.should.be.instanceof(Array);
//         done();
//       });
//   });
// });


describe('merge outcomes', function() {

  var o1 = {    
    a: 'a',
      combinations: [
        { 
        _id: '1',
        likelihood: {value: 1},
        variables: [
          {_id:  'v1'},
          {_id:  'v2'}]
        }
      ]
    };

  var o2 = {
    
    b: 'b',
    combinations: [
      { 
      _id: '2',      
      likelihood: {value: 0.5},
      variables: [
        {_id:  'v2'},
        {_id:  'v3'}]
      }]
    };

  it('should merge ', function(done) {
    console.log('\n\nmerge')
    var m = _.merge(o1,o2,function(a,b){
      if(_.isArray(a) && _.isArray(b)){
        return b;        
      }
    });
    console.log('merge2')
    console.log(m);
  });

});

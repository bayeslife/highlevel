/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /outcomes              ->  index
 * POST    /outcomes              ->  create
 * GET     /outcomes/:id          ->  show
 * PUT     /outcomes/:id          ->  update
 * DELETE  /outcomes/:id          ->  destroy
 */

'use strict';

var _ = require('lodash');
var Outcome = require('./outcome.model');

// Get list of outcomes
exports.index = function(req, res) {
  //Outcome.find(function (err, outcomes) {

  var q = Outcome.find();  
  if(req.query.architecture){
    q.where( {
      $or: [ {architecture: req.query.architecture} , 
             {architecture: { $exists: false} } ] 
           });
  }
  q.exec(function(err,outcomes){
    if(err) { return handleError(res, err); }    
    return res.json(200, outcomes);
  });
};

// Get a single thing
exports.show = function(req, res) {
  Outcome.findById(req.params.id, function (err, thing) {
    if(err) { return handleError(res, err); }
    if(!thing) { return res.send(404); }
    return res.json(thing);
  });
};

// Creates a new thing in the DB.
exports.create = function(req, res) {
  //req.body.type='outcome';
  Outcome.create(req.body, function(err, thing) {
    if(err) { return handleError(res, err); }
    return res.json(201, thing);
  });
};

// Updates an existing thing in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }

  Outcome.findById(req.params.id, function (err, thing) {
    if (err) { return handleError(res, err); }
    if(!thing) { return res.send(404); }    
    var updated = _.merge(thing, req.body,function(a,b){
      if(_.isArray(a) && _.isArray(b)){
        return b;        
      }
    });
    //console.log(updated);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, thing);
    });
  });
};

// Deletes a thing from the DB.
exports.destroy = function(req, res) {
  Outcome.findById(req.params.id, function (err, thing) {
    if(err) { return handleError(res, err); }
    if(!thing) { return res.send(404); }
    thing.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

// Deletes a outcome from the DB.
exports.removeArchitecture = function(architectureId) {
  var q = Outcome.find();
  q.where( {architecture: architectureId} );
  
  q.exec(function(err,outcomes){
    console.log('Removing outcomes:'+ outcomes.length);
    if(!err) { 
      outcomes.forEach(function(outcome){
          outcome.remove();
      });
    }
  });
};

function handleError(res, err) {
  return res.send(500, err);
}
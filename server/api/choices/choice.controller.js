/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /choices              ->  index
 * POST    /choices              ->  create
 * GET     /choices/:id          ->  show
 * PUT     /choices/:id          ->  update
 * DELETE  /choices/:id          ->  destroy
 */

'use strict';

var _ = require('lodash');
var Choice = require('./choice.model');

// Get list of choices
exports.index = function(req, res) {
  //Choice.find(function (err, choices) {
  var q = Choice.find();  
  if(req.query.architecture){
    q.where( {
      $or: [ {architecture: req.query.architecture} , 
             {architecture: { $exists: false} } ] 
           });
  }
  q.exec(function(err,choices){
    if(err) { return handleError(res, err); }    
    return res.json(200, choices);
  });
};

// Get a single choice
exports.show = function(req, res) {
  Choice.findById(req.params.id, function (err, choice) {
    if(err) { return handleError(res, err); }
    if(!choice) { return res.send(404); }
    return res.json(choice);
  });
};

// Creates a new choice in the DB.
exports.create = function(req, res) {  
  //req.body.type='choice';
  Choice.create(req.body, function(err, choice) {
    if(err) { return handleError(res, err); }    
    return res.json(201, choice);
  });
};

// Updates an existing choice in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Choice.findById(req.params.id, function (err, choice) {
    if (err) { return handleError(res, err); }
    if(!choice) { return res.send(404); }
    var updated = _.merge(choice, req.body,function(a,b){
      if(_.isArray(a) && _.isArray(b)){
        return b;
      }
    });
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, choice);
    });
  });
};

// Deletes a choice from the DB.
exports.destroy = function(req, res) {
  Choice.findById(req.params.id, function (err, choice) {
    if(err) { return handleError(res, err); }
    if(!choice) { return res.send(404); }
    choice.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

// Choices
exports.categoryChoices = function(req, res) {  
   var q = Choice.find();
    q.where({categoryId: req.params.categoryId}).limit(25).exec(function (err,choices) {
      if(err) { return handleError(res, err); }
      //console.log('choices'+ choices);
      return res.json(200,choices);
    });
};

// Deletes a capability from the DB.
exports.removeArchitecture = function(architectureId) {
  var q = Choice.find();
  q.where( {architecture: architectureId} );
  
  q.exec(function(err,choices){
    console.log('Removing Choices:'+ choices.length);
    if(!err) { 
      choices.forEach(function(choice){
          choice.remove();
      });
    }
  });
};


function handleError(res, err) {
  return res.send(500, err);
}
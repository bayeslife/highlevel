/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /capabilities              ->  index
 * POST    /capabilities              ->  create
 * GET     /capabilities/:id          ->  show
 * PUT     /capabilities/:id          ->  update
 * DELETE  /capabilities/:id          ->  destroy
 */

'use strict';

var _ = require('lodash');
var Capability = require('./capability.model');

// Get list of capabilities
exports.index = function(req, res) {
  //Capability.find(function (err, capabilities) {
  var q = Capability.find();  
  if(req.query.architecture){
    q.where( {
      $or: [ {architecture: req.query.architecture} , 
             {architecture: { $exists: false} } ] 
           });
  }
  q.exec(function(err,capabilities){
    if(err) { return handleError(res, err); }    
    return res.json(200, capabilities);
  });
};

// Get a single capability
exports.show = function(req, res) {
  Capability.findById(req.params.id, function (err, capability) {
    if(err) { return handleError(res, err); }
    if(!capability) { return res.send(404); }
    return res.json(capability);
  });
};

// Creates a new capability in the DB.
exports.create = function(req, res) {
  //req.body.type='capability';
  //console.log(req.body);
  Capability.create(req.body, function(err, capability) {
    
    if(err) {       
      return handleError(res, err); 
    }    
    return res.json(201, capability);
  });
};

// Updates an existing capability in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Capability.findById(req.params.id, function (err, capability) {
    if (err) { return handleError(res, err); }
    if(!capability) { return res.send(404); }
    var updated = _.merge(capability, req.body,function(a,b){
      if(_.isArray(a) && _.isArray(b)){
        return b;        
      }
    });
    //console.log(updated.combinations);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, capability);
    });
  });
};

// Deletes a capability from the DB.
exports.destroy = function(req, res) {
  Capability.findById(req.params.id, function (err, capability) {
    if(err) { return handleError(res, err); }
    if(!capability) { return res.send(404); }
    capability.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

// Deletes a capability from the DB.
exports.removeArchitecture = function(architectureId) {
  var q = Capability.find();
  q.where( {architecture: architectureId} );
  
  q.exec(function(err,capabilities){
    console.log('Removing capabilities:'+ capabilities.length);
    if(!err) { 
      capabilities.forEach(function(capability){
          capability.remove();
      });
    }
  });
};

function handleError(res, err) {
  return res.send(500, err);
}
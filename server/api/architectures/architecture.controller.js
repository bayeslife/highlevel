/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /architectures              ->  index
 * POST    /architectures              ->  create
 * GET     /architectures/:id          ->  show
 * PUT     /architectures/:id          ->  update
 * DELETE  /architectures/:id          ->  destroy
 */

'use strict';

var _ = require('lodash');
var Architecture = require('./architecture.model');

var Capability = require('../capabilities/capability.controller');
var Choice = require('../choices/choice.controller');
var Outcome = require('../outcomes/outcome.controller');

// Get list of architectures
exports.index = function(req, res) {
  Architecture.find(function (err, architectures) {
    if(err) { return handleError(res, err); }    
    return res.json(200, architectures);
  });
};

// Get a single architecture
exports.show = function(req, res) {
  Architecture.findById(req.params.id, function (err, architecture) {
    if(err) { return handleError(res, err); }
    if(!architecture) { return res.send(404); }
    return res.json(architecture);
  });
};

// Creates a new architecture in the DB.
exports.create = function(req, res) {
  Architecture.create(req.body, function(err, architecture) {
    req.body.type='Architecture';
    if(err) { return handleError(res, err); }
    console.log('here2');
    return res.json(201, architecture);
  });
};

// Updates an existing architecture in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Architecture.findById(req.params.id, function (err, architecture) {
    if (err) { return handleError(res, err); }
    if(!architecture) { return res.send(404); }
    var updated = _.merge(architecture, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, architecture);
    });
  });
};

// Deletes a architecture from the DB.
exports.destroy = function(req, res) {

  Capability.removeArchitecture(req.params.id);
  Choice.removeArchitecture(req.params.id);
  Outcome.removeArchitecture(req.params.id);

  Architecture.findById(req.params.id, function (err, architecture) {
    if(err) { return handleError(res, err); }
    if(!architecture) { return res.send(404); }
    architecture.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

function handleError(res, err) {
  return res.send(500, err);
}
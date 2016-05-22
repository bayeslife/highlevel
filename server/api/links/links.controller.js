/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /links              ->  index
 * POST    /links              ->  create
 * GET     /links/:id          ->  show
 * PUT     /links/:id          ->  update
 * DELETE  /links/:id          ->  destroy
 */

'use strict';

var _ = require('lodash');
var Link = require('./links.model');

// Get list of links
exports.index2 = function(req, res) {
  Link.find(function (err, links) {
    if(err) { return handleError(res, err); }    
    return res.json(200, links);
  });
};

exports.index = function(req, res) {
  var q = Link.find();  
  if(req.query.architecture){
    q.where( {
      $or: [ {architecture: req.query.architecture} , 
             {architecture: { $exists: false} } ] 
           });
  }
  q.exec(function (err, links) {
    if(err) { return handleError(res, err); }
    return res.json(200, links);
  });
};

// Get a single link
exports.show = function(req, res) {
  Link.findById(req.params.id, function (err, link) {
    if(err) { return handleError(res, err); }
    if(!link) { return res.send(404); }
    return res.json(link);
  });
};

// Creates a new link in the DB.
exports.create = function(req, res) {
  req.body.type='Link';
  Link.create(req.body, function(err, link) {
    
    if(err) {       
      return handleError(res, err); 
    }    
    return res.json(201, link);
  });
};

// Updates an existing link in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Link.findById(req.params.id, function (err, link) {
    if (err) { return handleError(res, err); }
    if(!link) { return res.send(404); }
    var updated = _.merge(link, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, link);
    });
  });
};

// Deletes a link from the DB.
exports.destroy = function(req, res) {
  Link.findById(req.params.id, function (err, link) {
    if(err) { return handleError(res, err); }
    if(!link) { return res.send(404); }
    link.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

function handleError(res, err) {
  return res.send(500, err);
}
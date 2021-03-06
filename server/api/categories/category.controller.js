/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /categorys              ->  index
 * POST    /categorys              ->  create
 * GET     /categorys/:id          ->  show
 * PUT     /categorys/:id          ->  update
 * DELETE  /categorys/:id          ->  destroy
 */

'use strict';

var _ = require('lodash');
var Category = require('./category.model');

// Get list of categorys
exports.index = function(req, res) {
  //Category.find(function (err, categorys) {
  var q = Category.find();  
  if(req.query.architecture){
    q.where( {
      $or: [ {architecture: req.query.architecture} , 
             {architecture: { $exists: false} } ] 
           });
  }
  q.exec(function(err,categorys){
    if(err) { return handleError(res, err); }    
    return res.json(200, categorys);
  });
};

// Get a single category
exports.show = function(req, res) {
  Category.findById(req.params.id, function (err, category) {
    if(err) { return handleError(res, err); }
    if(!category) { return res.send(404); }
    return res.json(category);
  });
};

// Creates a new category in the DB.
exports.create = function(req, res) {
  //req.body.type='category';
  Category.create(req.body, function(err, category) {  
    if(err) {       
      return handleError(res, err); 
    }    
    return res.json(201, category);
  });
};

// Updates an existing category in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }  
  Category.findById(req.params.id, function (err, category) {
    if (err) { return handleError(res, err); }
    if(!category) { return res.send(404); }
    var updated = _.merge(category, req.body,function(a,b){
      if(_.isArray(a) && _.isArray(b)){
        return b;        
      }
    });  
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, category);
    });
  });
};

// Deletes a category from the DB.
exports.destroy = function(req, res) {
  Category.findById(req.params.id, function (err, category) {
    if(err) { return handleError(res, err); }
    if(!category) { return res.send(404); }
    category.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

function handleError(res, err) {
  return res.send(500, err);
}
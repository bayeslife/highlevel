'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var CategorySchema = new Schema({
  architecture: String,
  type: String,
  name: String,
  info: String,
  active: Boolean,
  combinations: {},
  fixed: Number,
  x: Number,
  y: Number  
});

module.exports = mongoose.model('Category', CategorySchema);
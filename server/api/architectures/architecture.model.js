'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var ArchitectureSchema = new Schema({
  name: String,
  info: String,
  description: String,
  active: Boolean
});

module.exports = mongoose.model('Architecture', ArchitectureSchema);
'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var ChoiceSchema = new Schema({
	architecture: String,
	type: String,
  	name: String,
  	info: String,
  	active: Boolean,
  	categoryId: String,
  	probability: Number,
  	probabilityNode: Boolean,
    binaryNode: Boolean,
  	fixed: Number,
  	combinations: {},
  	x: Number,
  	y: Number
});

module.exports = mongoose.model('Choice', ChoiceSchema);
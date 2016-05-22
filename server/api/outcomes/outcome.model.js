'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var OutcomeSchema = new Schema({
	architecture: String,
	type: String,
  	name: String,
  	info: String,
  	active: Boolean,
  	probability: Number,
  	probabilityNode: Boolean,
  	x: Number,
  	y: Number,
  	fixed: Number,
  	combinations: [{ 
  		_id: String,
		likelihood: {
			value: Number
		},
		variables: [{			
			_id: 	String,
			negate: Boolean
		}]
	}]
});

module.exports = mongoose.model('Outcome', OutcomeSchema);
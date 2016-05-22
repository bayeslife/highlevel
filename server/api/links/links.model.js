'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var LinkSchema = new Schema({
	architecture: String,
	sourceId: String,
	sourceType: String,
	targetId: String,
	targetType: String,
	correlation: Number	
});

module.exports = mongoose.model('Link', LinkSchema);
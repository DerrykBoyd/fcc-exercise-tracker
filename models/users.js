'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var User = new Schema({
	username: {type: String, unique: true},
  exercises: [{
    description: String,
    duration: Number,
    date: String
  }]
});

module.exports = mongoose.model('User', User);
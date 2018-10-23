'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var User = new Schema({
  _id: {type: String},
	username: {type: String, unique: true},
  exercises: [{
    description: String,
    duration: Number,
    date: {type: Date, default: Date.now}
  }]
});

module.exports = mongoose.model('User', User);
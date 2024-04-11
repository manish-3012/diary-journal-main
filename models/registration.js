// /models/registration.js

const mongoose = require('mongoose');

// Define a schema
const registrationSchema = new mongoose.Schema({
  adults: [{
    name: String,
    AadharNumber: String,
    gender: String
  }],
  yuvas: [{
    name: String,
    AadharNumber: String,
    gender: String
  }],
  bals: [{
    name: String,
    AadharNumber: String,
    gender: String
  }]
});

// Create a model
const Registration = mongoose.model('Registration', registrationSchema);

module.exports = Registration;

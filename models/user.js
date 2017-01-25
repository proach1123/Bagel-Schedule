var mongoose = require('mongoose');

module.exports = mongoose.model('User',{
    username: String,  
    firstName: String,
    lastName: String,
    email: String,
    password: String
});
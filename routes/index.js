var express = require('express');
var router = express.Router();
var mongoDbFunctions = require('../mongodb.js');
var signup = require('../Passport/signup.js');
var login = require('../Passport/login.js');

var isAuthenticated = function (req, res, next) {
	// if user is authenticated in the session, call the next() to call the next request handler 
	// Passport adds this method to request object. A middleware is allowed to add properties to
	// request and response objects
	if (req.isAuthenticated())
		return next();
	// if the user is not authenticated then redirect him to the login page
	res.redirect('/login');
}

module.exports = function(passport){

	/* GET login page. */
	router.get('/login', function(req, res, next) {
    	// Display the Login page with any flash message, if any
		res.render('login', { message: req.flash('') });
	});

	/* Handle Login POST */
	router.post('/login', passport.authenticate('login', {
		successRedirect: '/',
		failureRedirect: '/login',
		failureFlash : true  
	}));

	/* GET Registration Page */
	router.get('/signup', function(req, res, next){
		res.render('register',{message: req.flash('')});
	});

	/* Handle Registration POST */
	router.post('/signup', passport.authenticate('signup', {
		successRedirect: '/login',
		failureRedirect: '/signup',
		failureFlash : true  
	}));

	/* GET home page. */
	router.get('/', isAuthenticated, function(req, res){
	  	res.render('homepage', { user: req.user });
	});

	router.get('/input', isAuthenticated, function(req, res, next) {
	res.render('input', { user: req.user });
	});

	router.post('/input', function(req, res, next){
		console.log(req.body);
		
		//Will take the inputed data and find if this person has ever been scheduled by checking personRecord
		mongoDbFunctions.findDocuments({ Name: req.body.Name, ATTU_ID: req.body.ATTU_ID }, "personRecord", function(result) {

			//if it is not found in personRecord
			if(!result.length) {
				//inserts availability into next month's availability
				mongoDbFunctions.insertDocuments(req.body, "availability_Next");
				//creates document for personRecord
				var person = {
					Name: req.body.Name,
					ATTU_ID: req.body.ATTU_ID,
					numTimesScheduled: 0,
					lastShift: null
				};

				//Algorithm stuff
				mongoDbFunctions.algorithm("availability_Next");

				//inserts into personRecord
				mongoDbFunctions.insertDocuments(person, "personRecord");

				mongoDbFunctions.aggregateDocuments(person, "availability_Next");
			}

			//if it is found in personRecord
			else {
				//finds the availability document for person in next month's availability 
				mongoDbFunctions.findDocuments({Name: req.body.Name, ATTU_ID: req.body.ATTU_ID }, "availability_Next", function(result) {
					if(result.length) {
						console.log("I'm in the if statement");
						result[0].Available = req.body.Available;
						mongoDbFunctions.updateDocument(result[0], "availability_Next");
					}
					else {
						console.log("I'm in the else statement")
						mongoDbFunctions.insertDocuments(req.body, "availability_Next");
					}
				});	
			}
		});
	});

	router.get('/output', isAuthenticated, function(req, res, next) {
	  res.render('output', { user: req.user });
	});

	router.get('/optout', isAuthenticated, function(req, res, next) {
	  res.render('optout', { user: req.user });
	});

	router.post('/optout', function(req, res, next){
		console.log(req.body);
		//mongoDbFunctions.findDocuments(req.body, "schedule");
	});

	return router;
}

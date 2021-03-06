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

		var setupnames = [];
		var weds = [];

		function nextWed(){
			var l = 0;
			var d = new Date();
			var year = d.getFullYear();
			var month = d.getMonth();
			var wedarray=[];

			if(month==0||month==2||month==4||month==6||month==7||month==9||month==11){
			    l=31;
		    }

		    else if(month!=1){
			    l=30;
			}

			else if(year%4==0&&year%100==0&&year%1000!=0){
				l=29;
		    }

		    else{
			    l=28;
		    }
				    
		    for (var i=0; i <= l; i++) {
				console.log(i);
				d = new Date(year, month, i, 0, 0, 0,0);
				if (d.getDay() === 3){
				  	wedarray.push(d);
				}
				    	
    		}
			return wedarray;
		};

		weds = nextWed();
		Promise.all(mongoDbFunctions.findDocuments({}, "Schedule", function(result){
			return new Promise(function (resolve, reject){
				weds = nextWed();

				for (var i=0; i <= weds.length-1; i++) {
					for (var n=0; n<= result.length-1; n++){
						if (weds[i] === result[n].Date){
							setupnames.push(result[n].setup.Name);
						}
					}	    	
			    }
			    	
			});
			resolve();
		})).then(
			res.render('homepage', { setup1: setupnames[0], setup2: req.user })
		);
		
	});

	router.get('/input', isAuthenticated, function(req, res, next) {
	res.render('input', { user: req.user });
	});

	router.post('/input', function(req, res, next){
		console.log(req.user);

		function getCharsBefore(str, chr) {
		    var index = str.indexOf(chr);
		    if (index != -1) {
		        return(str.substring(0, index));
		    }
		    return("");
		}

		var userID = getCharsBefore(req.user.email, "@")
		req.body.Name = req.user.firstName+" "+req.user.lastName;
		req.body.ATTU_ID = userID;

		//Will take the inputed data and find if this person has ever been scheduled by checking personRecord
		mongoDbFunctions.findDocuments({ Name: req.body.Name, ATTU_ID: req.body.ATTU_ID }, "personRecord", function(result) {

			//if it is not found in personRecord
			if(!result.length) {
				//inserts availability into next month's availability
				mongoDbFunctions.insertDocuments(req.body, "availability_Next");
				//creates document for personRecord
				//var d = new Date(2017, 02, 30, 0, 0, 0, 0);
				var person = {
					Name: req.body.Name,
					ATTU_ID: req.body.ATTU_ID,
					numTimesScheduled: 0,
					lastShift: null
				};
				//inserts into personRecord
				mongoDbFunctions.insertDocuments(person, "personRecord");

				var wednesdayArray = nextWed();

				for (var k = 0; k < wednesdayArray.length; k++){
					var date = wednesdayArray[k];

					//Algorithm stuff
					mongoDbFunctions.algorithm("availability_Next", date);
				}

				function nextWed(){
				  var l = 0;
				    var d = new Date();
				    var year = d.getFullYear();
				    var month = d.getMonth()+1;
				    var wedarray=[];

				    if(month==0||month==2||month==4||month==6||month==7||month==9||month==11){
				      l=31;
				    }

				    else if(month!=1){
				      l=30;
				    }

				    else if(year%4==0&&year%100==0&&year%1000!=0){
				      l=29;
				    }

				    else{
				      l=28;
				    }
				    
				    for (var i=0; i <= l; i++) {
				    	console.log(i);
				    	d = new Date(year, month, i, 0, 0, 0,0);
				    	if (d.getDay() === 3){
				    		wedarray.push(d);
				    	}
				    	
    				}
				    return wedarray;

				};
			}

			else {

				mongoDbFunctions.updateAvailable(req.body, "availability_Next");

				// 
				/*
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
				});*/
					
			}

	})});

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

	router.post('/cancelSchedule', function(req, res, next){
	console.log(req.body);

	 mongoDbFunctions.cancelSchedule({date: req.body.date, setup: req.body.setup, eightthirty: req.body.eightthirty, nine: req.body.nine, ninethirty: req.body.ninethirty, ten: req.body.ten, cleanup1: req.body.cleanup1, cleanup2: req.body.cleanup2}, "Schedule", function(result) {

	 })
});

	return router;
}
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
	router.get('/', /*isAuthenticated,*/ function(req, res){
	  	res.render('homepage', { user: req.user });
	});

	router.get('/input', /*isAuthenticated,*/ function(req, res, next) {
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
		
		//Will take the inputed data and find if this person has ever been scheduled by checking personRecord
		mongoDbFunctions.findDocuments({ Name: req.user.firstName+" "+req.user.lastName, ATTU_ID: userID }, "personRecord", function(result) {

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

				
			}

			else {

				mongoDbFunctions.updateAvailable(req.body, "availability_Next");
					
			}

	})});

	router.get('/output', /*isAuthenticated,*/ function(req, res, next) {
	  res.render('output', { user: req.user });
	});

	router.post('/output', /*isauthenticated,*/ function(req, res, next){
			console.log(req.body);
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
	});

	router.get('/optout', /*isAuthenticated,*/ function(req, res, next) {
	  res.render('optout', { user: req.user });
	});

	router.post('/optout', function(req, res, next){
		console.log(req.body);
		var shifts = [ { value : 'setup' }, { value : 'eightthirty' }, { value : 'nine' }, { value : 'ninethirty' }, { value : 'ten' }, { value : 'cleanup1' }, { value: 'cleanup2'}];
		var data = { "Date" : req.body.Cancel, };
		console.log(data);
		mongoDbFunctions.findDocuments(data, "schedule", function (result){
			if(result && result.length){
				for (var i = 0; i < shifts.length; i++){
					var shift = shifts[i].value;
					if(req.body.ATTU_ID === result[0].shift.ATTU_ID){
						var cancelThis = shift;
						mongoDbFunctions.updateSchedule(req.body.Cancel, cancelThis, "Schedule");	
					}
				}
				
			}
		});
	});

	return router;
}
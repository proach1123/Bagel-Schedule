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
	  	mongoDbFunctions.findDocuments({}, "Schedule", function(result){

			weds = nextWed();

		  	for (var i=0; i <= weds.length-1; i++) {
				for (var n=0; n<= result.length-1; n++){
					if (weds[i] === result[n].Date){
						setupnames.push(result[n].setup.Name);
					}
				}	    	
	    	}
	    	res.render('homepage', 
	    		{ setup1: result[0].setup.Name, 8301: result[0].eightthirty.Name, 9001: result[0].nine.Name, 9301: result[0].ninethirty.Name, 10001: result[0].ten.Name, clean11: result[0].cleanup1.Name, clean21: result[0].cleanup2.Name,
	    		setup2: result[3].setup.Name, 8302: result[3].eightthirty.Name, 9002: result[3].nine.Name, 9302: result[3].ninethirty.Name, 10002: result[3].ten.Name, clean12: result[3].cleanup1.Name, clean22: result[3].cleanup2.Name,
	    		setup3: result[1].setup.Name, 8303: result[1].eightthirty.Name, 9003: result[1].nine.Name, 9303: result[1].ninethirty.Name, 10003: result[1].ten.Name, clean13: result[1].cleanup1.Name, clean23: result[1].cleanup2.Name,
	    		setup4: result[2].setup.Name, 8304: result[2].eightthirty.Name, 9004: result[2].nine.Name, 9304: result[2].ninethirty.Name, 10004: result[2].ten.Name, clean14: result[2].cleanup1.Name, clean24: result[2].cleanup2.Name
	    	});
	  	}); 
	  	
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

				
			}

			else {

				mongoDbFunctions.updateAvailable(req.body, "availability_Next");
					
			}

	})});

	router.get('/output', isAuthenticated, function(req, res, next) {
	  res.render('output', { user: req.user });
	});

	router.post('/output', /*isAuthenticated,*/ function(req, res, next){
		
		if(req.body){
			var idList =[];
			var wedarray=[];
			var wednesdayArray = nextWed();
  
			for (var k = 0; k < wednesdayArray.length; k++){
				var date = wednesdayArray[k];

				//Algorithm stuff
				mongoDbFunctions.algorithm("availability_Next", date, idList);
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
	});

	router.get('/optout', isAuthenticated, function(req, res, next) {
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
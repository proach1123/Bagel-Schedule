var express = require('express');
var router = express.Router();
var mongoDbFunctions = require('../mongodb.js');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('homepage', { title: 'Express' });
});

router.get('/input', function(req, res, next) {
  res.render('input', { });
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
			//inserts into personRecord
			mongoDbFunctions.insertDocuments(person, "personRecord");
		}

		//if it is found in personRecord
		else {
			//finds the availability document for person in next month's availability 
			mongoDbFunctions.findDocuments({Name: req.body.Name, ATTU_ID: req.body.ATTU_ID }, "availability_Next", function(result) {
				if(result.length) {
					console.log("I'm in the if statement");
					result[0].available = req.body.available;
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

router.get('/output', function(req, res, next) {
  res.render('output', { });
});

router.get('/optout', function(req, res, next) {
  res.render('optout', { });
});

router.post('/optout', function(req, res, next){
	console.log(req.body);
	//mongoDbFunctions.findDocuments(req.body, "schedule");
});

module.exports = router;

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
	
	mongoDbFunctions.findDocuments({ Name: req.body.Name, ATTU_ID: req.body.ATTU_ID }, "personRecord", function(result) {
		if(!result.length) {
			mongoDbFunctions.insertDocuments(req.body, "availability_Next");
			var person = {
				Name: req.body.Name,
				ATTU_ID: req.body.ATTU_ID,
				numTimesScheduled: 0,
				lastShift: null
			};
			mongoDbFunctions.insertDocuments(person, "personRecord");
		}
		else {
			mongoDbFunctions.findDocuments({Name: req.body.Name, ATTU_ID: req.body.ATTU_ID }, "availability_Next", function(result) {
				if(result.length) {
					result[0].available = req.body.available;
					mongoDbFunctions.updateDocument(result[0], "availability_Next");
				}
				else {
					mongoDbFunctions.insertDocuments(req.body, "availability_Next");
				}
			});	
		}
	});
	console.log("Give you what personPresent is");
	console.log(personPresent);
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

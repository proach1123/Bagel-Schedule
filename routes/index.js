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
	mongoDbFunctions.insertDocuments(req.body, "availability_Next")
});

router.get('/output', function(req, res, next) {
  res.render('output', { });
});

router.get('/optout', function(req, res, next) {
  res.render('optout', { });
});

router.post('/optout', function(req, res, next){
	console.log(req.body);
	mongoDbFunctions.findDocuments(req.body, "schedule")
});

module.exports = router;

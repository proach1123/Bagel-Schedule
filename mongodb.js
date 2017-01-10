
//Connects to the MONGO Database

var MongoClient = require('mongodb').MongoClient, assert = require('assert');

//connection URL
var url = 'mongodb://localhost:3000/data';

var dbConnection = null;

// Use connect method to connect to the server
MongoClient.connect(url, function(err, db) {
  assert.equal(null, err);
  console.log("Connected successfully to server");
  dbConnection = db;
});

var dbFunctions = {};

//Insert documents

dbFunctions.insertDocuments = function(data, collectionName, callback) {
  console.log("Inside insertDocuments");
  console.log(data);
  // Get the documents collection
  var collection = dbConnection.collection('documents');
  // Insert some documents
  collection.insert(
    data,
    function(err, 
    result) {

    assert.equal(err, null);
    
    if(typeof callback === 'function') {
     callback(result);
   }
  });
}



//Find Documents with query filter

dbFunctions.findDocuments = function(data, collectionName, callback){
  //Get the month documents collection
  var collection = dbConnection.collection('documents');
  //Find some documents
  collection.find(data).toArray(function(err, docs) {
    assert.equal(err, null);
    console.log("Found the follwoing records");
    console.log(docs);
    if(typeof callback === 'function') {
      callback(docs);
    }
  });
}
//test

//Update a document

dbFunctions.updateDocument = function(data, collectionName, callback){
  //Get the documents collection
  var collection = dbConnection.collection('documents');
  //Updates document where a is 2, set b equal to 1
  collection.updateOne(data
    , {$set: {b : 1} }, function (err, result) {
      assert.equal(err, null);
      assert.equal(1, result.result.n);
      console.log("Updated the document with the field a equal to 2");
      if(typeof callback === 'function') {
        callback(result);
      }
    });
}


//Remove a document
dbFunctions.removeDocument = function(data, collectName, callback) {
  //Get the documents collection
  var collection = dbConnection.collection('documents');
  //Insert some documents
  collection.deleteOne(data, function (err, result) {
    assert.equal(err, null);
    assert.equal(1, result.result.n);
    console.log("Removed the document with the field a equal to 3");
    if(typeof callback === 'function') {
      callback(result);
    }
  });
}

module.exports = dbFunctions;
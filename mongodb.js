
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
  // Get the documents collection
  var collection = dbConnection.collection(collectionName);
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
  var collection = dbConnection.collection(collectionName);
  //Find some documents
  collection.find(data).toArray(function(err, docs) {
    assert.equal(err, null);
    
    if(typeof callback === 'function') {
      callback(docs);
    }
  });
}
 

//Update a document

dbFunctions.updateDocument = function(data, collectionName, callback){
  //Get the documents collection
  var collection = dbConnection.collection(collectionName);
  //Updates document where a is 2, set b equal to 1
  console.log(data);
  collection.updateOne({ _id: data._id },
    {$set: data}, function (err, result) {
      assert.equal(err, null);
      assert.equal(1, result.result.n);
      if(typeof callback === 'function') {
        callback(result);
      }
    });
}



//Algorithm for Schedule


dbFunctions.algorithm = function(data, collectionName, callback){

//order the shifts in order of number of volunteers
  var shifts = [ { value : 'setup' }, { value : '8:30' }, { value : '9:00' }, { value : '9:30' }, { value : '10:00' }, { value : 'cleanup' } ];
  var i = 0;

  while ( i < 6 ){
    shifts[i].count = dbConnection.collection.find( { 'Available' : shifts[i].value } ).count();
    i++;
  }

  shifts.sort(function (value1, value2){
   return value1.count - value2.count;
  });

  console.log(shifts);
}

module.exports = dbFunctions;
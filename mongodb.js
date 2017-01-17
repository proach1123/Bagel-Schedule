
//Connects to the MONGO Database

var MongoClient = require('mongodb').MongoClient, assert = require('assert');
var Q = require('q');

//connection URL
var url = 'mongodb://localhost:3000';

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

//checik how queries completed try to look into promises. array of promises wait until complete

//Algorithm for Schedule


dbFunctions.algorithm = function(collectionName, callback){
  var collection = dbConnection.collection(collectionName);

//order the shifts in order of number of volunteers
  var shifts = [ { value : 'setup' }, { value : '8:30' }, { value : '9:00' }, { value : '9:30' }, { value : '10:00' }, { value : 'cleanup' } ];
  var promiseList = [];
  for(var i=0; i < shifts.length; i++) {
    promiseList[i] = Q.defer();
  }

  for ( var i=0; i<shifts.length; i++ ){
    // console.log(shifts[i]);
    // console.log("Here");
    var shift = shifts[i];
    var promise = promiseList[i];
    collection.find({ 'Available[]' : { $elemMatch : { $eq : shifts[i].value } } }).toArray(function(err, result) {
        // shift = result.length;
        console.log(shift);
        console.log(result);
        console.log(result.length);
        shift.count = result.length;
        promise.resolve();
        // shifts[i].count=result.length;
        //resolve here for each 
    });
  }

  Q.all(promiseList).done(function(value){
    // console.log(shifts);
    //when q.all is resolved
    shifts.sort(function (value1, value2){
    return value1.count - value2.count;
    });

  console.log(shifts);
  });

}

//Connects to the MONGO Database

var MongoClient = require('mongodb').MongoClient, assert = require('assert');

//connection URL
var url = 'mongodb://localhost:3000';

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
  var collection = dbConnection.collection(collectionName);
  var bulk = collection.initializeUnorderedBulkOp();
      bulk.find( { ATTU_ID: data.ATTU_ID }).upsert().replaceOne({
        Name: data.Name,
        ATTU_ID: data.ATTU_ID, 
        Available: data.Available,
      });
      bulk.execute();
  /*
  //Get the documents collection
  var collection = dbConnection.collection(collectionName);
  console.log(data);
  collection.updateOne({ _id: data._id },
    {$set: data}, function (err, result) {
      assert.equal(err, null);
      assert.equal(1, result.result.n);
      if(typeof callback === 'function') {
        callback(result);
      }
    });
*/
}

dbFunctions.aggregateDocuments = function(data, collectionName, callback){
  //Get the document collection
  var collection = dbConnection.collection(collectionName);
  collection.aggregate([
    {
      $lookup:
      {
        from: "personRecord",
        localField: "ATTU_ID",
        foreignField: "ATTU_ID",
        as: "record"
      }
    }
  ])
  var tester = collection.find({ 'lastShift' : "null" }).toArray(function(err, docs){ 
    assert.equal(err, null);

  });
  //console.log(tester);
}


//Algorithm for Schedule


dbFunctions.algorithm = function(collectionName, callback){
  var collection = dbConnection.collection(collectionName);

//order the shifts in order of number of volunteers
  var shifts = [ { value : 'setup' }, { value : '8:30' }, { value : '9:00' }, { value : '9:30' }, { value : '10:00' }, { value : 'cleanup' } ];
  
  var promiseList = [];
  for(var i=0; i < shifts.length; i++) {
    promiseList[i] = Q.defer();
  }
  
  var count = 0;
  var finalpromise =  Q.defer();
  for ( var j=0; j<shifts.length; j++ ){
    var promise=promiseList[j];
    if(j===0){
      var shift = shifts[count];
      var innerPromise = promiseList[count+1];
    
      collection.find({ 'Available[]' : { $elemMatch : { $eq : shifts[count].value } } }).toArray(function(err, result) {
         shift.count = result.length;
         //console.log(shift.count);
         count++;
         innerPromise.resolve();
      });
     
    }
    else{
    promise.promise.then(function () {
    var shift = shifts[count];
    if(count<promiseList.length-1){
    var innerPromise = promiseList[count+1];
    }
      collection.find({ 'Available[]' : { $elemMatch : { $eq : shifts[count].value } } }).toArray(function(err, result) {
         shift.count = result.length;
         count++;
         if (count<promiseList.length){
          innerPromise.resolve();
         }
         else{
          finalpromise.resolve();
         }
      });
         
     });
    }
   }
   finalpromise.promise.then(function () {
  Q.all(promiseList).done(function(value){
    shifts.sort(function (value1, value2){
    return value1.count - value2.count;
    });
    //console.log(shifts);
  });
});

}

module.exports = dbFunctions;
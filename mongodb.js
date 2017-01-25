
//Connects to the MONGO Database

var MongoClient = require('mongodb').MongoClient, assert = require('assert');
var Q = require('q');
var _ = require('lodash');

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

dbFunctions.updateDocument = function(id, date, collectionName, callback){
  var collection = dbConnection.collection(collectionName);
  collection.updateOne({ "ATTU_ID" : id},
    { $set : { "lastShift" : date } },
    function (err, res) {
      assert.equal(err, null);
      assert.equal(1, result.result.n);
      callback(res);
    });
}

//Algorithm for Schedule



dbFunctions.algorithm = function(collectionName, callback){
    var collection = dbConnection.collection(collectionName);

    var shifts = [ { value : 'setup' }, { value : '8:30' }, { value : '9:00' }, { value : '9:30' }, { value : '10:00' }, { value : 'cleanup1' }, { value: 'cleanup2'}];

    //fixes asynchronous code so all counts are found
    Promise.all(shifts.map(function(shift) {
        return new Promise(function(resolve, reject) {

            //goes to availability_Next collections and looks for number of volunteers per shift
            collection.find({ 'Available[]' : { $elemMatch : { $eq : shift.value } } }).toArray(function(err, result) {
                shift.count = result.length;
                resolve();
            });
        });

    //After fulfilling the promises of finding each count will continue on with the code

    })).then(function(results) {
        //sorts shifts based on number of volunteers
        shifts.sort(function (value1, value2){
            return value1.count - value2.count;
        });

        //sorted shifts based on number of volunteers
        console.log(shifts);
        
        //WE'RE GOOD UP

        var selectedPeopleMap = {};
        var selectPersonPromiseList = [];

        for (var i = 0; i < shifts.length; i++){
          var previousPromise = i > 0 ? selectPersonPromiseList[i-1] : new Promise(function(resolve, reject) { resolve(); });
          selectPersonPromiseList[i] = selectNextPerson(collection, shifts[i], selectedPeopleMap, previousPromise);
        }

        selectPersonPromiseList[selectPersonPromiseList.length-1].then( function (){
          dbFunctions.insertDocuments(selectedPeopleMap, "Schedule");
          date = new Date();
          console.log("id" + selectedPeopleMap.ATTU_ID);
          // dbFunctions.updateDocument(selectedPeopleMap.ATTU_ID, date, "personRecord");
        });
    });
}

function selectNextPerson(collection, shift, selectedPeopleMap, previousPromise){
  return new Promise(function(resolve, reject) {
    previousPromise.then(function() {
      collection.aggregate([
            { $lookup: {
                  from: "personRecord",
                  localField: "ATTU_ID",
                  foreignField: "ATTU_ID",
                  as: "record"
                } 
            },

            { $match : { 'Available[]' : { $elemMatch : { $eq : shift.value } }, "record.ATTU_ID": { $nin : _.map(selectedPeopleMap, 'ATTU_ID') } } },

            { $sort : { "record.lastShift" : 1 } }
              ]).toArray(function(err, docs){ 
                assert.equal(err, null);
                if (docs && docs.length){
                  selectedPeopleMap[shift.value] = { ATTU_ID : docs[0].ATTU_ID, Name: docs[0].Name };
                  resolve();

                }
              });
    });          
  });
}


module.exports = dbFunctions;
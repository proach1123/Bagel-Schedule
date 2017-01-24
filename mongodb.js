
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

dbFunctions.updateDocument = function(data, shifts, collectionName, callback){
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

dbFunctions.updateSchedule = function(data, shift, collectionName, callback){
  var collection = dbConnection.collection(collectionName);
  console.log(data);
  dbFunctions.findDocuments(data, "Schedule", function (result) {
    if (result){
      console.log(result);
    }
  });
  /*
  collection.updateOne( { ATTU_ID : data.ATTU_ID }),
    {$set: {data}}, function (err, result){
      assert.equal(err, null);
      assert.equal 1
    }*/
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

        var selectedPeopleList = [];

        var sequentially = function(shifts) {
        
        var p = Promise.resolve();

          Promise.all(shifts.map (function (){
            p=p.then( function() { return collection.aggregate([
            {
              $lookup: 
                {
                  from: "personRecord",
                  localField: "ATTU_ID",
                  foreignField: "ATTU_ID",
                  as: "record"
                } 
            },

            {
              $match : { 'Available[]' : { $elemMatch : { $eq : shifts.value } }, "record.ATTU_ID": { $nin : _.map(selectedPeopleList, 'ATTU_ID') } }
            },

            { 
              $sort : { "record.lastShift" : 1 }
            }
              ]).toArray(function(err, docs){ 
                assert.equal(err, null);
                //if documents are present then it will print the one who hasn't worked in the longest amount of time
                

              }).then(function (res) {
                console.log("results:" + res);
                if (res && res.length){
                  selectedPeopleList.push({ ATTU_ID : res[0].ATTU_ID, Name: res[0].Name });
                }
              });
            });
            return p;
          })
          )
          .then(function(){
            console.log(selectedPeopleList);
          });
        };            
      });
    }


module.exports = dbFunctions;
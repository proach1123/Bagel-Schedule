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

dbFunctions.findCollections = function(data, collectionName, callback){
  var collection = dbConnection.collection(collectionName);
  return collection;
}

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

//Cancels Schedule
dbFunctions.cancelSchedule = function(data, collectionName, callback){
  var collection = dbConnection.collection(collectionName);
  collection.updateOne({date: data.date},
    {$set: data}, function(err, result) {
      assert.equal(err, null);
      // assert.equal(1, result.result.n);
      if(typeof callback === 'function') {
        callback(result);
      }
    });
}

//Finds Date for cancel shifts

dbFunctions.findDate = function(data, collectionName, callback){
  var collection = dbConnection.collection(collectionName);
  collection.find({date: data.date}).toArray(function(err, docs){
    assert.equal(err, null);
    if(docs && docs.length){
      dbFunctions.cancelSchedule(docs[0], 'Schedule');
      console.log('running cancel shift');
    }
    else{
      console.log('You werent even scheduled');
    }
  });
}

dbFunctions.updateAvailable = function(data, collectionName, callback){
  var collection = dbConnection.collection(collectionName);

  var finder = { Name: data.Name, ATTU_ID: data.ATTU_ID }; 
  dbFunctions.deleteDocument(data.ATTU_ID, "availability_Next");
  dbFunctions.insertDocuments(data, "availability_Next");

  /*
  var updates = [];

  collection.update({ "ATTU_ID" : data.ATTU_ID, "Name" : data.Name },
    { $set: { "Available" : [] } },
    function (err, result){
      assert.equal(err, null);

      updates.push(data.Available[0]);
      console.log(updates);

      if(typeof callback === 'function') {
        callback(result);
      }
    });*/
}

dbFunctions.deleteDocument = function(data, collectionName, callback) {
  // Get the documents collection 
  var collection = dbConnection.collection(collectionName);
  // Insert some documents 
  collection.deleteOne({ ATTU_ID: data }, function(err, result) {
    assert.equal(err, null);
    
    if(typeof callback === 'function') {
      callback(result);
    }
  });
}


dbFunctions.updateRecord = function(id, date, collectionName, callback){
  var collection = dbConnection.collection(collectionName);
  collection.updateOne({ "ATTU_ID" : id},
    { $set : { "lastShift" : date } },
    function (err, res) {
      assert.equal(err, null);
      //assert.equal(1, res.res.n);
      if(typeof callback === 'function') {
        callback(res);
      }
    });
}

dbFunctions.algorithm = function(collectionName, date, callback){
    var collection = dbConnection.collection(collectionName);

    var shifts = [ { value : 'setup' }, { value : 'eightthirty' }, { value : 'nine' }, { value : 'ninethirty' }, { value : 'ten' }, { value : 'cleanup1' }, { value: 'cleanup2'}];

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
        var selectIDPromiseList = [];
        var idList = [];

        for (var i = 0; i < shifts.length; i++){
          var previousIDPromise = i > 0 ? selectIDPromiseList[i-1] : new Promise(function(resolve, reject) { resolve(); });
          selectIDPromiseList[i] = selectID(i, collection, shifts[i], idList, previousIDPromise);
          var previousPromise = i > 0 ? selectPersonPromiseList[i-1] : new Promise(function(resolve, reject) { resolve(); });
          selectPersonPromiseList[i] = selectNextPerson(i, collection, shifts[i], selectedPeopleMap, idList, date, previousPromise); 
        }

        selectPersonPromiseList[selectPersonPromiseList.length-1].then( function (){
          dbFunctions.insertDocuments(selectedPeopleMap, "Schedule");
        });
    });
}

function selectNextPerson(count, collection, shift, selectedPeopleMap, idList, date, previousPromise){
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
                  selectedPeopleMap["Date"] = date;
                  dbFunctions.updateRecord(idList[count], date, "personRecord");
                  resolve();

                }
              });
    });          
  });
}


function selectID(counter, collection, shift, idList, previousPromise){
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

            { $match : { 'Available[]' : { $elemMatch : { $eq : shift.value } }, "record.ATTU_ID": { $nin : idList } } },

            { $sort : { "record.lastShift" : 1 } }
              ]).toArray(function(err, docs){ 
                assert.equal(err, null);
                if (docs && docs.length){
                  idList[counter] = docs[0].ATTU_ID;
                  resolve();

                }
              });
    });          
  });
}


module.exports = dbFunctions;

//first attempt at algortihm


/*dbFunctions.algorithm = function(collectionName, callback){
  var collection = dbConnection.collection(collectionName);

//order the shifts in order of number of volunteers
  var shifts = [ { value : 'setup' }, { value : '8:30' }, { value : '9:00' }, { value : '9:30' }, { value : '10:00' }, { value : 'cleanup' } ];
  
  var promiseList = [];
  for(var i=0; i < shifts.length; i++) {
    promiseList[i] = Q.defer();
  }
  
  for ( var j=0; j<shifts.length; j++ ){
    var promise=promiseList[j];
    
      var shift = shifts[j];
    
      collection.find({ 'Available[]' : { $elemMatch : { $eq : shift.value } } }).toArray(function(err, result) {
         shift.count = result.length;
         promise.resolve();
      });
     
  }  
  
  console.log(promiseList);
  console.log(_.map(promiseList,'promise'));
  console.log("here1");
  Q.all(promiseList).then(function(value){
    console.log("here2");
    shifts.sort(function (value1, value2){
    return value1.count - value2.count;
    });
    console.log(shifts[0]);

  });
  

}


//second try at algorithm


dbFunctions.algorithm = function(collectionName, callback){
    var collection = dbConnection.collection(collectionName);

    var shifts = [ { value : 'setup' }, { value : '8:30' }, { value : '9:00' }, { value : '9:30' }, { value : '10:00' }, { value : 'cleanup' } ];

    Q.all(shifts.map(function(shift) {
        var promise = Q.defer();
        collection.find({ 'Available[]' : { $elemMatch : { $eq : shift.value } } }).toArray(function(err, result) {
            shift.count = result.length;
            promise.resolve();
        });
        return promise;
    })).then(function(results) {
        shifts.sort(function (value1, value2){
            return value1.count - value2.count;
        });
        console.log(shifts);
    });
    console.log(shifts[5]);
}
*/

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
      } },
     { 
      $sort : { "record.lastShift" : 1 }
     }
  ]).toArray(function(err, docs){ 
    assert.equal(err, null);
    if(docs) {
      //console.log(docs[0]);
    }
  });
}




var selectedPeopleList = [];

        function sequentiallyRun(shifts) {
          var sequence = Promise.resolve();

          shifts.forEach(function (shift){
            sequence = sequence.then( function () {
               return collection.aggregate([
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
              $match : { 'Available[]' : { $elemMatch : { $eq : shift.value } }, "record.ATTU_ID": { $nin : _.map(selectedPeopleList, 'ATTU_ID') } }
            },

            { 
              $sort : { "record.lastShift" : 1 }
            }
              ]).toArray(function(err, docs){ 
                assert.equal(err, null);
                //if documents are present then it will print the one who hasn't worked in the longest amount of time
                

              }).then(function (result) {
                if(docs && docs.length) {
                  selectedPeopleList.push({ ATTU_ID : docs[0].ATTU_ID, Name: docs[0].Name, Shift : shift.value});
                  console.log(docs[0]);
                }
              });
            });            
          })
          return sequence;
        }
        console.log(selectedPeopleList);
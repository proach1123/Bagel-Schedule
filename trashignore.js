
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
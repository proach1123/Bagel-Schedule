function Wednesdays(month,year){
	var d=new Date();
	var wedarray=[];
	d.setMonth(month);
	d.setFullYear(year);
	for(var w=1;w<30;w=w+1){
    	d.setDate(w);
		if(d.getDay()==3){
			var x=d;
        	wedarray.push(x);
        }
	}
    return wedarray;
}
console.log(Wednesdays(10,2016));
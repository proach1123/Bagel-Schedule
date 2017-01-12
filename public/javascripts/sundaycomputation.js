function Sunday(){
	var sun;
	var l;
	var d=new Date();
	var sunarray=[];
	var month=d.getMonth();
	if(month==0||month==2||month==4||month==6||month==7||month==9||month==11){
		l=31;
	}
	else if(month!=1){
		l=30;
	}
	else if(year%4==0&&year%100==0&&year%1000!=0){
		l=29;
	}
	else{
		l=28;
	}
	for(var w=1;w<=l;w=w+1){
    	d.setDate(w);
		if(d.getDay()==0){
			console.log(d);
        	sunarray.push(d.getDate());
        }
	}
    sun=sunarray[sunarray.length-2];
    return sun;
}
console.log(Sunday());
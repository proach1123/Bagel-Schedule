					var weds;
					function Wednesdays(){
						var l;
						var d=new Date();
						var m=["January","February","March","April","May","June","July","August","September","October","November","December"]
						var month=d.getMonth();
						var year=d.getFullYear();
						var wedarray=[];
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
							if(d.getDay()==3){
								console.log(d);
				        		wedarray.push(m[d.getMonth()]+' '+d.getDate()+', '+d.getFullYear());
				        	}
						}
						return wedarray;
					}
					weds=Wednesdays();
					document.getElementsByClassName("tableLabel")[0].innerHTML='Wednesday, '+weds[0];
					document.getElementsByClassName("tableLabel")[1].innerHTML='Wednesday, '+weds[1];
					document.getElementsByClassName("tableLabel")[2].innerHTML='Wednesday, '+weds[2];
					document.getElementsByClassName("tableLabel")[3].innerHTML='Wednesday, '+weds[3];
					if(weds[4]===undefined){
						document.getElementsByClassName("tableLabel")[4].innerHTML='';
						document.getElementsByClassName("table5")[0].innerHTML='';
					}
					else{
						document.getElementsByClassName("tableLabel")[4].innerHTML='Wednesday, '+weds[4];
					}
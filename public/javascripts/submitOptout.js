$(document).ready(main);

function main(){

	/*$('button[name="submitShift"]').click(function() {
		var shifts = [];
		var schedule = {};
		$.each($("input[name='shift']:checked"), function (){
			shifts.push($(this).val());
		});

		var data = { 
			Name: $("#nameOptout").val(), 
			ATTU_ID: $("#ATTUIDOptout").val()
		}; 
		$.post("/optout", data, function(){}, 'json');
	});*/
/*
	$('button[name="submitDay"]').click(function() {
		var shifts = [];
		var schedule = {};
		$.each($("input[name='shift']:checked"), function (){
			shifts.push($(this).val());
		});

		schedule []

		var data = { 
			Name: $("#name").val(), 
			ATTU_ID: $("#ATTUID").val(), 
			day: shifts
		}; 
		$.post("/optout", data, function(){}, 'json');
	});
*/
	/*$('button[name="submitShift"]').click(function() {
		var shifts = [];
		$.each($("input[name='shift']:checked"), function (){
			shifts.push($(this).val());
		});

		var data = { 
			Name: $("#name").val(), 
			ATTU_ID: $("#ATTUID").val(),
			Cancel: shifts
		}; 
		console.log(data);
		$.post("/optout", data, function(){}, 'json');
	});*/

	$('button[name="submit"]').click(function() {
		var day = [];
		$.each($("input[name='day']:checked"), function (){
			day.push($(this).val());
		});

		var data = { 
			Name: $("#name").val(), 
			ATTU_ID: $("#ATTUID").val(),
			Cancel: day
		};
		console.log(data); 
		$.post("/optout", data, function(){}, 'json');
	});
}
$(document).ready(main);

function main(){
	
	//Hides the success and fail messages HTML//
	$('.successMessage').hide();
	$('.failMessage').hide();

	//make it so that fail and success messages are things depending on if you actually input stuff//
	/*$('button[name="submit"]').click(function(){
		if ((nameUser.val() == '') || (ATTUuser.val() == '')){
			$('.failMessage').show();
			$('.successMessage').hide();
		}
		else{
			$('.failMessage').hide();
			$('.successMessage').show();
		}
	});*/

	$('button[name="submit"]').click(function() {
		var shifts = [];
		$.each($("input[name='shift']:checked"), function (){
			shifts.push($(this).val());
		});

		var available = {};
		for (var i = 0; i < 4; i++){
			available ["Day"+(i+1)] = shifts;
		}

		var data = { 
			Name: $("#name").val(), 
			ATTU_ID: $("#ATTUID").val()
		}; 
		$.post("/input", data, function(){}, 'json');
	});
/*
	$('button[name="submit"]').click(function() { 
		$('#name').val("");
		$('#ATTUID').val("");

		$('#shift1').attr('checked', false);
		$('#shift2').attr('checked', false);
		$('#shift3').attr('checked', false);
		$('#shift4').attr('checked', false);
		$('#shift5').attr('checked', false);
		$('#shift6').attr('checked', false);
		
	});

	$('button[name="clear"]').click(function() {
		$('#shift1').attr('checked', false);
		$('#shift2').attr('checked', false);
		$('#shift3').attr('checked', false);
		$('#shift4').attr('checked', false);
		$('#shift5').attr('checked', false);
		$('#shift6').attr('checked', false);
	});
*/
}
$(document).ready(main);

function main(){
	$('.stuff').hide();

	$("button[name='schedule']").click(function (){
		var data = { Stuff: $('.stuff').val() };
		$.post("/output", data, function(){}, 'json');
	});
}
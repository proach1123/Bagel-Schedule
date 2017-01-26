$(document).ready(main);

function main(){
	$("button[name='schedule']").click(function (){
		var data = { Stuff: $('.hidden').val() };
		$.post("/output", data, function(){}, 'json');
	});
}
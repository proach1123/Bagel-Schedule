$(document).ready(main);

function main(){
	$('button[name="LogIn"]').click(function() {
		var data = {
			email: $("#Email").val(),
			password: $("#password").val()
		};
		$.post("/input", data, function(){}, 'json');
	});
}
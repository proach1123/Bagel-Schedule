$(document).ready(main);

function main(){
	$('button[name="Register"]').click(function() {
		var data = {
			firstName: $("#firstName").val(),
			lastName: $("#lastName").val(),
			email: $("#email").val(),
			password: $("#password").val()
		};
		$.post("/input", data, function(){}, 'json');
	});
}
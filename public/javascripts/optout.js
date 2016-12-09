$(document).ready(main);

function main () {
	$('.cancelOption').prop("selectedIndex", 0);

	$('#shiftOptout').hide();
	$('#dayOptout').hide();
	
	$('select').on('change', function () {
		if(this.value === 'shift'){
			$('#dayOptout').hide();
			$('#shiftOptout').show();
		}
		if(this.value === 'day'){
			$('#shiftOptout').hide();
			$('#dayOptout').show();
		}
		if(this.value === ' '){
			$('#shiftOptout').hide();
			$('#dayOptout').hide();
		}
	});

}
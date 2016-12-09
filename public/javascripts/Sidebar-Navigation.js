$(document).ready(main);

function main() {
	$('#sidebar').hide();

	$('.menuLink').on('click', function(){
		$('#sidebar').slideToggle(400);
		$(this).toggleClass('activeNavigation');
	});

	$('.homeLink').on('click', function (){
		location.href = "/";
		$(this).toggleClass('activeNavigation');
	});

	$('.availabilityLink').on('click', function (){
		location.href = "/input";
		$(this).toggleClass('activeSidebar');
	});

	$('.cancelShiftLink').on('click', function (){
		location.href = "/optout";
		$(this).toggleClass('activeSidebar');
	});

	$('.scheduleLink').on('click', function (){
		location.href = "/output";
		$(this).toggleClass('activeSidebar');
	});

	$('.menuLink').mouseenter(function(){
		$(this).toggleClass('onNavigation');
	});

	$('.menuLink').mouseleave(function(){
		$(this).toggleClass('onNavigation');
	});

	$('.homeLink').mouseenter(function(){
		$(this).toggleClass('onNavigation');
	});

	$('.homeLink').mouseleave(function(){
		$(this).toggleClass('onNavigation');
	});

	$('.availabilityLink').mouseenter(function(){
		$(this).toggleClass('onSidebar');
	});

	$('.availabilityLink').mouseleave(function(){
		$(this).toggleClass('onSidebar');
	});

	$('.cancelShiftLink').mouseenter(function(){
		$(this).toggleClass('onSidebar');
	});

	$('.cancelShiftLink').mouseleave(function(){
		$(this).toggleClass('onSidebar');
	});

	$('.scheduleLink').mouseenter(function(){
		$(this).toggleClass('onSidebar');
	});

	$('.scheduleLink').mouseleave(function(){
		$(this).toggleClass('onSidebar');
	});
}
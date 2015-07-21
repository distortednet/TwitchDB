$(document).ready(function() {

	$('#list-images li img').hover(function() {
		$('#description').html($(this).next().html());
	}, function() {
		$('#description').html('');
	});

});
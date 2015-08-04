$(document).ready(function() {

	$('.searchbox').keypress(function (e) {
		if (e.which == 13) {
			var query = $('.searchbox').val();
			$('.tabledata').empty();
			$.post("/database/search", {query: query}, function(searchdata) {
				$.each(searchdata, function(index, searchvalue) {
					$('.tabledata').append('<tr><td>'+searchvalue.intro_date+'</td><td><a href="/profile/u/'+searchvalue.twitchname+'" target="_blank">View Intro</a></td><td><a href="http://www.twitch.tv/'+searchvalue.twitchname+'" target="_blank">'+searchvalue.twitchname+'</a></td><td style="width: 500px">'+searchvalue.profile_data.intro_games+'</td></tr>');
				});
			});
		return false; 
		}
	});
});

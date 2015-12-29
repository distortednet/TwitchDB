$(document).ready(function() {
	function ValidUrl(str) {
		var pattern = new RegExp('^(https?:\\/\\/)?' + // protocol
			'((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
			'((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
			'(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
			'(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
			'(\\#[-a-z\\d_]*)?$', 'i'); // fragment locator

		if(!pattern.test(str)) {
			return false;
		}else{
			return true;
		}
	}
	$('.btn-edit-profile').click(function(e) {
		e.preventDefault;
		$('.editprofile').slideDown();
	});
	/* submit intro */
	$('.btn-submit-intro').click(function(e) {
		e.preventDefault;
		var about = $('#intro-about').val();
		var channel = twitchname;
		var redditname = $('#redditname').val();
		var schedule = $('#intro-schedule').val();
		var games = $('#intro-games').val();
		var goals = $('#intro-goals').val();
		var background = $('#intro-background').val();
		if(about && channel && schedule && games && goals && background) {
			if (redditname) {
				$.ajax({
					url: "https://www.reddit.com/user/" + redditname + ".json",
					dataType: 'json',
					success: function( isredditnametrue ) {
						var redditnametrue = "True"
					},
					error: function( isredditnametrue ) {
						var redditnametrue = "False"
					}
				});
			}
			else {
				var redditnametrue = "True"
			}
			if (redditnametrue == "True") {
				$.post('/createintro/submit', {
					twitchname: channel,
					redditname: redditname,
					intro_approved: false,
					intro_rejected: false,
					profile_data: {
						intro_about: about,
						intro_channel: channel,
						intro_schedule: schedule,
						intro_games: games,
						intro_goals: goals,
						intro_background: background
					}
				}, function(data) {
					$('#step-1').slideUp(500, function() {
						$('#done').html('<h3>intro submitted and awaiting approval</h3>');
						$('#done').delay(500).slideDown(500);
					});
				});
			}
			else {
				$('#note').html('Reddit name is invalid. If you do not have a Reddit account, please leave the field blank.');
				$('#note').slideDown(300, function() {
				$(this).delay(1500).slideUp(100);
			});
			}
		}else{
			$('#note').html('All fields are required. Ensure everything is filled out!');
			$('#note').slideDown(300, function() {
				$(this).delay(1500).slideUp(100);
			});
		}
	});

});

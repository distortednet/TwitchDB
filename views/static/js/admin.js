$( document ).ready(function() {
  $('#admintable').DataTable({
    "order": [0,'desc']
  });
	/* pending review view */
$('#admintable').on('click', '.btn-submit' , function(e) {
	e.preventDefault;
	var user = $(this).data("user");
	var status = $(this).data("status");
	var type = $(this).data("type");

	switch(type) {
		case "approve":
			var isrejected = false;
		break;
		case "reject":
			var isrejected = true;
		break;
	}
	$.post( "/admin/submit", {twitchname: user, intro_approved: status, intro_rejected: isrejected}, function( data ) {
		$("#note").html(data);
		$("."+user).fadeOut(100);
	});

});

/* admin view to search user */
$(".btn-admin-search").click(function(e) {
	e.preventDefault;
	var username = $(".search-twitchname").val();
	$.post( "/admin/searchuser", {twitchname: username}, function( data ) {
		if(data.error) {
			$("#note").html(data.error);
			$("#note").slideDown(300, function() {
				$(this).delay(1500).slideUp(100);
			});
		} else {
			$("#intro_approved").val(data.intro_approved);
			$("#intro_rejected").val(data.intro_rejected);
			$("#twitchname").val(data.twitchname);
			$("#redditname").val(data.redditname);
			$("#reddit_introid").val(data.intro_id);
			if(data.profile_data) {
				$("#intro_about").val(data.profile_data.intro_about);
				$("#intro_background").val(data.profile_data.intro_background);
				$("#intro_channel").val(data.profile_data.intro_channel);
				$("#intro_games").val(data.profile_data.intro_games);
				$("#intro_goals").val(data.profile_data.intro_goals);
				$("#intro_schedule").val(data.profile_data.intro_schedule);
			}

			$("#result").slideDown(1000);

		}
	});
});
$(".btn-admin-search-change").click(function(e) {
	e.preventDefault;

	var intro_approved = $("#intro_approved").val();
	var intro_rejected = $("#intro_rejected").val();
	var twitchname = $("#twitchname").val();
	var redditname = $("#redditname").val();
	var intro_id = $("#reddit_introid").val();

	if($("#intro_clearintro").is(':checked')) {
		var profile_data = null;
	} else {
		var intro_about = $("#intro_about").val();
		var intro_background = $("#intro_background").val();
		var intro_channel = $("#intro_channel").val();
		var intro_games = $("#intro_games").val();
		var intro_goals = $("#intro_goals").val();
		var intro_schedule = $("#intro_schedule").val();
		if(intro_about === null || intro_about === '') {
			profile_data = null;
		} else {
			profile_data =  {"intro_about": intro_about, "intro_background": intro_background, "intro_channel": intro_channel, "intro_games": intro_games, "intro_goals": intro_goals, "intro_schedule": intro_schedule};
		}
	}
	$.post( "/admin/submit", {"twitchname": twitchname, "redditname": redditname, "intro_approved": intro_approved, "intro_rejected": intro_rejected, "intro_id": intro_id, "profile_data": profile_data}, function( data ) {
		$("#note").html(data);
			$("#note").slideDown(300, function() {
				$(this).delay(1500).slideUp(100);
			});
	});

	$("#result").slideUp(1000);

});

});

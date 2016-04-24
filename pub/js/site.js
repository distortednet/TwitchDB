$(document).ready(function() {
  //live streams client side logic
  $('.dropdown-button').dropdown({
    inDuration: 500,
    outDuration: 500,
    hover: true,
  }
);

//functions
function inarray(value, array) {
  return array.indexOf(value) > -1;
}

function paginate(div, route, cb) {
    var scrollFunction = function(){
        if ($(window).scrollTop() + $(window).height() == $(document).height()) {
            $(window).unbind("scroll");
            totaldivs = $(div+" .livestream").size();
            $.get(route, {start: totaldivs, end: totaldivs + 12}, function(data) {
              $(window).scroll(scrollFunction);
              cb(data);
            });
        }
    };
    $(window).scroll(scrollFunction);
};

function shufflechildren(div, frompost) {
  var parent = $(div);
  if(frompost) {
    var divs = parent.children().slice(-12);
  } else {
    var divs = parent.children();
  }
  while (divs.length) {
    parent.append(divs.splice(Math.floor(Math.random() * divs.length), 1)[0]);
  }
}
// Admin client side logic
$('.admin-approve, .admin-reject').click(function(e) {
  e.preventDefault();
  var twitchname = $(this).data("user");
  var status = $(this).data("status");
  $.post("/admin/submit", {"twitchname": twitchname, "intro_status": status}, function(data) {
    $('.row-'+twitchname).fadeOut("slow");
    Materialize.toast(data, 3000, 'rounded')
  });
});
$('.admin-feedback-approve, .admin-feedback-reject').click(function(e) {
  e.preventDefault();
  var touser = $(this).data('touser');
  var uuid = $(this).data('uuid');
  var feedbackstatus = $(this).data('status');
  $.post("/admin/submit/feedback", {"twitchname": touser, "uuid": uuid, "status": feedbackstatus}, function(data) {
    $('.row-'+uuid).fadeOut("slow");
    Materialize.toast(data, 3000, 'rounded')
  });
});

$('.admin-submit-search').click(function(e) {
  e.preventDefault();
  var namesearch = $('#admin_search').val();
  $.post("/admin/tools", {"username": namesearch}, function(data) {
    $("#result_twitchname").val(data.twitchname);
    $("#result_redditname").val(data.redditname);
    $(".search-results").fadeIn(1500);
  });
});
$('.admin-modify-user').click(function(e) {
  e.preventDefault();
  var status = $('input[name="searchgroup"]:checked').val();
  var admin = $('input[name="setadmin"]').is(':checked');
  var twitchname = $("#result_twitchname").val();
  var redditname = $("#result_redditname").val();
  $.post("/admin/tools/update", {"twitchname": twitchname, "redditname": redditname, "intro_status": status, "admin": admin}, function(data) {
    Materialize.toast(data, 3000, 'rounded')
  });
});



//main page routing
crossroads.addRoute('/', function(id){
  $('ul.tabs').tabs('select_tab', 'top');
  $.get("/api/top", function(data) {
    $(data).hide().appendTo("#top").fadeIn(1000);
  });
  paginate("#top", "/api/top", function(res) {
    $(res).hide().appendTo("#top").fadeIn(1000);
  });
});
crossroads.addRoute('/random', function(id){
  $('ul.tabs').tabs('select_tab', 'random');
  $.get("/api/top", function(data) {
    $('#random').empty();
    $(data).hide().appendTo("#random").fadeIn(1000);
    shufflechildren("#random", false);
  });
  paginate("#random", "/api/top", function(res) {
    shufflechildren("#random", true);
    $(res).hide().appendTo("#random").fadeIn(1000);
  });
});
crossroads.addRoute('/mature', function(id){
  $('ul.tabs').tabs('select_tab', 'mature');
  $.get("/api/mature", function(data) {
    $('#mature').empty();
    $(data).hide().appendTo("#mature").fadeIn(1000);
  });
  paginate("#mature", "/api/mature", function(res) {
    $(res).hide().appendTo("#mature").fadeIn(1000);
  });
});
crossroads.addRoute('/family', function(id){
  $('ul.tabs').tabs('select_tab', 'family');
  $.get("/api/family", function(data) {
    $('#family').empty();
    $(data).hide().appendTo("#family").fadeIn(1000);
  });
  paginate("#family", "/api/family", function(res) {
    $(res).hide().appendTo("#family").fadeIn(1000);
  });
});
crossroads.addRoute('/votes', function(id){
  $('ul.tabs').tabs('select_tab', 'votes');
  $.get("/api/votes", function(data) {
    $('#votes').empty();
    $(data).hide().appendTo("#votes").fadeIn(1000);
  })
});
crossroads.addRoute('/games', function(id){
  $('ul.tabs').tabs('select_tab', 'games');
  $.get("/api/games", function(data) {
    $('#games').empty();
    $(data).hide().appendTo("#games").fadeIn(1000);
    $('.gridder').gridderExpander({
        scroll: true,
        scrollOffset: 400,
        scrollTo: "panel",                  // panel or listitem
        animationSpeed: 500,
        animationEasing: "easeInOutExpo",
        showNav: false,                      // Show Navigation
        nextText: "Next",                   // Next button text
        prevText: "Previous",               // Previous button text
        closeText: "Close",                 // Close button text
        onStart: function(e){
        },
        onContent: function(contentdiv){
          var previousdiv = $(contentdiv).prev();
          var game = $(contentdiv).prev().data('game');
          $.get("/api/games", {game: game}, function(users) {
            $(contentdiv).children().children().html(users);
            $(contentdiv).children().children().prepend('<div class="progress"><div class="indeterminate"></div></div>');
            $('.livestream').imagesLoaded().always( function( instance ) {
              $('.progress').remove();
            }).done( function( instance ) {
              $('.livestream').fadeIn(1000);
            })
          });
        },
        onClosed: function(){
            console.log("closed");
        }
    });
  });
});

crossroads.addRoute('/user/{username}', function(username){
  $('ul.tabs').tabs('select_tab', 'profile');
});
crossroads.addRoute('/user/{username}/feedback', function(username){
  $('ul.tabs').tabs('select_tab', 'feedback');
});
crossroads.addRoute('/user/{username}/feedback/view', function(username){
  $('ul.tabs').tabs('select_tab', 'feedback');
});
crossroads.addRoute('/user/{username}/edit', function(username){
  $('ul.tabs').tabs('select_tab', 'edit');
});

crossroads.addRoute('/user/{username}/vods', function(username){
  $('ul.tabs').tabs('select_tab', 'vods');
});

$('.streams-tab li a').click(function(e) {
  $(window).unbind("scroll");
  $('.livestream').hide().fadeIn(1000);
  var location = $(this).data('location')
  history.pushState(null, null, location);
  crossroads.parse(location);
});

$(".profile-tab li a").click(function(e) {
  // $('.livestream').hide().fadeIn(1000);
  var location = $(this).data('location')
  history.pushState(null, null, location);
  crossroads.parse(location);
});
//profile create/edit logic
$(".profile_edit").click(function(e) {
  e.preventDefault();
  var date = new Date();
  var profile_object = {
    twitchname: $("#profile_twitchname").val(),
    redditname: $("#profile_redditname").val(),
    intro_date: (date.getMonth() + 1) + '/' + date.getDate() + '/' + date.getFullYear(),
    intro_data: {
      intro_about: $("#profile_about").val(),
      intro_schedule: $("#profile_schedule").val(),
      intro_games: $("#profile_games").val(),
      intro_goals: $("#profile_goals").val(),
      intro_background: $("#profile_background").val(),
    },
    social: {
      facebook: $("#social_facebook").val(),
      instagram: $("#social_instagram").val(),
      youtube: $("#social_youtube").val(),
      steam: $("#social_steam").val(),
      twitter: $("#social_twitter").val(),
    }

  }
  $.post("/user/submit", profile_object, function(data) {
    Materialize.toast(data, 3000, 'rounded', function() {
      window.location.href = "/user/"+profile_object.twitchname;
    })
  });
});






//database search logic
$('#searchdb').keypress(function(e) {
  if(e.which == 13) {
    var keyvalue = $(this).val();
    $.get("/api/search", {search: keyvalue}, function(data) {
      if(data) {
        $('.searchresults').empty();
        $('.searchresults').html(data);
      } else {
        Materialize.toast("Could not find a result or not enough search info", 3000, 'rounded')
      }

    });
  }
});


//game view search filter logic
$(document).on( "keyup", "#gamefilter", function(e) {
  var keyvalue = $(this).val();
  $('.gridder-show').hide();
  var elementarray = $(".gridder-list");
  for (var i = 0; i < elementarray.length; i++) {
    var game = $(elementarray[i]).data('game');
    if (game.toLowerCase().indexOf(keyvalue.toLowerCase()) > -1) {
      $(elementarray[i]).show();
    } else {
      $(elementarray[i]).hide();
    }
  }
});

//game view poplarity filter logic
$(document).on( "click", "#popular", function(e) {
  if($(this).is(':checked')) {
    var divlist = $(".gridder");
    var sort = divlist.find('.gridder-list').sort(function(a, b) {
        return -a.getAttribute('data-popularity') - -b.getAttribute('data-popularity');
    })
    $(".gridder").html(sort);
  } else {
    var divlist = $(".gridder");
    var sort = divlist.find('.gridder-list').sort(function(a, b) {
        var compA = a.getAttribute('data-game');
        var compB = b.getAttribute('data-game');
        return (compA < compB) ? -1 : (compA > compB) ? 1 : 0;
    })
    $(".gridder").html(sort);
  }
});


//vote logic
$('.addvote').click(function(e) {
  e.preventDefault();
  var voter = $(this).data('voter');
  var votetarget = $(this).data('votetarget');
  console.log(votetarget);
  $.post("/api/vote", {twitchname: votetarget, voter: voter}, function(data) {
    Materialize.toast(data, 3000, 'rounded');
  });
})

//feedback submit logic
$('.feedback_submit').click(function(e) {
  e.preventDefault();
        var feedback = {
          data: {
            branding: $('#feedback_branding').val(),
            overlay: $('#feedback_overlay').val(),
            panels: $('#feedback_panels').val(),
            game: $('#feedback_game').val(),
            social: $('#feedback_social').val(),
            other: $('#feedback_other').val(),
            audioquality: parseInt($('#feedback_audioquality').val()),
            videoquality: parseInt($('#feedback_videoquality').val()),
            chatinteraction: parseInt($('#feedback_chatinteraction').val()),
            anonymous: $('#feedback_anonymous').is(':checked'),
          },
          touser: $('.feedback_submit').data('touser')
        }
        console.log(feedback);
      $.post("/api/feedback", feedback, function(data) {
        Materialize.toast(data, 3000, 'rounded');
      });
});

//feedback read logic
$(document).on( "click", ".feedback-modal", function(e) {
  e.preventDefault();
  var readstate = $(this).data('read');
  var modaltarget = $(this).data('modaltarget');
  var uuid = $(this).data('uuid');
  if(readstate == false) {
    $('#'+modaltarget).openModal();
    $(this).fadeOut(1000);
    $(this).clone().data('read', true).prependTo(".readcontainer").hide().fadeIn(1000);
    $.post("/api/feedback/markstatus", {'uuid': uuid, 'read': true}, function(data) {});
  } else {
    $('#'+modaltarget).openModal();
  }
});

//parse crossroads route
crossroads.parse(document.location.pathname);
// other shizz
 $('select').material_select();
$('ul.tabs').tabs();
})

$(document).ready(function() {
  //live streams client side logic
  $('.dropdown-button').dropdown({
    inDuration: 500,
    outDuration: 500,
    hover: true,
  })
  $('.modal-trigger').leanModal();

//functions
function inarray(value, array) {
  return array.indexOf(value) > -1;
}

function paginate(div, route, cb) {
    var scrollFunction = function(){
        if ($(window).scrollTop() + $(window).height() == $(document).height()) {
            $(window).unbind("scroll");
            totaldivs = $(div+" .livestream").size();
            $.get("/api/"+route, {start: totaldivs, end: totaldivs + 12}, function(data) {
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


//profile nav click logic
$('.profile-tab li a').click(function(e) {
  history.pushState(null, null, $(this).data('location'));
});

//default streams view state


//stereams view state on click
$('.streams-tab li a').click(function(e) {
  $(window).unbind("scroll");
  var location = $(this).data('location').replace('/', '');
    $('.livestream').hide().fadeIn(1000);
  switch(location) {
    case "random":
    $.get("/api/top", function(data) {
      $('#random').empty();
      $(data).hide().appendTo("#random").fadeIn(1000);
      shufflechildren("#random", false);
    });
    paginate("#random", "top", function(res) {
      shufflechildren("#random", true);
      $(res).hide().appendTo("#random").fadeIn(1000); // we need to figure out a diff shuffle method, possibly shuffling the contents of res instead of shuffling child elements
    });
    break;
    case "mature":
    $.get("/api/mature", function(data) {
      $('#mature').empty();
      $(data).hide().appendTo("#mature").fadeIn(1000);
    });
    paginate("#mature", "mature", function(res) {
      $(res).hide().appendTo("#mature").fadeIn(1000);
    });
    break;
    case "family":
    $.get("/api/family", function(data) {
      $('#family').empty();
      $(data).hide().appendTo("#family").fadeIn(1000);
    });
    paginate("#family", "family", function(res) {
      $(res).hide().appendTo("#family").fadeIn(1000);
    });
    break;
    case "votes":
      $.get("/api/votes", function(data) {
        $('#votes').empty();
        $(data).hide().appendTo("#votes").fadeIn(1000);
      })
    break;
    case "games":
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
    break;

    default:
    $.get("/api/top", function(data) {
      $('#top').empty();
      $(data).hide().appendTo("#top").fadeIn(1000);
    });
    paginate("#top", "top", function(res) {
      $(res).hide().appendTo("#top").fadeIn(1000);
    });
    break;
  }
  history.pushState(null, null, $(this).data('location'));
});

//subnav click/routing logic
switch(window.location.pathname.replace(/\/$/, "")) {
  case "/profile":
    $('ul.tabs').tabs('select_tab', 'profile_overview')
  break;
  case "/profile/edit":
    $('ul.tabs').tabs('select_tab', 'profile_edit');
  break;
  case "/profile/feedback":
    $('ul.tabs').tabs('select_tab', 'profile_feedback');
  break;
  case "/mature":
    $('ul.tabs').tabs('select_tab', 'mature');
  break;
  case "/family":
    $('ul.tabs').tabs('select_tab', 'family');
  break;
  case "/random":
    $('ul.tabs').tabs('select_tab', 'random');
  break;
  case "/votes":
    $('ul.tabs').tabs('select_tab', 'votes');
  break;
  case "/games":
    $('ul.tabs').tabs('select_tab', 'games');
  break;
  case "/votes":
    $('ul.tabs').tabs('select_tab', 'votes');
  break;
  default:
    $('ul.tabs').tabs('select_tab', 'top');
  break;
}

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
      social_media: {
        facebook: $("#social_facebook").val(),
        twitter: $("#social_twitter").val(),
        instagram: $("#social_instagram").val(),
        youtube: $("#social_youtube").val(),
        steam: $("#social_steam").val(),
        subreddit: $("#social_subreddit").val(),
      }
    }

  }
  $.post("/profile/submit", profile_object, function(data) {
    Materialize.toast(data, 3000, 'rounded', function() {
      window.location.href = "/profile/edit";
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
      $.post("/api/feedback", feedback, function(data) {
        Materialize.toast(data, 3000, 'rounded');
      });
});

//feedback read logic
$('.feedback-modal').click(function(e) {
  e.preventDefault();
  var readstate = $(this).data('read');
  var modaltarget = $(this).data('modaltarget');
  var uuid = $(this).data('uuid');
  if(readstate == false) {
    $('#'+modaltarget).openModal();
    $(this).fadeOut(1000);
    $.post("/api/feedback/markstatus", {'uuid': uuid, 'read': true}, function(data) {});
  } else {
    $('#'+modaltarget).openModal();
  }
});

// other shizz
 $('select').material_select();

})

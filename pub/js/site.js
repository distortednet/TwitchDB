$(document).ready(function() {
//functions
function inarray(value, array) {
  return array.indexOf(value) > -1;
}
function paginate(div, route, cb) {
    var scrollFunction = function(){
        if ($(window).scrollTop() + $(window).height() > $(document).height() - 100) {
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
function uniquechildren(data) {
  var old = [];
  var unique = [];
  $("#random").children().filter(function() {
    old.push($(this).data('username'));
  });
  $(data).each(function() {
    if($(this).data('username') && $.inArray($(this).data('username'), old) === -1) {
      unique.push($(this));
    }
  })
  return unique;
}
function generatehours(interval) {
  var arr = [], i, j;
  for(i=0; i<24; i++) {
    if(i < 10) {
      i = "0"+i;
    }
    arr.push(i+":00", i+":"+interval);
  }
  return arr;
}
$.fn.populate = function(type){
  var element = this;
  $(this).empty();
  switch(type) {
    case 'hours':
      var hours = generatehours(30);
      $.each(hours, function(index, hour) {
        $(element).append('<option value="'+hour+'">'+hour+'</option>');
      });
    break;
    case 'days':
      var daysarr = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      $.each(daysarr, function(index, day) {
        $(element).append('<option value="'+day+'">'+day+'</option>');
      });
    break;
  }
  return $(element);
};
function generatefields(template) {
  $(template).populate('days').appendTo('.day');
  $(template).populate('hours').appendTo('.hour-start');
  $(template).populate('hours').appendTo('.hour-end');
  $('.day select:last, .hour-start select:last, .hour-end select:last').hide().fadeIn(100);
}
function throttle(f, delay){
    var timer = null;
    return function(){
        var context = this, args = arguments;
        clearTimeout(timer);
        timer = window.setTimeout(function(){
            f.apply(context, args);
        },
        delay || 500);
    };
}
  page('/', function(ctx, next) {
    if(ctx.init) {
      $('ul.tabs').tabs('select_tab', 'top');
    } else {
      $.get("/api/top", function(data) {
        $('#top').empty();
        $(data).appendTo("#top").hide().fadeIn(1000);
      });
      paginate("#top", "/api/top", function(res) {
        $(res).appendTo("#top").fadeIn(1000);
      });
    }

  });
  page('/random', function(ctx, next) {
    if(ctx.init) {
      $('ul.tabs').tabs('select_tab', 'random');
    } else {
      $.get("/api/random", function(data) {
        $('#random').empty();
        $(data).appendTo("#random").fadeIn(1000);
      });
      paginate("#random", "/api/random", function(res) {
        var newchildren = uniquechildren(res);
        $(newchildren).each(function() {
          $(this).appendTo("#random").fadeIn(1000);
        })
      });
    }
  });
  page('/mature', function(ctx, next) {
    if(ctx.init) {
      $('ul.tabs').tabs('select_tab', 'mature');
    } else {
      $.get("/api/mature", function(data) {
        $('#mature').empty();
        $(data).appendTo("#mature").fadeIn(1000);
      });
      paginate("#mature", "/api/mature", function(res) {
        $(res).appendTo("#mature").fadeIn(1000);
      });
    }
  });
  page('/family', function(ctx, next) {
    if(ctx.init) {
      $('ul.tabs').tabs('select_tab', 'family');
    } else {
      $.get("/api/family", function(data) {
        $('#family').empty();
        $(data).appendTo("#family").fadeIn(1000);
      });
      paginate("#family", "/api/family", function(res) {
        $(res).appendTo("#family").fadeIn(1000);
      });
    }
  });
  page('/votes', function(ctx, next) {
    if(ctx.init) {
      $('ul.tabs').tabs('select_tab', 'votes');
    } else {
      $.get("/api/votes", function(data) {
        $('#votes').empty();
        $(data).appendTo("#votes").fadeIn(1000);
      })
    }
  });
  page('/games', function(ctx, next) {
    if(ctx.init) {
      $('ul.tabs').tabs('select_tab', 'games');
    } else {
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
            }
        });
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
    }
  });
  page('/user/:username', function(ctx, next) {
    var username = ctx.params.username;
    if(ctx.init) {
      $('ul.tabs').tabs('select_tab', 'profile');
    } else {
      // if( $('.schedule-display').is(':empty') ) {
      //   $.get("/api/user/"+username, function(dbres) {
      //     var clienttz = moment.tz.guess();
      //       for(var i in dbres) {
      //         var start = moment.tz("2000-01-01 "+dbres[i].start, dbres[i].timezone).clone().tz(clienttz).format('HH:ss');
      //         var end = moment.tz("2000-01-01 "+dbres[i].end, dbres[i].timezone).clone().tz(clienttz).format('HH:ss');
      //         $('.schedule-display').append(dbres[i].day + " From: " + start + " To: " + end + "<br>");
      //       }
      //   });
      // }
    }
  });
  page('/user/:username/feedback', function(ctx, next) {
    if(ctx.init) {
      $('ul.tabs').tabs('select_tab', 'feedback');
    } else {
      $('.feedback_submit').click(function(e) {
        e.preventDefault();
          var date = new Date();
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
              date: (date.getMonth() + 1) + '/' + date.getDate() + '/' + date.getFullYear(),
            },
            touser: $('.feedback_submit').data('touser')
          };
          if(feedback.data.branding.length >= 40 && feedback.data.overlay.length >= 40 && feedback.data.panels.length >= 40 && feedback.data.game.length >= 40 && feedback.data.social.length >= 40 && feedback.data.other.length >= 20) {
            $.post("/api/feedback", feedback, function(data) {
              Materialize.toast(data, 3000, 'rounded');
            });
          } else {
            Materialize.toast("minimum field lengths not met.", 3000, 'rounded');
          }
      });
    }
  });
  page('/user/:username/feedback/view', function(ctx, next) {
    if(ctx.init) {
      $('ul.tabs').tabs('select_tab', 'feedback');
    }
  });
  page('/user/:username/edit', function(ctx, next) {
    if(ctx.init) {
      $('ul.tabs').tabs('select_tab', 'edit');
    }
  });
  page('/user/:username/vods', function(ctx, next) {
    if(ctx.init) {
      $('ul.tabs').tabs('select_tab', 'vods');
    } else {
    }
  });
  page('/search', function(ctx, next) {
    $('#searchdb').keyup(throttle(function(e){
      var keyvalue = $(this).val();
        $.get("/api/search", {search: keyvalue}, function(data) {
          if(data) {
            $('.searchresults').empty();
            $('.searchresults').html(data);
          } else {
            $('.searchresults').empty();
          }
        });
    }));
  });

//app logic that is global or does not fit into routes. (at least until i figure out a better way.)

//about page logic
if ($('.aboutprofile').length != 0) {
  var aboutprofile = $('.aboutprofile');
  aboutprofile.each(function() {
    $.get("/api/about/", {twitchname: $(this).data('username')}, function(result) {
      $('.aboutprofile[data-username="'+result.twitchname+'"]').html('<img src="'+result.logo+'" alt="" class="circle responsive-img">');
    });
  });
}
//next step logic
$('.next-step').click(function(e) {
  e.preventDefault();
  if($('.profile-step-1').is(':visible')) {
    $('.next-step').text("Step 3");
    $('.profile-step-1').hide();
    $('.profile-step-2').show();
    $('.previous-step').show();
  } else if($('.profile-step-2').is(':visible')) {
    $('.next-step').text("Back to step 1");
    $('.profile-step-2').hide();
    $('.profile-step-3').show();
    $('.profile_edit').show();
  } else if($('.profile-step-3').is(':visible')) {
    $('.next-step').text("Step 2");
    $('.profile-step-3').hide();
    $('.profile-step-1').show();
  }
});
  //schedule logic
  // var template = '<select class="browser-default"></select>';
  // var twitchname = $("#profile_twitchname").val();
  // if(typeof(twitchname) != "undefined") {
  //   $.get("/api/user/"+twitchname, function(dbresult) {
  //     if(dbresult.length && dbresult.length > 1) {
  //       for(var i in dbresult) {
  //           generatefields(template);
  //           $('.day > select:eq('+i+') > option[value="'+dbresult[i].day+'"]').prop('selected', true);
  //           $('.hour-start > select:eq('+i+') > option[value="'+dbresult[i].start+'"]').prop('selected', true);
  //           $('.hour-end > select:eq('+i+') > option[value="'+dbresult[i].end+'"]').prop('selected', true);
  //       }
  //     }
  //   });
  // }
  // $('.addfield').click(function(e) {
  //   e.preventDefault();
  //   fieldcount = $('.day').children().length;
  //   if(fieldcount >= 20) {
  //      Materialize.toast('you have too many fields, pls remove a few! D:', 4000);
  //   } else {
  //     generatefields(template);
  //   }
  // });
//profile submit logic
  $('.profile_edit').click(function(e) {
    e.preventDefault();
    var date = new Date();
    var tzoffset = moment.tz.guess();
    // var schedulearr = [];
    // $.each($('.day select option:selected'), function(index, element) {
    //   var day = $(this).val();
    //   var starthour = $('.hour-start select option:selected').eq(index).val();
    //   var endhour = $('.hour-end select option:selected').eq(index).val();
    //   schedulearr.push({'day': day, 'start': starthour, 'end': endhour, 'timezone': tzoffset});
    // });
    var profile_object = {
      twitchname: $("#profile_twitchname").val(),
      redditname: $("#profile_redditname").val(),
      intro_date: (date.getMonth() + 1) + '/' + date.getDate() + '/' + date.getFullYear(),
      intro_data: {
        intro_about: $("#profile_about").val(),
        // intro_schedule: schedulearr,
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
    if(validator.matches(profile_object.redditname, /(\/)|(\\)/gi) || validator.isFQDN(profile_object.redditname) || validator.isURL(profile_object.redditname) || validator.matches(profile_object.social.facebook, /(\/)|(\\)/gi) || validator.isFQDN(profile_object.social.facebook) || validator.isURL(profile_object.social.facebook) || validator.matches(profile_object.social.instagram, /(\/)|(\\)/gi) || validator.isFQDN(profile_object.social.instagram) || validator.isURL(profile_object.social.instagram) || validator.matches(profile_object.social.youtube, /(\/)|(\\)/gi) || validator.isFQDN(profile_object.social.youtube) || validator.isURL(profile_object.social.youtube) || validator.matches(profile_object.social.steam, /(\/)|(\\)/gi) || validator.isFQDN(profile_object.social.steam) || validator.isURL(profile_object.social.steam) || validator.matches(profile_object.social.twitter, /(\/)|(\\)/gi) || validator.isFQDN(profile_object.social.twitter) || validator.isURL(profile_object.social.twitter)) {
      Materialize.toast("you cannot use a URL in social networks or reddit username fields", 3000, 'rounded')
    } else {
      $.post("/user/submit", profile_object, function(data) {
        Materialize.toast(data, 2000, 'rounded', function() {
          window.location.href = "/user/"+profile_object.twitchname;
        })
      });
    }
  })
  //remove schedule field logic
  // $('.removefield').click(function(e) {
  //   e.preventDefault();
  //   $('.day select:last, .hour-start select:last, .hour-end select:last').fadeOut(100, function() {
  //     $(this).remove();
  //   });
  // })





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
      if(data.admin) {
        $('input[name="setadmin"]').prop( "checked", true );
      }
      $('input[value="'+data.intro_status+'"]').prop( "checked", true );
      $("#result_twitchname").val(data.twitchname);
      $("#result_redditname").val(data.redditname);
      $(".search-results").show();
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


$(document).on( "click", ".feedback-modal", function(e) {
  e.preventDefault();
  var readstate = $(this).data('read');
  var modaltarget = $(this).data('modaltarget');
  var uuid = $(this).data('uuid');
  if(readstate == false) {
    $('#'+modaltarget).openModal();
    $(this).parent().parent().fadeTo('slow', 0.3);
    $(this).parent().parent().children().eq(1).html("true");
    $.post("/api/feedback/markstatus", {'uuid': uuid, 'read': true}, function(data) {});
  } else {
    $('#'+modaltarget).openModal();
  }
});

  $('.dropdown-button').dropdown({
    inDuration: 500,
    outDuration: 500,
    hover: true,
  });

  $('.streams-tab li a').click(function(e) {
    $(window).unbind("scroll");
    $('.livestream').hide().fadeIn(1000);
    var location = $(this).data('location')
    history.pushState(null, null, location);
    page(location);
  });

  $(".profile-tab li a").click(function(e) {
    var location = $(this).data('location')
    history.pushState(null, null, location);
    page(location);
  });

  $('.addvote').click(function(e) {
    e.preventDefault();
    var voter = $(this).data('voter');
    var votetarget = $(this).data('votetarget');

    $.post("/api/vote", {twitchname: votetarget, voter: voter}, function(data) {
      Materialize.toast(data, 3000, 'rounded');
      if(data != "Sorry, you have already voted!") {
        var currentcount = parseInt($('.votecount').text()) + 1;
        $('.votecount').html(currentcount);
      }
    });
  });


  page({click: false});
  $('select').material_select();
  $('ul.tabs').tabs();
  $(".button-collapse").sideNav();

});

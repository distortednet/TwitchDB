$(document).ready(function() {
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

  page('/', function(ctx, next) {
    if(ctx.init) {
      $('ul.tabs').tabs('select_tab', 'top');
    } else {
      $.get("/api/top", function(data) {
        $(data).appendTo("#top").hide().fadeIn(1000);
      });
      paginate("#top", "/api/top", function(res) {
        $(res).hide().appendTo("#top").fadeIn(1000);
      });
    }

  });
  page('/random', function(ctx, next) {
    if(ctx.init) {
      $('ul.tabs').tabs('select_tab', 'random');
    } else {
      $.get("/api/random", function(data) {
        $(data).appendTo("#random");
      });
      paginate("#random", "/api/random", function(res) {
        var newchildren = uniquechildren(res);
        $(newchildren).each(function() {
          $(this).appendTo("#random").hide().fadeIn(1000);
        })
      });
    }
    //
    // $.get("/api/top", function(data) {
    //   $('#random').empty();
    //   $(data).appendTo("#random").hide().fadeIn(1000);
    //   shufflechildren("#random", false);
    // });
    // paginate("#random", "/api/top", function(res) {
    //   shufflechildren("#random", true);
    //   $(res).hide().appendTo("#random").fadeIn(1000);
    // });
  });
  // page('/mature', function(ctx, next) {
  // });
  // page('/family', function(ctx, next) {
  // });
  // page('/votes', function(ctx, next) {
  // });
  // page('/games', function(ctx, next) {
  // });
  // page('/user/:username', function(ctx, next) {
  //   var username = ctx.params.username;
  // });
  // page('/user/:username/feedback', function(ctx, next) {
  // });
  // page('/user/:username/feedback/view', function(ctx, next) {
  // });
  // page('/user/:username/edit', function(ctx, next) {
  // });
  // page('/user/:username/vods', function(ctx, next) {
  // });
  // page('', function(ctx, next) {
  // });


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
  //
  // $(".profile-tab li a").click(function(e) {
  //   var location = $(this).data('location')
  //   history.pushState(null, null, location);
  //   // crossroads.parse(location);
  // });

  //database search logic
  $('#searchdb').keypress(function(e) {
      var keyvalue = $(this).val();
      if(keyvalue.length >= 2 || e.which == 13) {
        $.get("/api/search", {search: keyvalue}, function(data) {
          if(data) {
            $('.searchresults').empty();
            $('.searchresults').html(data);
          } else {
            $('.searchresults').empty();
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

  $(document).on( "click", ".feedback-modal", function(e) {
    e.preventDefault();
    var readstate = $(this).data('read');
    var modaltarget = $(this).data('modaltarget');
    var uuid = $(this).data('uuid');
    if(readstate == false) {
      $('#'+modaltarget).openModal();
      $(this).parent().parent().fadeTo('slow', 0.3);
      $.post("/api/feedback/markstatus", {'uuid': uuid, 'read': true}, function(data) {});
    } else {
      $('#'+modaltarget).openModal();
    }
  });










  $('select').material_select();
  $('ul.tabs').tabs();
  $(".button-collapse").sideNav();
  page();
});

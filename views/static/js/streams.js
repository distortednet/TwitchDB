$(document).ready(function() {
var totaldivs = $(".livestream").size();
var loadamount = 12;

$('.livestream:lt('+loadamount+')').show();

$(window).scroll(function() {
   if($(window).scrollTop() + $(window).height() == $(document).height()) {
       loadamount= (loadamount+7 <= totaldivs) ? loadamount+7 : totaldivs;
       $('.livestream:lt('+loadamount+')').fadeIn(1000);
   }
});
  function getdata(cb) {
    var gamelist = [];
    var viewerlist = [];
    $(".livestream").each(function() {
      var game = $(this).data("game");
      var viewers = $(this).data("viewers");
      if(gamelist.indexOf(game) === -1) { gamelist.push(game); }
      if(viewerlist.indexOf(viewers) === -1) { viewerlist.push(parseInt(viewers))}
    });
    cb({games: gamelist.sort(), viewers: viewerlist.sort(function(a,b) { return a - b; })});
  }
	function filterthis(element, type) {
		$(element).change(function() {
			var selection = $('option:selected', this).html();
			if(selection != 'All') {
				$('.livestream').fadeOut('fast').filter('.livestream[data-' + type + '="' + selection + '"]').fadeIn('slow');
			}else{
				$('.livestream').fadeIn('slow');
			}

		});
	}
  getdata(function(data) {
    $(".filter").append('Game: <select class="gamefilter" style="margin-left: 4px; margin-right: 4px;"></select>');
    $(".filter").append('Viewers: <select class="viewfilter" style="margin-left: 4px; margin-right: 4px;"></select>');
    $(".filter").append('Mature: <select class="maturefilter" style="margin-left: 4px; margin-right: 4px;"></select>');
    $(".gamefilter, .viewfilter, .maturefilter").prepend('<option value="All">All</option>');
    for(i in data.games) { $(".gamefilter").append('<option value="'+data.games[i]+'">'+data.games[i]+'</option>')}
    for(i in data.viewers) {$(".viewfilter").append('<option value="'+data.viewers[i]+'">'+data.viewers[i]+'</option>')}
    $(".maturefilter").append('<option value="true">true</option><option value="false">false</option>');
  });
  filterthis('.gamefilter', 'game');
  filterthis('.viewfilter', 'viewers');
  filterthis('.maturefilter', 'mature');
});

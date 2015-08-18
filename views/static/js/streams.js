$(document).ready(function() {
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
    $(".filter").append('<select class="gamefilter" style="margin-left: 4px; margin-right: 4px;"></select>');
    $(".filter").append('<select class="viewfilter" style="margin-left: 4px; margin-right: 4px;"></select>');
    $(".gamefilter").prepend('<option value="All">All</option>');
    $(".viewfilter").prepend('<option value="All">All</option>');
    for(i in data.games) {
      $(".gamefilter").append('<option value="'+data.games[i]+'">'+data.games[i]+'</option>');
    }
    for(i in data.viewers) {
      $(".viewfilter").append('<option value="'+data.viewers[i]+'">'+data.viewers[i]+'</option>');
    }
  });
  filterthis('.gamefilter', 'game');
  filterthis('.viewfilter', 'viewers');
});

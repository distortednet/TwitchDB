$( document ).ready(function() {
  function removedupes(element) {
    var dupes = {};
    $(element).each(function () {
      console.log(element);
        if(dupes[this.text]) {
            $(this).remove();
        } else {
            dupes[this.text] = this.value;
        }
    });
  }
  function filterthis(element, type) {
    $(element).change(function() {
      var selection = $("option:selected", this).html();
        if(selection != "All") {
          $('.livestream').fadeOut('fast').filter('.livestream[data-'+type+'="'+selection+'"]').fadeIn('slow');
        } else {
          $('.livestream').fadeIn('slow');
        }
    });
  }

  removedupes(".gamefilter > option");
  removedupes(".viewfilter > option");
  removedupes(".videofilter > option");

  tinysort(".gamefilter option");
  tinysort(".viewfilter > option");
  tinysort(".videofilter > option");

  filterthis(".gamefilter", "game");
  filterthis(".viewfilter", "viewers");
  filterthis(".videofilter", "video");


});

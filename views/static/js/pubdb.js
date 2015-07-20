$( document ).ready(function() {
  $('#pubdb').DataTable({
    "pageLength": 25,
    "order": [0,'desc']
  });
});

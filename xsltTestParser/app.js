$(function() {
  $('#parse').on('click', function() {
    var data = parse($('#input').val());
    $('#output').empty();
    data.compareResults.forEach(function(item) {
      var el = $('<div class="result">')
        .append('<span class="toggleCurrent">toggle</span>')
        .append('<div class="fileName">' + item.name + '</div>')
        .append(compare(item.expected, item.actual));
      $('#output').append(el);
    })
  })
  $('#toggleDiff').on('click', function() {
    $('pre').toggle();
  })
  $('body').on('click', '#output .toggleCurrent', function() {
    $(this).parent().find('pre').toggle();
  })
})
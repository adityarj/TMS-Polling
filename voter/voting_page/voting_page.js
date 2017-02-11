var current_fs, next_fs, previous_fs; //fieldsets
var left, opacity, scale; //fieldset properties which we will animate
var animating; //flag to prevent quick multi-click glitches

// var baseUrl = 'http://localhost:8080/api/voter';
var baseUrl = 'http://tms-polling.herokuapp.com/api/voter';
var token = localStorage.getItem('token');

$(document).ready(function() {
  
  $.ajax({
    url: baseUrl + '/my-info?token=' + token,
    method: 'GET'
  }).done(function(res) {
    $('#name').text(res.name);
    $('#company-name').text(res.company_name);
    $('#shares').text(res.shares);
  });
  
  $.ajax({
    url: baseUrl + '/question/all?token=' + token,
    method: 'GET'
  }).done(function(res) {
    var html = res.map(function(q) {
      return '<fieldset data-id="' + q.id + '">' +
                '<h2 class="fs-title">' + q.question + '</h2>' +
                q.choices.map(function(c, i) { 
                  return '<input type="button" data-choice="' + i +'" class="choice send-message-button" value="' + c + '" />';
                }).join('') +
              '</fieldset>';
    }).join('');
    $('#checkmark').before(html);
  });

  $(".next").click(function () {

    if (animating) return false;
    animating = true;

    current_fs = $(this).parent();
    next_fs = $(this).parent().next();
    next_fs.show();
    transform_to_next();

  });
  
  $(document).on('click', '.choice', function () {
    $this = $(event.target);
    var choice= confirm("Your choice is " + $this.val());
    if (choice==true){
      $.ajax({
        url: baseUrl + '/question/' + $this.parent().data('id'),
        method: 'POST',
        data: { 
          token: token,
          choice: $this.data('choice') 
        }
      }).done(function() {
        if (animating) return false;
        animating = true;
        current_fs = $this.parent();
        next_fs = $this.parent().next();
        next_fs.show();
        transform_to_next();
      });
    }
  });
  
  $(document).on('click', 'input[name="refresh"]', drawChart);
});

function transform_to_next() {

  //hide the current fieldset with style
  current_fs.animate({opacity: 0}, {
    step: function (now, mx) {
      //as the opacity of current_fs reduces to 0 - stored in "now"
      //1. scale current_fs down to 80%
      scale = 1 - (1 - now) * 0.2;
      //2. bring next_fs from the right(50%)
      left = (now * 50) + "%";
      //3. increase opacity of next_fs to 1 as it moves in
      opacity = 1 - now;
      current_fs.css({
          'transform': 'scale(' + scale + ')',
          'position': 'absolute'
      });
      next_fs.css({'left': left, 'opacity': opacity});
    },
    duration: 800,
    complete: function () {
      current_fs.hide();
      animating = false;
    },
    //this comes from the custom easing plugin
    easing: 'easeInOutBack'
  });
}

google.charts.load('current', {'packages':['corechart']});
google.charts.setOnLoadCallback(drawChart);
function drawChart() {
  $.ajax({
    url: baseUrl + '/results?token=' + token,
    method: 'GET'
  }).done(function(res) {
    $('#charts').html('');
    res.forEach(function(c, i) {
      var html = '<h2 class="fs-title">' + c.question + '</h2>' +
                 '<div id="piechart-' + i + '"></div>';
      $('#charts').append(html);
      var votes = c.votes.reduce(function(sum, v) { 
        if (!sum[v.choice]) sum[v.choice] = 1;
        else sum[v.choice]++;
        return sum;
      }, {});
      var data = [['Choice', 'Votes']].concat(c.choices.map(function(choice) { return [choice, 0] }));
      Object.keys(votes).forEach(function(k) {
        data[parseInt(k)+1][1] = votes[k]
      });
      data = google.visualization.arrayToDataTable(data);
      var options = { backgroundColor: 'transparent' };
      var chart = new google.visualization.PieChart(document.getElementById('piechart-' + i));
      chart.draw(data);
    });
    $('#charts').append('<input type="button" name="refresh" class="action-button" value="Refresh" />');
  });
}
// var baseUrl = 'http://localhost:8080/api/voter/authenticate/login';
var baseUrl = 'http://tms-polling.herokuapp.com/api/voter/authenticate/login';

$(document).ready(function() {
	$('#LoginOTPField').mask('9999');
	$('#LoginNRICField').mask('S0000000S');
	
	$(document).on('submit', '#main_page_form', function() {
    event.preventDefault();
    $.ajax({
      url: baseUrl,
      method: 'POST',
      data: {
        nric: $('input[name="NRIC"]').val(),
        verifyCode: $('input[name="OTP"]').val()
      }
    }).done(function(res) {
      localStorage.setItem('token', res.token);
      window.location = '/voter/voting_page';
    }).fail(function(e) {
      alert(e.responseText);
    });
  });
});
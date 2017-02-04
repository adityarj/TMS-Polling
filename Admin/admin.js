$(document).ready(function() {

	var prefix = 'http://10.12.54.167:8080/api/';
	var password = 'admin';
	var username = 'password';


	$.ajax({
		url: prefix + 'admin/company/all',
		type: 'GET',
		dataType: 'json',
		data: {
			admin: 'admin',
			password: 'password'
		},
		success: function(data) {
			console.log(data);
		}
	});
	
	
})
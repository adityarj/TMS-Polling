$(document).ready(function() {

	var prefix = 'http://10.12.54.167:8080/api/';

	$.ajax({
		url: prefix + 'admin/company/all',
		type: 'GET',
		beforeSend: function (xhr) {
		    xhr.setRequestHeader ("Authorization", "Basic " + btoa('admin' + ":" + 'password'));
		},
		success: function(data) {
			console.log(data);
		}
	});
})
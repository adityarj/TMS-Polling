$(document).ready(function() {

	var prefix = 'http://10.12.54.167:8080/api/';
	var password;
	var username;


	function getData() {

		$('#adminPanel').empty();
		
		$.ajax({
		url: prefix + 'admin/company/all',
		type: 'GET',
		dataType: 'json',
		data: {
			admin: username,
			basicPassword: password
		},
		success: function(data) {
			$.each(data,function(index,value) {
				var card = '<div class="card-box"><div class="card-content"><h3 class="title">'+value.name+
								'</h3><p class="content">'+value.company+'</p></div></div></div>';

				$('#adminPanel').append(card);
			})
		}});
	}

	$('#logButton').click(function() {
		password = $('#passwordInput').val();
		username = $('#adminInput').val();

		getData();		
	});

	$('#addButton').click(function() {

		var compName = $('#companyInput').val();

		$.ajax({
			url: prefix + 'admin/company/',
			type: 'POST',
			dataType: 'json',
			data: {
				admin: username,
				basicPassword: password,
				name: compName
			},
			success: function(data) {
				console.log('success');
			}
		});

		getData();
	})
	
	
})
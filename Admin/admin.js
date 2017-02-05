$(document).ready(function() {

	var prefix = 'https://tms-polling.herokuapp.com/api/';
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

				var dropdown;

				$.ajax({
					url: prefix + 'admin/organiser/all',
					type: 'GET',
					dataType: 'json',
					async: false,
					data: {
						admin: username,
						basicPassword: password
					},
					success: function(data_org) {
						$.each(data_org,function(index,val_org) {
							if (value.id == val_org.id) {
								console.log(val_org);
								dropdown+='<li class="item">'+val_org.email+'</org>';
							}
						});
					}
				});

				var card = '<div class="card-box"><div class="card-content"><h3 class="title">'+value.name+
								'</h3><div grid><div column="11"><p class="content">'+dropdown+'</p></div></div></div>'+
								'<div class="footer">'+
								'<div grid><div column = "10"></div><div column="2">'+
								'<p>Delete an entry<button class="-error handleDelete" id="cmp'+value.id+'"><i class="fa fa-times" aria-hidden="true"></i></div>'+
								'</button></div></div></div>';
				

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
	});
	
	$(document).on('click','.handleDelete',function() {
		var id = this.id.substring(3,this.id.length );

		$.ajax({
			url: prefix + 'admin/company/'+id+'?admin='+username+'&basicPassword='+password,
			type: 'DELETE'
		}).fail(function(e) {
			console.log(e.responseText);
		});

		getData();
	});
})
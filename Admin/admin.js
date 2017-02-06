$(document).ready(function() {

	var prefix = 'https://tms-polling.herokuapp.com/api/';
	var password;
	var username;

	//Render the data after pulling from the server.
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

				var list = '<ol>';
				value.organisers.forEach(function(org) {
					list+='<h4><li><span class="tag-box emailName">'+org.email+'</span><button class="-bordered -danger delOrg" id="orgdel'+org.id+'"><i class="fa fa-times" aria-hidden="true"></i></button></li></h4>';
				})

				list+='</ol>';

				list+='<div grid><div column="11"><label for="add'+value.id+'">Add new organiser</label><input type="text" id="add'+value.id+'"placeholder="Organiser name"></input></div>'+
						'<div column="1"><button class="-success -bordered orgAdd" id="butAdd'+value.id+'"><i class="fa fa-plus" aria-hidden="true"></i></button></div></div>';				

				console.log(value);

				var card = '<div class="card-box"><div class="card-content"><h3 class="title">'+value.name+
								'</h3><div grid><div column><p class="content">'+list+'</p></div></div></div>'+
								'<div class="footer">'+
								'<div grid><div column = "11"><h4><span class="tag-box -pill -warning">ID: '+value.id+'</span></h4></div><div column="1">'+
								'<p><button class="-error handleDelete" id="cmp'+value.id+'"><i class="fa fa-times" aria-hidden="true"></i></div>'+
								'</button></div></div></div>';
				

				$('#adminPanel').append(card);
			})
		}});
	}

	//Login function
	$('#logButton').click(function() {
		password = $('#passwordInput').val();
		username = $('#adminInput').val();

		getData();		
	});

	//Add a new company
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


	//Add a new organiser
	$(document).on('click','.orgAdd',function() {
		var id = this.id.substring(6,id.length);

		$.ajax({
			url: prefix + 'admin/organiser/',
			type: 'POST',
			dataType: 'json',
			data: {
				admin: username,
				basicPassword: password,
				email: $('#add'+id).val(),
				company_id: id
			},
		})
	})

	//Delete a company
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

	//Delete an orgnaiser
	$(document).on('click','.delOrg',function() {
		var id = this.id.substring(6,this.id.length);

		$.ajax({
			url: prefix + 'admin/organiser'+id+'admin='+username+'&basicPassword='+password,
			type: 'DELETE'
		}).fail(function(e) {
			console.log(e.responseText);
		});
	});


})
$(function(){
	
	var sb = '';
	var error = '';
	
	$("#tabs").tabs();
	
	
	
	//LOAD MIXES TAB
	var mixesCounter = 0;
	var publishedCounter = 0;
	var someMixId;
	var mixesLoaded = new Array();
	$.ajax({
		type: "POST",
		url: "getMixesList.php",
		data:  "randNum=" + new Date().getTime(),
		dataType: "xml",
		success: function(xml) {
			sb = "<b><p id='mixesTotal'></p></b>";
			sb += "<table id='MixesTable' border='0'><tr><td class='mixIdTD'><b>Mix Id</b></td><td class='mixNameTD'><b>Mix Name</b></td><td class='mixOwnerTD'><b>Owner</b></td><td class='mixPublishedTD'><b>Published</b></td><td id='mixLoadedTD'><b>Loaded</b></td></tr>";
			testcounter = 0;
			$(xml).find("header").each(function() {
				sb += "<tr><td class='mixListTD'>" + $(this).find("mixid").text() + "</td><td class='mixListTD'>" + $(this).find("mixname").text() + "</td><td class='mixListTD'>" + $(this).find("owner").text() + "</td><td class='mixListTD'>" + $(this).find("published").text() + "</td><td class='mixListTD'>" + $(this).find("mixesLoaded").text() + "</td></tr>";
				mixesCounter = mixesCounter + 1;
				if ($(this).find("published").text() == 'yes') {
					publishedCounter = publishedCounter + 1;
				}
			});
			sb += '</table>';
			if (mixesCounter == 0) {
				error = $(xml).find("error").text();
				if (error != '') {
					sb = "<img src='images/loader.gif'/>";
				}
				else {
					sb = 'There are no mixes';
				}
			}
			$('#tabs-Mixes').html(sb);
			if (mixesCounter > 0) {
				$('#mixesTotal').html("Total: " + mixesCounter + " | Published: " + publishedCounter);
			}
		}
	});
	//LOAD MIXES TAB
	
	
	
	//LOAD USERS TAB
	var usersCounter = 0;
	$.ajax({
		type: "POST",
		url: "getUsersList.php",
		data:  "randNum=" + new Date().getTime(),
		dataType: "xml",
		success: function(xml) {
			sb = "<b><p id='usersTotal'></p></b>";
			sb += "<table><tr><td class='userListTD'><b>User Id</b></td><td class='userListTD'><b>Email</b></td></tr>";
			$(xml).find("header").each(function() {
				sb += "<tr><td class='userListTD'>" + $(this).find("userid").text() + "</td><td class='userListTD'>" + $(this).find("email").text() + "</td></tr>";
				usersCounter = usersCounter + 1;
			});
			sb += '</table>';
			if (usersCounter == 0) {
				error = $(xml).find("error").text();
				if (error != '') {
					sb = "<img src='images/loader.gif'/>";
				}
				else {
					sb = 'There are no mixes';
				}
			}
			$('#tabs-Users').html(sb);
			if (usersCounter > 0) {
				$('#usersTotal').html("Total: " + usersCounter);
			}
		}
	});
	//LOAD USERS TAB
	
	
	
	//LOAD ERROR LOG TAB
	var errorCounter = 0;
	$.ajax({
		type: "POST",
		url: "getExceptions.php",
		data:  "randNum=" + new Date().getTime(),
		dataType: "xml",
		success: function(xml) {
			sb = "<table><tr><td class='userListTD'><b>File Name</b></td><td class='userListMTD'><b>Description</b></td><td class='userListDTTD'><b>DateTime</b></td></tr>";
			$(xml).find("header").each(function() {
				sb += "<tr><td class='userListTD'>" + $(this).find("filename").text() + "</td><td class='userListMTD'>" + $(this).find("description").text() + "</td><td class='userListDTTD'>" + $(this).find("datetime").text() + "</td></tr>";
				errorCounter = errorCounter + 1;
			});
			sb += '</table>';
			if (errorCounter == 0) {
				error = $(xml).find("error").text();
				if (error != '') {
					sb = "<img src='images/loader.gif'/>";
				}
				else {
					sb = 'There are no errors';
				}
			}
			$('#tabs-Exceptions').html(sb);
		}
	});
	//LOAD ERROR LOG TAB
	
	
	
	
	//LOAD NEWS TAB
	$.ajax({
		method: "POST",
		url: "../masterPage/GetNews.php",
		data:  "randNum=" + new Date().getTime(),
		dataType: "xml",
		success: function(xml) {
			getNews(xml);
		}
	});
	
	$('#submitPost').live("click", function(e) {
		var newsTitle = $('#newsTitle').val();
		var newsMessage = $('#newsMessage').val();
		loader('news');
		$.ajax({
			type: "POST",
			url: "AddNews.php",
			data: "title=" + newsTitle + "&message=" + newsMessage,
			success: function(html){
				$.ajax({
					method: "POST",
					url: "../masterPage/GetNews.php",
					data:  "randNum=" + new Date().getTime(),
					dataType: "xml",
					success: function(xml) {
						getNews(xml);
					}
				});
			}
		});
	});
	
	function getNews(xml) {
		sb = "<table id='news'>";
		$(xml).find("header").each(function() {
			sb += "<tr><td class='newsIdtd'>" + $(this).find("newsid").text() + "</td>";
			sb += "<td><table class='newsPostTable'>";
			sb += "<tr><td class='newsTitletd'>" + $(this).find("title").text() + "</td><td class='newsTimetd'>" + $(this).find("datetime").text().substr(0,10) + "</td></tr>";
			sb += "<tr><td class='newsMessagetd' colspan='2'>" + $(this).find("message").text() + "</td></tr>";
			sb += "</table></td>";
			sb += "<td class='editNewsPosttd'><button class='editNewsPost'>Edit</button></td>";
			sb += "<td class='deleteNewsPosttd'><button class='deleteNewsPost'>Delete</button></td>";
			sb += "</tr>";
		});
		sb += "</table>";
		sb += "<table>";
		sb += "<tr><td>Title: </td><td><input id='newsTitle' type='text' maxlength='20' col='20'/></td></tr>";
		sb += "<tr><td id='messageLabeltd'>Message: </td><td><textarea id='newsMessage' type='text' maxlength='1000' cols='40' rows='4'></textarea></td></tr>";
		sb += "<tr><td><button id='submitPost'>Submit</button></td></tr>";
		sb += "</table>";
		
		$('#tabs-News').html(sb);
		$("#submitPost").button();
		setEditButton();
		$(".editNewsPost").button();
		$(".deleteNewsPost").button();
	}
	
	function setEditButton() {
		$('.editNewsPost').click(function() {
			sb = "<td class='editIdtd'><span>" + $(this).parent().parent().children().html() + "</span><span>" + $(this).parent().prev().children().children().children().children().html() + "</span><span>" + $(this).parent().prev().children().children().children().next().children().html() + "</span></td>";
			sb += "<td><table class='editPostTable'>";
			sb += "<tr><td class='editTitletd'><input type='text' value='" + $(this).parent().prev().children().children().children().children().html().replace("'", "&#39;") + "'/></td><td class='editTimetd'>" + $(this).parent().prev().children().children().children().children().next().html() + "</td></tr>";
			sb += "<tr><td class='editMessagetd' colspan='2'><textarea class='editMessage' maxlength='1000' cols='68' rows='2'>" + $(this).parent().prev().children().children().children().next().children().html() + "</textarea></td></tr>";
			sb += "</table></td>";
			sb += "<td class='saveNewsPosttd'><button class='saveNewsPost'>Save</button></td>";
			sb += "<td class='cancelNewsPosttd'><button class='cancelNewsPost'>Cancel</button></td>";
			$(this).parent().parent().html(sb);
			$(".cancelNewsPost").button();
			setCancelButton();
			$(".saveNewsPost").button();
		});
	}
	
	function setCancelButton() {
		$('.cancelNewsPost').click(function() {
			sb = "<td class='newsIdtd'>" + $(this).parent().prev().prev().prev().children().html() + "</td>";
			sb += "<td><table class='newsPostTable'>";
			sb += "<tr><td class='newsTitletd'>" + $(this).parent().prev().prev().prev().children().next().html() + "</td><td class='newsTimetd'>" + $(this).parent().prev().prev().children().children().children().children().next().html() + "</td></tr>";
			sb += "<tr><td class='newsMessagetd' colspan='2'>" +  $(this).parent().prev().prev().prev().children().next().next().html() + "</td></tr>";
			sb += "</table></td>";
			sb += "<td class='editNewsPosttd'><button class='editNewsPost'>Edit</button></td>";
			sb += "<td class='deleteNewsPosttd'><button class='deleteNewsPost'>Delete</button></td>";
			$(this).parent().parent().html(sb);
			setEditButton();
			$(".editNewsPost").button();
			$(".deleteNewsPost").button();
		});
	}
	
	
	$(".deleteNewsPost").live("click", function() {
		var r = confirm('Are you sure you want to delete this post?');
		if (r == true) {
			sb = '';
			var newsId = $(this).parent().parent().children().html();
			$(this).parent().prev().prev().html("<img src='images/loader.gif'/>");
			$(this).hide();
			$(this).parent().prev().children().hide();
			$.ajax({
				context: this,
				type: "POST",
				url: "deleteNewsPost.php",
				data: "newsid=" + newsId,
				dataType: "xml",
				success: function(xml){
					$(xml).find("header").each(function() {
						if ($(this).find("newsid").text() == newsId) {
							sb = "Delete failed.";
						}
					});
					if (sb == "Delete failed.") {
						$(this).parent().parent().html(sb);
					}
					else {
						
						$(this).parent().parent().hide();
					}
	
				}
			});
		}
	});
	
	
	
	$(".saveNewsPost").live("click", function() {
		error = '';
		var id = $(this).parent().parent().children().children().html();
		var title = $(this).parent().prev().children().children().children().children().children().val();
		var time = $(this).parent().prev().children().children().children().children().next().html();
		var message = $(this).parent().prev().children().children().children().next().children().children().val();
		$(this).parent().prev().html("<img src='images/loader.gif'/>");
		$(this).hide();
		$(this).parent().next().children().hide();
		$.ajax({
			context: this,
			type: "POST",
			url: "updateNewsPost.php",
			data: "id=" + id + "&title=" + title + "&message=" + message,
			dataType: "xml",
			success: function(xml){
				$(xml).find("header").each(function() {
					error = $(xml).find("error").text();
					if (error != '') {
						sb = error;
					}
					else {
						if ($(this).find("title").text() == title && $(this).find("message").text() == message && $(this).find("newsid").text() == id) {
							sb = "<td class='newsIdtd'>" + id + "</td>";
							sb += "<td><table class='newsPostTable'>";
							sb += "<tr><td class='newsTitletd'>" + title + "</td><td class='newsTimetd'>" + time + "</td></tr>";
							sb += "<tr><td class='newsMessagetd' colspan='2'>" + message + "</td></tr>";
							sb += "</table></td>";
							sb += "<td class='editNewsPosttd'><button class='editNewsPost'>Edit</button></td>";
							sb += "<td class='deleteNewsPosttd'><button class='deleteNewsPost'>Delete</button></td>";
						}
						else {
							sb = 'Error: Could not update.';
						}
					}
				});
				$(this).parent().parent().html(sb);
				setEditButton();
				$(".editNewsPost").button();
				$(".deleteNewsPost").button();
			}
		});
	});
	//LOAD NEWS TAB
	
	
	

	//LOADER
	function loader(tab) {
		switch (tab) {
			case 'news':
				$('#tabs-News').html("<img src='images/loader.gif'/>");
				break;
		}
	}
	//LOADER
	
});
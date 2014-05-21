var title;
var totSongs;
var user;
var password;
var chkbox;
var chkboxvalue;
var mixLoaded = 0;
var newScreen = 0;
var loadMixClicked = 0;
var songPaused = 0;
var songBuffering = 0;
var mixStarted = 0;
var titleMix;
var mixId = '';
var currentPage;
var contentBox;
var chkUser;
var chkPass;
var query_string = window.location.search.substring(1);
var query_pair = query_string.split('=');
var mobileViewerMessageFlag = 0;

//GOOGLE ANALYTICS
(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
})(window,document,'script','//www.google-analytics.com/analytics.js','ga');

ga('create', 'UA-51145940-1', 'you-mix.com');
ga('send', 'pageview');
//GOOGLE ANALYTICS

$(document).ready(function() {

	function close_toggle() {
	   if ($(window).width() <= 768) {
	      $('.closeonclick').on('click', function(){
	      	$(".navbar-toggle").click();	
	      });
	   }
	   else {
	     $('.closeonclick').off('click');
	   }
	}
	close_toggle();

	$(window).resize(close_toggle);
	
	if (query_pair[0] != 'mixid') {
		loadPlayPage();
	}
	    
	//SIGNUP	
	$('#signupSubmit').live("click", function(e) {
		e.preventDefault();
		if (document.getElementById("agree").checked == true) {
			var signupEmail = $('#signupEmail').val();
			var signupPassword = $('#signupPass1').val();
			var signupPassword2 = $('#signupPass2').val();
			if (isEmailAddress(signupEmail) == signupEmail) {
				if (signupPassword == signupPassword2) {
					if (signupPassword.length >= 6) {
						$.ajax({
							type: "POST",
							url: "base/Login/SignUp.php",
							data: "email=" + signupEmail + "&password=" + signupPassword + "&password2=" + signupPassword2,
							success: function(html){
								if (html == "An account with that email already exits.") {
									$('#signupMessage').hide();
									$('#signupMessage').html(html);
									$('#signupMessage').show('slow');
								}
								
								else {
									$('#signupPage').hide();
									$('#signupPage').html(html);
									$('#signupPage').fadeIn('slow');
								}
							}
						});
					}
					else {
						$('#signupMessage').hide();
						$('#signupMessage').html('Password must be atleast 6 characters');
						$('#signupMessage').show('slow');
					}
					
				}
				else {
					$('#signupMessage').hide();
					$('#signupMessage').html("Passwords don't match");
					$('#signupMessage').show('slow');
				}
			}
			else {
				$('#signupMessage').hide();
				$('#signupMessage').html("Email is not in correct format");
				$('#signupMessage').show('slow');
			}
		}
		else {
			alert("You must agree to the terms and conditions to make an account");
		}
	});
	//SIGNUP
	
	//MENU
	function mainmenu(){
		$(" #nav li").hover(function(){
			$(this).find('ul:first').css({visibility: "visible",display: "none"}).show(400);
		},function(){
			$(this).find('ul:first').css({visibility: "hidden"});
		});
	}
	
	$(".menupage").live("click", function(e) {
		e.preventDefault();
		var menuItem = $(this).html();
		if (menuItem == 'Create Mix' && user == '') {
			$('#screenWrapper').hide();
	        newScreen = 1;
	        mixStarted = 0;
	        hideScreen();
			currentPage = menuItem;
			$('#other').html('You must login to use this function').hide().show('slow');
		}
		else if (menuItem == 'Update Mix' && user == '') {
			$('#screenWrapper').hide();
	        newScreen = 1;
	        mixStarted = 0;
	        hideScreen();
			currentPage = menuItem;
			$('#other').html('You must login to use this function').hide().show('slow');
		}
		else if (menuItem == 'My Mixes' && user == '') {
			$('#screenWrapper').hide();
	        newScreen = 1;
	        mixStarted = 0;
	        hideScreen();
			currentPage = menuItem;
			$('#other').html('You must login to use this function').hide().show('slow');
		}
		else if (menuItem == 'Sign Up') {
			$('#signup').live("click", function(e) {
				e.preventDefault();
				if (currentPage != 'signup') {
					currentPage = 'signup';
					hideScreen();
				    newScreen = 1;
				    mixStarted = 0;
					$('#other').hide();
					$('#content').hide();
					$('#signupPage').load('base/Login/SignUp.html', function() {
						$('#loadTerms').load('base/Login/termsForSignup.html');
						$('#signupPage').fadeIn('slow');
					});
				}
			});
		}
		else {
			if (menuItem == 'Update Mix') {
				var mixNameArray = new Array();
				var mixesLoadedArray = new Array();
				if (currentPage != menuItem) {
					currentPage = menuItem;
					$('#other').hide();
					$('#screenWrapper').hide();
					$('#content').hide();
					$('#setupMix').hide();
			        newScreen = 1;
			        mixStarted = 0;
			        hideScreen();
					menuItem = menuItem.replace(/\s/g,"%20");
					$('#setupMix').load(menuItem, function() {
						$.ajax({
							method: "GET",
							url: "masterPage/GetMixes.php",
							data: "user=" + user + "&randNum=" + new Date().getTime(),
							dataType: 'xml',
			    			success: function(xml){
			    				$(xml).find("header").each(function() {
									mixNameArray.push($(this).find("mixname").text());
									mixesLoadedArray.push($(this).find("mixesLoaded").text());
								});
			    				if (mixNameArray.length == 0) {
			    					$('#setupMix').html('You have no mixes');
			    				}
			    				else {
				    				//saving alphabetical ordered array
				    				var mixNameAlpha = new Array();
			    					Array.prototype.copy=Array.prototype.slice;
			    					mixNameAlpha = mixNameArray.copy();
									mixNameAlpha.sort();
			    					
			    					var elOptNew = document.createElement('option');
			    					var elSel = document.getElementById('mixTitlesUpdate');
			    					for(a=0;a<mixNameArray.length;a++) {
			    						if (a > 0) {
			    							elOptNew = document.createElement('option');
			    						}	    						
			    						elOptNew.text =  mixNameArray[a];

				    					try {
									  		elSel.add(elOptNew, null); // standards compliant; doesn't work in IE
									  	}
									  	catch(ex) {
									    	elSel.add(elOptNew); // IE only
									  	}
				    				}
			    				}
			    				$('#setupMix').show('slow');
				    		}
				    	});
					});
				}
			} 
			else if (menuItem == 'My Mixes') {
				$('#other').html('');
				if (currentPage != menuItem) {
					var mixNameAlpha = new Array();
					var mixNameArray = new Array();
					contentBox = 'control panel';
					currentPage = menuItem;
					$('#content').html('');
					$('#content').hide();
					$('#setupMix').hide();
					$('#screenWrapper').hide();
			        newScreen = 1;
			        mixStarted = 0;
			        hideScreen();
					menuItem = menuItem.replace(/\s/g,"%20");
					var mixesLoadedArray = new Array();
					$('#content').load(menuItem, function() {
						$.ajax({
							method: "GET",
							url: "masterPage/GetMixes.php",
							data: "user=" + user + "&randNum=" + new Date().getTime(),
							dataType: 'xml',
			    			success: function(xml){
			    				$(xml).find("header").each(function() {
									mixNameArray.push($(this).find("mixname").text());
									mixesLoadedArray.push($(this).find("mixesLoaded").text());
								});

								var foundone;
								var tempMixName;
								var tempMixesLoaded;
								
								foundone = 0;
								while(foundone == 0)
								{
								  foundone = 1;
								  for(i = 0; i < mixesLoadedArray.length - 1; i++)
								  {
								    if(parseInt(mixesLoadedArray[i]) < parseInt(mixesLoadedArray[i + 1]))
								    {
										tempMixName = mixNameArray[i + 1];
										tempMixesLoaded = mixesLoadedArray[i + 1];
										mixNameArray[i + 1] = mixNameArray[i];
										mixesLoadedArray[i + 1] = mixesLoadedArray[i];
										mixNameArray[i] = tempMixName;
										mixesLoadedArray[i] = tempMixesLoaded;
										foundone = 0;
								    }
								  }
								}
			    				
			    				if (mixNameArray.length == 0) {
			    					$('#other').hide();
			    					$('#other').html('You have no mixes');
			    					$('#other').show('slow');
			    				}
			    				else {
			    					$('#content').fadeIn('slow');
			    					//$('#loadMyMix').button();
			    					
			    					//COMBO BOX
			    					/*$.widget( "ui.combobox", {
										_create: function() {
											var input,
												self = this,
												select = this.element.hide(),
												selected = select.children( ":selected" ),
												value = selected.val() ? selected.text() : "",
												wrapper = $( "<span>" )
													.addClass( "ui-combobox" )
													.insertAfter( select );
							
											input = $( "<input>" )
												.appendTo( wrapper )
												.val( value )
												.addClass( "ui-state-default" )
												.autocomplete({
													delay: 0,
													minLength: 0,
													source: function( request, response ) {
														var matcher = new RegExp( $.ui.autocomplete.escapeRegex(request.term), "i" );
														response( select.children( "option" ).map(function() {
															var text = $( this ).text();
															if ( this.value && ( !request.term || matcher.test(text) ) )
																return {
																	label: text.replace(
																		new RegExp(
																			"(?![^&;]+;)(?!<[^<>]*)(" +
																			$.ui.autocomplete.escapeRegex(request.term) +
																			")(?![^<>]*>)(?![^&;]+;)", "gi"
																		), "<strong>$1</strong>" ),
																	value: text,
																	option: this
																};
														}) );
													},
													select: function( event, ui ) {
														ui.item.option.selected = true;
														self._trigger( "selected", event, {
															item: ui.item.option
														});
													},
													change: function( event, ui ) {
														if ( !ui.item ) {
															var matcher = new RegExp( "^" + $.ui.autocomplete.escapeRegex( $(this).val() ) + "$", "i" ),
																valid = false;
															select.children( "option" ).each(function() {
																if ( $( this ).text().match( matcher ) ) {
																	this.selected = valid = true;
																	return false;
																}
															});
															if ( !valid ) {
																// remove invalid value, as it didn't match anything
																$( this ).val( "" );
																select.val( "" );
																input.data( "autocomplete" ).term = "";
																return false;
															}
														}
													}
												})
												.addClass( "ui-widget ui-widget-content ui-corner-left" );
							
											input.data( "autocomplete" )._renderItem = function( ul, item ) {
												return $( "<li></li>" )
													.data( "item.autocomplete", item )
													.append( "<a>" + item.label + "</a>" )
													.appendTo( ul );
											};
							
											$( "<a>" )
												.attr( "tabIndex", -1 )
												.attr( "title", "Show All Items" )
												.appendTo( wrapper )
												.button({
													icons: {
														primary: "ui-icon-triangle-1-s"
													},
													text: false
												})
												.removeClass( "ui-corner-all" )
												.addClass( "ui-corner-right ui-button-icon" )
												.click(function() {
													// close if already visible
													if ( input.autocomplete( "widget" ).is( ":visible" ) ) {
														input.autocomplete( "close" );
														return;
													}
							
													// work around a bug (likely same cause as #5265)
													$( this ).blur();
							
													// pass empty string as value to search for, displaying all results
													input.autocomplete( "search", "" );
													input.focus();
												});
										},
							
										destroy: function() {
											this.wrapper.remove();
											this.element.show();
											$.Widget.prototype.destroy.call( this );
										}
									});
									
									$(function() {
										$( "#mixTitlesMine" ).combobox();
									});*/
			    					//COMBO BOX
			    					
			    					//saving alphabetical ordered array
			    					Array.prototype.copy=Array.prototype.slice;
			    					mixNameAlpha = mixNameArray.copy();
									mixNameAlpha.sort();
			    					
			    					var elOptNew = document.createElement('option');
			    					var elSel = document.getElementById('mixTitlesMine');
			    					for(a=0;a<mixNameArray.length;a++) {
			    						if (a > 0) {
			    							elOptNew = document.createElement('option');
			    						}	    						
			    						elOptNew.text =  mixNameArray[a];
				    					try {
									  		elSel.add(elOptNew, null); // standards compliant; doesn't work in IE
									  	}
									  	catch(ex) {
									    	elSel.add(elOptNew); // IE only
									  	}
				    				}
				    				
				    				var radioValue = 'pop';
				    				//RADIO BUTTONS
				    				/*$('#radioSortMixes').buttonset();
				    				$("#popularityDropDown").click(function() {
				    					if (radioValue != 'pop') {
				    						radioValue = 'pop';
				    						document.getElementById('mixTitlesMine').options.length = 0;
				    						elOptNew = document.createElement('option');
					    					elSel = document.getElementById('mixTitlesMine');
					    					for(a=0;a<mixNameArray.length;a++) {
					    						if (a > 0) {
					    							elOptNew = document.createElement('option');
					    						}	    						
					    						elOptNew.text =  mixNameArray[a];
						    					try {
											  		elSel.add(elOptNew, null); // standards compliant; doesn't work in IE
											  	}
											  	catch(ex) {
											    	elSel.add(elOptNew); // IE only
											  	}
						    				}
				    					}
				    				});
				    				$("#alphabeticalDropDown").click(function() {
				    					if (radioValue != 'alpha') {
				    						radioValue = 'alpha';
				    						document.getElementById('mixTitlesMine').options.length = 0;
				    						elOptNew = document.createElement('option');
					    					elSel = document.getElementById('mixTitlesMine');
					    					for(a=0;a<mixNameAlpha.length;a++) {
					    						if (a > 0) {
					    							elOptNew = document.createElement('option');
					    						}	    						
					    						elOptNew.text =  mixNameAlpha[a];
						    					try {
											  		elSel.add(elOptNew, null); // standards compliant; doesn't work in IE
											  	}
											  	catch(ex) {
											    	elSel.add(elOptNew); // IE only
											  	}
						    				}
				    						
				    					}
				    				});*/
				    				//RADIO BUTTONS
				    				
				    				
			    				}
			    				contentMessage = $('#other').html();
		        		
					        	if (contentMessage == 'You have no mixes' || contentMessage == 'You must login to use this function')  {
					        		hideScreen();
					        		$('#content').hide();
					        		$('#screenWrapper').hide();
					        	}
					        	else {
					        		hideScreen();
					        		$('#other').hide();
					        		$('#blackScreen').removeClass('invisible');
					        		$('#screenWrapper').hide().fadeIn('slow');
					        	}
					        	
				    		}
				    	});
					});
				}
			}
			else if (menuItem == 'Choose Mix') {
				$('#other').html('');
				$('#setupMix').hide();
				if (currentPage != menuItem) {
					loadPlayPage();
				}
			}
			else if (menuItem == 'Create Mix') {
				if (currentPage != menuItem) {
					currentPage = menuItem;
					$('#screenWrapper').hide();
					$('#content').hide();
					$('#other').hide();
			        newScreen = 1;
			        mixStarted = 0;
			        hideScreen();
					menuItem = menuItem.replace(/\s/g,"%20");
					var sb = "";
					$('#setupMix').load(menuItem, function() {
						sb += "<div class='col-xs-12 songHeaders'><p id='urlHeader'>URL</p><p id='startTimeHeader'>Start Time</p></div>";
						for (x=1; x<=60; x++) {
							sb += "<div class='col-xs-12 songRow'><p>Song " + x + ": </p><input class='form-control urlClass' maxlength='45' id='song" + x + "' size='40' type='text'/><p class='timeControl'><input id='mtime" + x + "' class='mTimeInput form-control' size='1' maxlength='1' type='text'/><span>:</span><input id='stime" + x + "' class='sTimeInput form-control' size='2' maxlength='2' type='text'/><span id='validate" + x + "' class='validateField'></span></p></div>";
						}
						$('#songInputs').html(sb);
						$('#setupMix').hide().fadeIn('slow');				
					});
				}
			}
			else {
				currentPage = menuItem;
				$('#screenWrapper').hide();
				$('#setupMix').hide();
		        newScreen = 1;
		        mixStarted = 0;
		        hideScreen();
				menuItem = menuItem.replace(/\s/g,"%20");
				hideScreen();
        		$('#screenWrapper').hide();
        		$('#other').hide();
				$('#other').load(menuItem, function() {
					$('#other').fadeIn('slow');
				});
				
			}
		}
    });
	//MENU

	//LOGIN  
	function changeBlackScreenMessage() {
		if (user === '') {
			$('#blackScreen').html('<p> Welcome to YouMix.  The website that plays streamed video playlists created by YOU!</p><p>Select a published mix from the drop down or <a href="" class="linkbutton" id="signupLinkFromWelcome">Sign Up</a> and create your own.</p><p>Great tool for making Power Hour mixes.</p>');
		} else {
			$('#blackScreen').html('<p> Welcome to YouMix.  The website that plays streamed video playlists created by YOU!</p><p>Select a published mix from the drop down or create your own.</p><p>Great tool for making Power Hour mixes.</p>')
		}
	};

    var cookie = $.cookie("user");
	var user = "";
	if ((cookie == null) || (cookie == "")){
		changeBlackScreenMessage();
		$('#loginContainer').hide();
		$('#loginContainer').load('base/Login/Login.html');
		$('#loginContainer').fadeIn('slow');
		$('#userDisplay').html("");
		$('#userDisplay').hide();
		$('#loginContainerSmall').show();
		$('#logoutMenuButton').hide();
		$('.menuVisibilty').hide();
		$('.loginMenuVisibility').show();
	}
	else {
		user = $.cookie("user");
		changeBlackScreenMessage();
		$('#signup').hide();
		$('#loginContainer').hide();
		$('#loginContainer').html("<span class='loggedin'><b>Logged in as:</b> " + user + " </span><a id='logoutbutton' class='logoutLinkButton' href=''><span>Sign out</span></a>");
		$('#loginContainer').fadeIn('slow');
		$('#userDisplay').html("<span class='loggedin'><b>Logged in as:</b> " + user + " </span><a id='logoutbutton' class='logoutLinkButton' href=''><span>Sign out</span></a>");
		$('#userDisplay').show();
		$('#loginContainerSmall').hide();
		$('#logoutMenuButton').show();
		$('.menuVisibilty').show();
		$('.loginMenuVisibility').hide();
	}
		
    $('#loginbutton').live("click", function(e){
		e.preventDefault();
		chkUser = $("#user").val();
		chkPass = $("#password").val();
		chkboxvalue = $('input[type=checkbox]:checked').val();	
		if (chkboxvalue != undefined) {
			chkbox = 'checked';
		}
		else {
			chkbox = 'unchecked';
		}
		
		
		$.jCryption.getKeys("base/Login/UserManager.php?generateKeypair=true", function(receivedKeys) {
			keys = receivedKeys;
			$.jCryption.encrypt(chkPass,keys,function(encrypted) {
				var x = encrypted;
				$.ajax({
					type: "POST",
					url: "base/Login/UserManager.php",
	    			data: "user=" + chkUser + "&password=" + x,
	    			success: function(html){
	    				if (html == 'User found but password incorrect.' || html == 'User not found.') {
	    					//$('#loginButtons').html("<table><tr><td><a href='' class='loginLinkButton' id='signup'>Sign Up</a></td></tr><tr><td><a href='' class='loginLinkButton' id='loginbutton'>Login</a></td></tr></table>");
	    					$('#loginmessage').html(html);
	    					$('#loginmessageSmall').html(html);
	    					setTimeout("clearloginmessage()", 1500);
	    				}
	    				else {
	    					user = chkUser;
	    					changeBlackScreenMessage();
	    					$('#signupPage').hide();
	    					$('#signup').hide();
	    					$('#loginContainer').hide();
							$('#loginContainer').html("<div id='loggedincontainer'><span class='loggedin'><b>Logged in as:</b> " + user + " </span><a id='logoutbutton' class='logoutLinkButton' href=''><span>Sign out</span></a></div>");
							$('#userDisplay').html("<div id='loggedincontainer'><span class='loggedin'><b>Logged in as:</b> " + user + " </span><a id='logoutbutton' class='logoutLinkButton' href=''><span>Sign out</span></a></div>");
							$('#userDisplay').show();
							$('#loginContainer').fadeIn('slow');
							$('#loginContainerSmall').hide();
							$('#logoutMenuButton').show();
							$("#userSmall").val('');
							$("#passwordSmall").val('');
	    					if (chkbox == 'checked') {
	    						$.cookie('user', user, {expires: 100});
	    					}
	    					currentPage = 'loggedin';
	    					$('.menuVisibilty').show();
	    					$('.loginMenuVisibility').hide();
	    				}	
	  				}
  	 			});
			});
		});
	});

	$('#loginbuttonSmall').live("click", function(e){
		e.preventDefault();
		//$('#loginButtons').html("<img src='masterPage/loader.gif'/>");
		chkUser = $("#userSmall").val();
		chkPass = $("#passwordSmall").val();
		chkboxvalue = $('input[type=checkbox]:checked').val();	
		if (chkboxvalue != undefined) {
			chkbox = 'checked';
		}
		else {
			chkbox = 'unchecked';
		}
					
		$.jCryption.getKeys("base/Login/UserManager.php?generateKeypair=true", function(receivedKeys) {
			keys = receivedKeys;
			$.jCryption.encrypt(chkPass,keys,function(encrypted) {
				var x = encrypted;
				$.ajax({
					type: "POST",
					url: "base/Login/UserManager.php",
	    			data: "user=" + chkUser + "&password=" + x,
	    			success: function(html){
	    				if (html == 'User found but password incorrect.' || html == 'User not found.') {
	    					//$('#loginButtons').html("<table><tr><td><a href='' class='loginLinkButton' id='signup'>Sign Up</a></td></tr><tr><td><a href='' class='loginLinkButton' id='loginbutton'>Login</a></td></tr></table>");
	    					$('#loginmessageSmall').html(html);
	    					$('#loginmessage').html(html);
	    					setTimeout("clearloginmessage()", 1500);
	    				}
	    				else {
	    					user = chkUser;
	    					changeBlackScreenMessage();
	    					$(".navbar-toggle").click();
	    					$('#signupPage').hide();
	    					$('#signup').hide();
	    					$('#loginContainer').hide();
							$('#loginContainer').html("<div id='loggedincontainer'><span class='loggedin'><b>Logged in as:</b> " + user + " </span><a id='logoutbutton' class='logoutLinkButton' href=''><span>Sign out</span></a></div>");
							$('#loginContainer').show();
							$('#userDisplay').html("<div id='loggedincontainer'><span class='loggedin'><b>Logged in as:</b> " + user + " </span><a id='logoutbutton' class='logoutLinkButton' href=''><span>Sign out</span></a></div>");
							$('#userDisplay').show();
							$('#loginContainerSmall').hide();
							$('#logoutMenuButton').show();
							$("#userSmall").val('');
							$("#passwordSmall").val('');
	    					if (chkbox == 'checked') {
	    						$.cookie('user', user, {expires: 100});
	    					}
	    					currentPage = 'loggedin';
	    					$('.menuVisibilty').show();
	    					$('.loginMenuVisibility').hide();
	    				}	
	  				}
  	 			});
			});
		});
	});
	

	
	$('#logoutbutton').live("click", function(e) {
		e.preventDefault();
		$.cookie("user", null);
		user = '';
		changeBlackScreenMessage();
		$('#signup').show();
		$('#other').html('');
		$('#loginContainer').hide();
		$('#loginContainer').load('base/Login/Login.html');
		$('#loginContainer').fadeIn('slow');
		$('#userDisplay').html("");
		$('#userDisplay').hide();
		$('#loginContainerSmall').show();
		$('#logoutMenuButton').hide();
		$('.menuVisibilty').hide();
		$('.loginMenuVisibility').show();
		$('#setupMix').hide();
		if (currentPage == 'Create Mix' || currentPage == 'Update Mix' || currentPage == 'getSongs' || currentPage == 'mixDeleted') {
			window.location.href = '';
		}
	});

	$('#logoutMenuButton').live("click", function(e) {
		e.preventDefault();
		$.cookie("user", null);
		user = '';
		changeBlackScreenMessage();
		$('#signup').show();
		$('#other').html('');
		$('#loginContainer').hide();
		$('#loginContainer').load('base/Login/Login.html');
		$('#loginContainer').fadeIn('slow');
		$('#userDisplay').html("");
		$('#userDisplay').hide();
		$('#loginContainerSmall').show();
		$('#logoutMenuButton').hide();
		$('.menuVisibilty').hide();
		$('.loginMenuVisibility').show();
		$('#setupMix').hide();
		if (currentPage == 'Create Mix' || currentPage == 'Update Mix' || currentPage == 'getSongs' || currentPage == 'mixDeleted') {
			window.location.href = '';
		}
	});
	
	$('#sendPassword').live("click", function(e) {
		currentPage = 'sendPassword';
		var fEmail = $('#forgotEmail').val();
		if (isEmailAddress(fEmail) == fEmail) {
			$.ajax({
				type: "POST",
				url: "base/Login/SendPassword.php",
    			data: "email=" + fEmail,
    			success: function(html){
    				if (html == 'Account does not exist') {
    					$('#sendPasswordMessage').hide();
    					$('#sendPasswordMessage').html(html);
    					$('#sendPasswordMessage').fadeIn('slow');
    				}
    				else {
    					$('#other').hide();
    					$('#other').html(html);
    					$('#other').fadeIn('slow');
    					$('#setupMix').hide();
    				}
  				}
 			});
		}
		else {
			$('#sendPasswordMessage').hide();
			$('#sendPasswordMessage').html('Email is not in correct format');
			$('#sendPasswordMessage').fadeIn('slow');
		}
	});
	//LOGIN
	
	
	//LOAD PAGE
	function loadPlayPage() {
		var mixNameAlpha = new Array();
		var mixNameArray = new Array();
		contentBox = 'control panel';
		currentPage = "Choose Mix";
		menuItem = "Choose Mix";
		$('#content').html('');
		$('#content').hide();
		$('#screenWrapper').hide();
		$('#signupPage').hide();
        newScreen = 1;
        mixStarted = 0;
        hideScreen();
		menuItem = menuItem.replace(/\s/g,"%20");
		var mixesLoadedArray = new Array();
		$('#content').load(menuItem, function() {
			$.ajax({
				method: "GET",
				url: "masterPage/GetPublishedMixes.php",
				data:  "randNum=" + new Date().getTime(),
				dataType: 'xml',
    			success: function(xml){
    				$(xml).find("header").each(function() {
						mixNameArray.push($(this).find("mixname").text());
						mixesLoadedArray.push($(this).find("mixesLoaded").text());
					});

					var foundone;
					var tempMixName;
					var tempMixesLoaded;
					
					foundone = 0;
					while(foundone == 0)
					{
					  foundone = 1;
					  for(i = 0; i < mixesLoadedArray.length - 1; i++)
					  {
					    if(parseInt(mixesLoadedArray[i]) < parseInt(mixesLoadedArray[i + 1]))
					    {
							tempMixName = mixNameArray[i + 1];
							tempMixesLoaded = mixesLoadedArray[i + 1];
							mixNameArray[i + 1] = mixNameArray[i];
							mixesLoadedArray[i + 1] = mixesLoadedArray[i];
							mixNameArray[i] = tempMixName;
							mixesLoadedArray[i] = tempMixesLoaded;
							foundone = 0;
					    }
					  }
					}
    				
    				if (mixNameArray.length == 0) {
    					$('#other').hide();
    					$('#other').html('You have no mixes');
    					$('#other').show('slow');
    				}
    				else {
    					$('#content').fadeIn('slow');
    					//$('#loadMix').button();
    					
    					//COMBO BOX
    					/*$.widget( "ui.combobox", {
							_create: function() {
								var input,
									self = this,
									select = this.element.hide(),
									selected = select.children( ":selected" ),
									value = selected.val() ? selected.text() : "",
									wrapper = $( "<span>" )
										.addClass( "ui-combobox" )
										.insertAfter( select );
				
								input = $( "<input>" )
									.appendTo( wrapper )
									.val( value )
									.addClass( "ui-state-default" )
									.autocomplete({
										delay: 0,
										minLength: 0,
										source: function( request, response ) {
											var matcher = new RegExp( $.ui.autocomplete.escapeRegex(request.term), "i" );
											response( select.children( "option" ).map(function() {
												var text = $( this ).text();
												if ( this.value && ( !request.term || matcher.test(text) ) )
													return {
														label: text.replace(
															new RegExp(
																"(?![^&;]+;)(?!<[^<>]*)(" +
																$.ui.autocomplete.escapeRegex(request.term) +
																")(?![^<>]*>)(?![^&;]+;)", "gi"
															), "<strong>$1</strong>" ),
														value: text,
														option: this
													};
											}) );
										},
										select: function( event, ui ) {
											ui.item.option.selected = true;
											self._trigger( "selected", event, {
												item: ui.item.option
											});
										},
										change: function( event, ui ) {
											if ( !ui.item ) {
												var matcher = new RegExp( "^" + $.ui.autocomplete.escapeRegex( $(this).val() ) + "$", "i" ),
													valid = false;
												select.children( "option" ).each(function() {
													if ( $( this ).text().match( matcher ) ) {
														this.selected = valid = true;
														return false;
													}
												});
												if ( !valid ) {
													// remove invalid value, as it didn't match anything
													$( this ).val( "" );
													select.val( "" );
													input.data( "autocomplete" ).term = "";
													return false;
												}
											}
										}
									})
									.addClass( "ui-widget ui-widget-content ui-corner-left" );
				
								input.data( "autocomplete" )._renderItem = function( ul, item ) {
									return $( "<li></li>" )
										.data( "item.autocomplete", item )
										.append( "<a>" + item.label + "</a>" )
										.appendTo( ul );
								};
				
								$( "<a>" )
									.attr( "tabIndex", -1 )
									.attr( "title", "Show All Items" )
									.appendTo( wrapper )
									.button({
										icons: {
											primary: "ui-icon-triangle-1-s"
										},
										text: false
									})
									.removeClass( "ui-corner-all" )
									.addClass( "ui-corner-right ui-button-icon" )
									.click(function() {
										// close if already visible
										if ( input.autocomplete( "widget" ).is( ":visible" ) ) {
											input.autocomplete( "close" );
											return;
										}
				
										// work around a bug (likely same cause as #5265)
										$( this ).blur();
				
										// pass empty string as value to search for, displaying all results
										input.autocomplete( "search", "" );
										input.focus();
									});
							},
				
							destroy: function() {
								this.wrapper.remove();
								this.element.show();
								$.Widget.prototype.destroy.call( this );
							}
						});*/
						
						/*$(function() {
							$( "#mixTitles" ).combobox();
						});*/
    					//COMBO BOX
    					
    					//saving alphabetical ordered array
    					Array.prototype.copy=Array.prototype.slice;
    					mixNameAlpha = mixNameArray.copy();
						mixNameAlpha.sort();
    					
    					var elOptNew = document.createElement('option');
    					var elSel = document.getElementById('mixTitles');
    					for(a=0;a<mixNameArray.length;a++) {
    						if (a > 0) {
    							elOptNew = document.createElement('option');
    						}	    						
    						elOptNew.text =  mixNameArray[a];
	    					try {
						  		elSel.add(elOptNew, null); // standards compliant; doesn't work in IE
						  	}
						  	catch(ex) {
						    	elSel.add(elOptNew); // IE only
						  	}
	    				}
	    				
	    				var radioValue = 'pop';
	    				//RADIO BUTTONS
	    				/*$('#radioSortMixes').buttonset();
	    				$("#popularityDropDown").click(function() {
	    					if (radioValue != 'pop') {
	    						radioValue = 'pop';
	    						document.getElementById('mixTitles').options.length = 0;
	    						elOptNew = document.createElement('option');
		    					elSel = document.getElementById('mixTitles');
		    					for(a=0;a<mixNameArray.length;a++) {
		    						if (a > 0) {
		    							elOptNew = document.createElement('option');
		    						}	    						
		    						elOptNew.text =  mixNameArray[a];
			    					try {
								  		elSel.add(elOptNew, null); // standards compliant; doesn't work in IE
								  	}
								  	catch(ex) {
								    	elSel.add(elOptNew); // IE only
								  	}
			    				}
	    					}
	    				});
	    				$("#alphabeticalDropDown").click(function() {
	    					if (radioValue != 'alpha') {
	    						radioValue = 'alpha';
	    						document.getElementById('mixTitles').options.length = 0;
	    						elOptNew = document.createElement('option');
		    					elSel = document.getElementById('mixTitles');
		    					for(a=0;a<mixNameAlpha.length;a++) {
		    						if (a > 0) {
		    							elOptNew = document.createElement('option');
		    						}	    						
		    						elOptNew.text =  mixNameAlpha[a];
			    					try {
								  		elSel.add(elOptNew, null); // standards compliant; doesn't work in IE
								  	}
								  	catch(ex) {
								    	elSel.add(elOptNew); // IE only
								  	}
			    				}
	    						
	    					}
	    				});*/
	    				//RADIO BUTTONS
	    				
	    				
    				}
    				contentMessage = $('#other').html();
    		
		        	if (contentMessage == 'You have no mixes' || contentMessage == 'You must login to use this function')  {
		        		hideScreen();
		        		$('#content').hide();
		        		$('#screenWrapper').hide();
		        	}
		        	else {
		        		hideScreen();
		        		$('#other').hide();
		        		$('#blackScreen').removeClass('invisible');
		        		$('#screenWrapper').hide().fadeIn('slow');
		        	}
		        	
	    		}
	    	});
		});
	}			
	//LOAD PAGE
	
	
	
	//LINKS FROM WELCOME PAGE
	$('#signupLinkFromWelcome').live("click", function(e) {
		e.preventDefault();
		currentPage = 'signup';
		hideScreen();
		$('#other').hide();
		$('#content').hide();
		$('#signupPage').load('base/Login/SignUp.html', function() {
			$('#loadTerms').load('base/Login/termsForSignup.html');
			$('#signupPage').fadeIn('slow');
		});
	});
	//LINKS FROM WELCOME PAGE

	
	//CREATEMIX PAGE
	$("#createMix").live("click", function(e) {
		$('#createMix').attr("disabled", "disabled");
		if (user == '') {
			$('#createContent').html('You must be logged in to create a mix');
			$('#createMix').removeAttr("disabled");
		}
		else {
			if (document.getElementById('publishCheckBox').checked == true) {
				if (checkForSixtySongsCreate() < 10) {
					alert('You must have 10 songs to publish a mix');
					$('#createMix').removeAttr("disabled");
				}
				else {
					createMix('publish');
				}
			}
			else {
				createMix('dontPublish');
			}
		}
	});
					
	function createMix(publish) {
		var song;
		var mtime;
		var stime;
		var equalPos;
		var songx;
		var createMixTitle = $.trim($('#createMixTitle').val());
		var validMessage;
		var urlErrors;
		var isMinuteGood;
		var isSecondGood;
		var createNumberErrors;
		var createNumbersPattern = /[0-9]/g;
		var pattern = /[A-Za-z0-9-_]/g;
	
		if (createMixTitle == '') {
			alert('You must enter a title');
			$('#createMix').removeAttr("disabled");
		} else {
			if (checkMixName(createMixTitle).length != createMixTitle.length) {
				alert('Your title has some invalid characters');
				$('#createMix').removeAttr("disabled");				
			}
			else {
				var xml = "<?xml version='1.0' encoding='ISO-8859-1'?>";
				xml += "<root>";
				urlErrors = 0;
				createNumberErrors = 0;
				for (y=1;y<=60;y++) {
					mtime = $.trim($('#mtime' + y).val());
					stime = $.trim($('#stime' + y).val());
					song = $.trim($('#song' + y).val());
					if (mtime == '') {
						mtime = 0;
					}
					if (stime == '') {
						stime = 0;
					}
					if (song != '') {
						validMsg = validateSong(song);
						if (validMsg == 'invalid url') {
							$('#validate' + y).hide();
							$('#validate' + y).html(validMsg);
							$('#validate' + y).show('slow');
							urlErrors = urlErrors + 1;
						}
						else {
							startPos = validMsg.length;
							songx = song.substring(startPos, startPos + 11);
							if (songx == "" || songx == null || songx.length != 11) {
								$('#validate' + y).hide();
								$('#validate' + y).html('invalid url');
								$('#validate' + y).show('slow');
								urlErrors = urlErrors + 1;
							} else {
								if (songx.match(pattern).length == 11) {
									
									isMinuteGood = 'no';
									if (mtime == 0) {
										isMinuteGood = 'yes';
									}
									else {
										if (mtime.match(createNumbersPattern) == null) {
											isMinuteGood = 'no';
										}
										else {
											if (mtime.match(createNumbersPattern).length == mtime.length) {
												isMinuteGood = 'yes';
											}
											else {
												isMinuteGood = 'no';
											}
										}
									}
									
									
									isSecondGood = 'no';
									if (stime == 0) {
										isSecondGood = 'yes';
									}
									else {
										if (stime.match(createNumbersPattern) == null) {
										isSecondGood = 'no';
										}
										else {
											if (stime.match(createNumbersPattern).length == stime.length) {
												isSecondGood = 'yes';
											}
											else {
												isSecondGood = 'no';
											}
										}
									}
									
									
									if (isMinuteGood == 'yes' && isSecondGood == 'yes') {
										xml += "<header" + y + "><song>" + songx + "</song><mtime>" + mtime + '' + "</mtime><stime>" + stime + '' + "</stime></header" + y + ">";
										$('#validate' + y).html('');
									}
									else {
										createNumberErrors = createNumberErrors + 1;
										$('#validate' + y).html('invalid time');
									}
								}
								else {
									$('#validate' + y).hide();
									$('#validate' + y).html('id not valid'); 
									$('#validate' + y).show('slow');
									urlErrors = urlErrors + 1;
								}
							}
						}						
					}
					else {
						$('#validate' + y).html('');
					}
				}
				xml += "</root>";
				if (urlErrors == 0) {
					if (createNumberErrors == 0) {
						$.ajax({
							type: "POST",
							url: "Create%20Mix/SongManager.php",
							data: "title=" + createMixTitle + "&xml=" + xml + "&email=" + user + "&publish=" + publish,
							success: function(html) {
								if (html == 'Mix name already exists') {
									alert('Mix name already exists');
									$('#createMix').removeAttr("disabled");
								}
								else {
									$('#setupMix').hide();
									$('#setupMix').html(html);
									$('#setupMix').show('slow');
								}
							}
						});
					}
					else {
						alert('There are invalid characters entered in one or more of the time slots');
						$('#createMix').removeAttr("disabled");
					}
				}
				else {
					alert('There are some format errors with the URLs entered');
					$('#createMix').removeAttr("disabled");
				}
			}
		}
	}
	
	$("#myMixesLinkFromCreate").live("click", function(e) {
		e.preventDefault();
		$('#other').html('');
		var mixNameAlpha = new Array();
		var mixNameArray = new Array();
		contentBox = 'control panel';
		currentPage = 'My Mixes';
		$('#content').html('');
		$('#content').hide();
		$('#screenWrapper').hide();
		$('#other').hide();
		$('#setupMix').hide();
        newScreen = 1;
        mixStarted = 0;
        hideScreen();
		menuItem = "My Mixes";
		menuItem = menuItem.replace(/\s/g,"%20");
		var mixesLoadedArray = new Array();
		$('#content').load(menuItem, function() {
			$.ajax({
				method: "GET",
				url: "masterPage/GetMixes.php",
				data: "user=" + user + "&randNum=" + new Date().getTime(),
				dataType: 'xml',
    			success: function(xml){
    				$(xml).find("header").each(function() {
						mixNameArray.push($(this).find("mixname").text());
						mixesLoadedArray.push($(this).find("mixesLoaded").text());
					});

					var foundone;
					var tempMixName;
					var tempMixesLoaded;
					
					foundone = 0;
					while(foundone == 0)
					{
					  foundone = 1;
					  for(i = 0; i < mixesLoadedArray.length - 1; i++)
					  {
					    if(parseInt(mixesLoadedArray[i]) < parseInt(mixesLoadedArray[i + 1]))
					    {
							tempMixName = mixNameArray[i + 1];
							tempMixesLoaded = mixesLoadedArray[i + 1];
							mixNameArray[i + 1] = mixNameArray[i];
							mixesLoadedArray[i + 1] = mixesLoadedArray[i];
							mixNameArray[i] = tempMixName;
							mixesLoadedArray[i] = tempMixesLoaded;
							foundone = 0;
					    }
					  }
					}
    				
    				if (mixNameArray.length == 0) {
    					$('#other').hide();
    					$('#other').html('You have no mixes');
    					$('#other').show('slow');
    				}
    				else {
    					$('#content').fadeIn('slow');
    					//$('#loadMyMix').button();
    					
    					//COMBO BOX
    					/*$.widget( "ui.combobox", {
							_create: function() {
								var input,
									self = this,
									select = this.element.hide(),
									selected = select.children( ":selected" ),
									value = selected.val() ? selected.text() : "",
									wrapper = $( "<span>" )
										.addClass( "ui-combobox" )
										.insertAfter( select );
				
								input = $( "<input>" )
									.appendTo( wrapper )
									.val( value )
									.addClass( "ui-state-default" )
									.autocomplete({
										delay: 0,
										minLength: 0,
										source: function( request, response ) {
											var matcher = new RegExp( $.ui.autocomplete.escapeRegex(request.term), "i" );
											response( select.children( "option" ).map(function() {
												var text = $( this ).text();
												if ( this.value && ( !request.term || matcher.test(text) ) )
													return {
														label: text.replace(
															new RegExp(
																"(?![^&;]+;)(?!<[^<>]*)(" +
																$.ui.autocomplete.escapeRegex(request.term) +
																")(?![^<>]*>)(?![^&;]+;)", "gi"
															), "<strong>$1</strong>" ),
														value: text,
														option: this
													};
											}) );
										},
										select: function( event, ui ) {
											ui.item.option.selected = true;
											self._trigger( "selected", event, {
												item: ui.item.option
											});
										},
										change: function( event, ui ) {
											if ( !ui.item ) {
												var matcher = new RegExp( "^" + $.ui.autocomplete.escapeRegex( $(this).val() ) + "$", "i" ),
													valid = false;
												select.children( "option" ).each(function() {
													if ( $( this ).text().match( matcher ) ) {
														this.selected = valid = true;
														return false;
													}
												});
												if ( !valid ) {
													// remove invalid value, as it didn't match anything
													$( this ).val( "" );
													select.val( "" );
													input.data( "autocomplete" ).term = "";
													return false;
												}
											}
										}
									})
									.addClass( "ui-widget ui-widget-content ui-corner-left" );
				
								input.data( "autocomplete" )._renderItem = function( ul, item ) {
									return $( "<li></li>" )
										.data( "item.autocomplete", item )
										.append( "<a>" + item.label + "</a>" )
										.appendTo( ul );
								};
				
								$( "<a>" )
									.attr( "tabIndex", -1 )
									.attr( "title", "Show All Items" )
									.appendTo( wrapper )
									.button({
										icons: {
											primary: "ui-icon-triangle-1-s"
										},
										text: false
									})
									.removeClass( "ui-corner-all" )
									.addClass( "ui-corner-right ui-button-icon" )
									.click(function() {
										// close if already visible
										if ( input.autocomplete( "widget" ).is( ":visible" ) ) {
											input.autocomplete( "close" );
											return;
										}
				
										// work around a bug (likely same cause as #5265)
										$( this ).blur();
				
										// pass empty string as value to search for, displaying all results
										input.autocomplete( "search", "" );
										input.focus();
									});
							},
				
							destroy: function() {
								this.wrapper.remove();
								this.element.show();
								$.Widget.prototype.destroy.call( this );
							}
						});
						
						$(function() {
							$( "#mixTitlesMine" ).combobox();
						});*/
    					//COMBO BOX
    					
    					//saving alphabetical ordered array
    					Array.prototype.copy=Array.prototype.slice;
    					mixNameAlpha = mixNameArray.copy();
						mixNameAlpha.sort();
    					
    					var elOptNew = document.createElement('option');
    					var elSel = document.getElementById('mixTitlesMine');
    					for(a=0;a<mixNameArray.length;a++) {
    						if (a > 0) {
    							elOptNew = document.createElement('option');
    						}	    						
    						elOptNew.text =  mixNameArray[a];
	    					try {
						  		elSel.add(elOptNew, null); // standards compliant; doesn't work in IE
						  	}
						  	catch(ex) {
						    	elSel.add(elOptNew); // IE only
						  	}
	    				}
	    				
	    				var radioValue = 'pop';
	    				//RADIO BUTTONS
	    				/*$('#radioSortMixes').buttonset();
	    				$("#popularityDropDown").click(function() {
	    					if (radioValue != 'pop') {
	    						radioValue = 'pop';
	    						document.getElementById('mixTitlesMine').options.length = 0;
	    						elOptNew = document.createElement('option');
		    					elSel = document.getElementById('mixTitlesMine');
		    					for(a=0;a<mixNameArray.length;a++) {
		    						if (a > 0) {
		    							elOptNew = document.createElement('option');
		    						}	    						
		    						elOptNew.text =  mixNameArray[a];
			    					try {
								  		elSel.add(elOptNew, null); // standards compliant; doesn't work in IE
								  	}
								  	catch(ex) {
								    	elSel.add(elOptNew); // IE only
								  	}
			    				}
	    					}
	    				});
	    				$("#alphabeticalDropDown").click(function() {
	    					if (radioValue != 'alpha') {
	    						radioValue = 'alpha';
	    						document.getElementById('mixTitlesMine').options.length = 0;
	    						elOptNew = document.createElement('option');
		    					elSel = document.getElementById('mixTitlesMine');
		    					for(a=0;a<mixNameAlpha.length;a++) {
		    						if (a > 0) {
		    							elOptNew = document.createElement('option');
		    						}	    						
		    						elOptNew.text =  mixNameAlpha[a];
			    					try {
								  		elSel.add(elOptNew, null); // standards compliant; doesn't work in IE
								  	}
								  	catch(ex) {
								    	elSel.add(elOptNew); // IE only
								  	}
			    				}
	    						
	    					}
	    				});*/
	    				//RADIO BUTTONS
	    				
	    				
    				}
    				contentMessage = $('#other').html();
    		
		        	if (contentMessage == 'You have no mixes' || contentMessage == 'You must login to use this function')  {
		        		hideScreen();
		        		$('#content').hide();
		        		$('#screenWrapper').hide();
		        	}
		        	else {
		        		hideScreen();
		        		$('#other').hide();
		        		$('#screenWrapper').hide().fadeIn('slow');
		        		$('#setupMix').hide();
		        	}
		        	
	    		}
	    	});
		});
	});
	
	function checkForSixtySongsCreate() {
		var song;
		var createTotalSongs = 0;
		for (y=1;y<=60;y++) {
			song = $('#song' + y).val();
			song = $.trim(song)
			if (song != '') {
				createTotalSongs = createTotalSongs + 1;
			}
		}
		return createTotalSongs;
	}
	//CREATEMIX PAGE
	
	
	
	//UPDATEMIX PAGE
	var mixName;
	$('#getSongsForUpdate').live("click", function() {
		$('#getSongsForUpdate').attr('disabled', 'disabled');
		currentPage = 'getSongs';
		mixName = $('#mixTitlesUpdate option:selected').text();
		var songList = "";
		$.ajax({
			type: "POST",
			url: "Update%20Mix/GetSongsForUpdate.php",
			data: "mixName=" + mixName + "&user=" + user + "&randNum=" + new Date().getTime(),
			dataType: "xml",
			success: function(xml) {
				var rowCount = 1;
				var secondTime;
				var seconds;
				var minutes;

				songList += "<p id='updateInstructions'>This site only supports videos from <a href='http://www.youtube.com' target='_blank' class='linkbutton'>Youtube</a>. Load up YouTube, find a song, copy the full URL from the browser and paste it into an input field below. The url should look something like this: http://www.youtube.com/watch?v=praFGD51ih8.  Each song will play for 60 seconds before changing.</p>";
				songList += "<br/>";
				songList += "<div id='updateContent' class='col-xs-12'>";
				songList += "<h3 class='col-xs-12'>" + mixName + "</h3>"
				songList += "<div class='col-xs-12 songHeaders'><p id='urlHeader'>URL</p><p id='startTimeHeader'>Start Time</p></div>";
				$(xml).find("header").each(function() {
					seconds = $(this).find("StartTime").text() % 60;
					if ($(this).find("StartTime").text() >= 60) {
						secondTime = $(this).find("StartTime").text();
						minutes = (secondTime - (secondTime % 60)) / 60;
					}
					else {
						minutes = 0;
					}
					songList += "<div class='col-xs-12 songRow'><p>Song " + rowCount + ": </p><input class='form-control urlClass' maxlength='45' id='song" + rowCount + "' size='40' type='text' value='http://www.youtube.com/watch?v=" + $(this).find("VideoId").text() + "'/><p class='timeControl'><input id='mtime" + rowCount + "' class='mTimeInput form-control' size='1' maxlength='1' type='text' value='" + minutes + "'/><span>:</span><input id='stime" + rowCount + "' class='sTimeInput form-control' size='2' maxlength='2' type='text' value='" + seconds + "'/><span id='validate" + rowCount + "' class='validateField'></span></p></div>";
					rowCount++;
				});
				for (rowCount;rowCount<=60;rowCount++) {
					songList += "<div class='col-xs-12 songRow'><p>Song " + rowCount + ": </p><input class='form-control urlClass' maxlength='45' id='song" + rowCount + "' size='40' type='text'/><p class='timeControl'><input id='mtime" + rowCount + "' class='mTimeInput form-control' size='1' maxlength='1' type='text'/><span>:</span><input id='stime" + rowCount + "' class='sTimeInput form-control' size='2' maxlength='2' type='text'/><span id='validate" + rowCount + "' class='validateField'></span></p></div>";
				}
				songList += "</div>";
				songList += "<br/>";
				songList += "<div id='updateContentButtons'>";
				songList += "<button id='updateMix' class='btn btn-primary'>Apply Changes</button>";
				$.ajax({
					type: "POST",
					url: "Update%20Mix/GetPublishedValue.php",
					data: "mixName=" + mixName,
					success: function(data) {
						if (data == 'yes') {
							songList += "<input id='publishCheckBox' checked='checked' type='checkbox'/><label>Publish</label>";
						}
						else {
							songList += "<input id='publishCheckBox' type='checkbox'/><label>Publish</label>";
						}
						songList += "<button id='deleteMix' class='btn btn-primary'>Delete</button>";
						songList += "<p id='publishMessage'>Publishing adds the mix to the main page. You need 10 songs to publish a mix.</p>";
						songList += "</div>";
						$('#setupMix').hide();
						$('#setupMix').html(songList);
						$('#setupMix').fadeIn('slow');
					}
				});
			}
		});
	});
	
	$("#updateMix").live("click", function(e) {
		$("#updateMix").attr('disabled','disabled');
		if (user == '') {
			$('#other').html('You must be logged in to update a mix');
			$("#updateMix").removeAttr('disabled');
		}
		else {
			if (document.getElementById('publishCheckBox').checked == true) {
				if (checkForSixtySongsUpdate() < 10) {
					alert('You must have 10 songs to publish a mix');
					$("#updateMix").removeAttr('disabled');
				}
				else {
					updateMix('publish');
				}
			}
			else {
				updateMix('dontPublish');
			}
		}
	});
	
	function updateMix(publish) {
		var songUpdate;
		var songxUpdate;
		var mtimeUpdate;
		var stimeUpdate;
		var isMinuteGoodu;
		var isSecondGoodu;
		var createNumberErrorsu;
		var createNumbersPatternu = /[0-9]/g;
		var equalPosUpdate;
		var validMessageUpdate;
		var urlErrorsUpdate;
		var startPosUpdate;
		var patternUpdate = /[A-Za-z0-9-_]/g;
		var xmlUpdate = "<?xml version='1.0' encoding='ISO-8859-1'?>";
		xmlUpdate += "<root>";

		urlErrorsUpdate = 0;
		createNumberErrorsu = 0;
		for (y=1;y<=60;y++) {
			mtimeUpdate = $.trim($('#mtime' + y).val());
			stimeUpdate = $.trim($('#stime' + y).val());
			songUpdate = $.trim($('#song' + y).val());
			
		
			if (mtimeUpdate == '') {
				mtimeUpdate = 0;
			}
			if (stimeUpdate == '') {
				stimeUpdate = 0;
			}
			if (songUpdate != '') {
				validMessageUpdate = validateSong(songUpdate);
				if (validMessageUpdate == 'invalid url') {
					$('#validate' + y).hide();
					$('#validate' + y).html(validMessageUpdate);
					$('#validate' + y).show('slow');
					urlErrorsUpdate = urlErrorsUpdate + 1;
				}
				else {
					startPosUpdate = validMessageUpdate.length;
					songxUpdate = songUpdate.substring(startPosUpdate, startPosUpdate + 11);
					if (songxUpdate == "" || songxUpdate == null || songxUpdate.length != 11) {
						$('#validate' + y).hide();
						$('#validate' + y).html('invalid url');
						$('#validate' + y).show('slow');
						urlErrorsUpdate = urlErrorsUpdate + 1;
					} else {
						if (songxUpdate.match(patternUpdate).length == 11) {
							
							isMinuteGoodu = 'no';
							if (mtimeUpdate == 0) {
								isMinuteGoodu = 'yes';
							}
							else {
								if (mtimeUpdate.match(createNumbersPatternu) == null) {
									isMinuteGoodu = 'no';
								}
								else {
									if (mtimeUpdate.match(createNumbersPatternu).length == mtimeUpdate.length) {
										isMinuteGoodu = 'yes';
									}
									else {
										isMinuteGoodu = 'no';
									}
								}
							}
							
							
							isSecondGoodu = 'no';
							if (stimeUpdate == 0) {
								isSecondGoodu = 'yes';
							}
							else {
								if (stimeUpdate.match(createNumbersPatternu) == null) {
								isSecondGoodu = 'no';
								}
								else {
									if (stimeUpdate.match(createNumbersPatternu).length == stimeUpdate.length) {
										isSecondGoodu = 'yes';
									}
									else {
										isSecondGoodu = 'no';
									}
								}
							}
							
							
							if (isMinuteGoodu == 'yes' && isSecondGoodu == 'yes') {
								xmlUpdate += "<header" + y + "><song>" + songxUpdate + "</song><mtime>" + mtimeUpdate + '' + "</mtime><stime>" + stimeUpdate + '' + "</stime></header" + y + ">";
								$('#validate' + y).html('');
							}
							else {
								createNumberErrorsu = createNumberErrorsu + 1;
								$('#validate' + y).html('invalid time');
							}
						}
						else {
							$('#validate' + y).hide();
							$('#validate' + y).html('id not valid');
							$('#validate' + y).show('slow');
							urlErrorsUpdate = urlErrorsUpdate + 1;
						}							
					}
				}
			}
			else {
				$('#validate' + y).html('');
			}
		}
		xmlUpdate += "</root>";
		if (urlErrorsUpdate == 0) {
			if (createNumberErrorsu == 0) {
				$.ajax({
					type: "POST",
					url: "Update%20Mix/UpdateMix.php",
					data: "title=" + mixName + "&xml=" + xmlUpdate + "&email=" + user + "&publish=" + publish,
					beforeSend: function(){$("#setupMix").hide();},
					complete: function(){ $("#setupMix").show("slow");},
					success: function(html) {
						$('#setupMix').html(html);
						currentPage = 'mixUpdated';
					}
				});
			}
			else {
				alert('There are invalid characters entered in one or more of the time slots');
				$("#updateMix").removeAttr('disabled');
			}
			
		}
		else {
			alert('There are some format errors with the URLs entered');
			$("#updateMix").removeAttr('disabled');
		}
	}
	
	$('#deleteMix').live("click", function() {
		$('#deleteMix').attr('disabled', 'disabled');
		var answer = showMessage();
		if (answer == true) {
			$.ajax({
				type: "POST",
				url: "Update%20Mix/DeleteMix.php",
				data: "title=" + mixName,
				beforeSend: function(){$("#setupMix").hide();},
				complete: function(){ $("#setupMix").show("slow");},
				success: function(html) {
					$('#setupMix').html(html);
					currentPage = 'mixDeleted';
				}
			});
		}
		else {
			$('#deleteMix').removeAttr('disabled');
		}
	});
	
	function checkForSixtySongsUpdate() {
		var songu;
		var updateTotalSongs = 0;
		for (y=1;y<=60;y++) {
			songu = $('#song' + y).val();
			songu = $.trim(songu)
			if (songu != '') {
				updateTotalSongs = updateTotalSongs + 1;
			}
		}
		return updateTotalSongs;
	}
	
	function showMessage() {
		var r=confirm("Are you sure you want to delete this mix?");
		return r;
	}
	//UPDATEMIX PAGE
	
	
	
	//YOUTUBE SCRIPT
	var songs = new Array();
    var startTimes = new Array();
    var songPosition = 0;
    var userMix;
    var contentMessage;
        
   $('#resend_password_link').live("click", function(e) {
   		e.preventDefault();
   		currentPage = 'resendPass';
   		$('#signupPage').hide();
		$('#screenWrapper').hide();
		$('#setupMix').hide();
		hideScreen();
		newScreen = 1;
		mixStarted = 0;
		$('#other').load('base/Login/ForgotPassword.html', function() {
			$('#other').hide().show('slow');
		});
   });
    
  
    $('#termsLink').live("click", function(e) {
    	e.preventDefault();
		currentPage = 'terms';
		hideScreen();
	    newScreen = 1;
	    mixStarted = 0;
	    $('#other').hide();
	    $('#content').hide();
		$('#other').load('masterPage/terms.html', function() {
			$('#other').fadeIn('slow');
		});
	});

	$('#privacyLink').live("click", function(e) {
		e.preventDefault();
		currentPage = 'privacy';
		hideScreen();
	    newScreen = 1;
	    mixStarted = 0;
		$('#other').hide();
		$('#content').hide();
		$('#other').load('masterPage/privacy.html', function() {
			$('#other').fadeIn('slow');
		});
	});
	
	$('#loadMyMix').live("click", function(e) {
		$('#controlsWrapper').hide();
		$('#songLoaderGif').hide();
    	$('#songLoaderGif').html("<img src='masterPage/loader.gif'/>");
    	$('#songLoaderGif').show();
		titleMix = $('.dropdown').val();
    	$.ajax({
            type: "POST",
            url: "base/Youtube/GetSongs.php",
            data: "mixTitle=" + titleMix,
            dataType: "xml",
			success: function(xml) {
				songs = [];
				startTimes = [];
				$(xml).find("header").each(function() {
					songs.push($(this).find("VideoId").text());
					startTimes.push($(this).find("StartTime").text());
				});
				if (songs.length == 0) {
					$('#songLoaderGif').hide();
					$('#controlsWrapper').html("Please select a mix listed in the drop down menu.");
					$('#controlsWrapper').fadeIn('slow');
				}
				else {
					hideScreen();
					if ($('#blackScreen').attr('class') != 'invisible') {
						$('#blackScreen').addClass('invisible');
					}
					showScreen();
			    	newScreen = 0;
			    	mixLoaded = 1;
			    	mixStarted = 0;
					$.ajax({
			            type: "POST",
			            url: "masterPage/GetMixId.php",
			            data: "mixname=" + titleMix,
						success: function(html) {
							$('#songLoaderGif').hide();
							$('#controlsWrapper').removeClass('invisible');
							$('#controlsWrapper').html("<a id='pauseSong' class='controlLinkButtonDisabled' href=''>Pause</a> <a id='playSong' class='controlLinkButtonDisabled' href=''>Play</a> <a id='prevSong' class='controlLinkButtonDisabled' href=''>Prev</a> <a id='nextSong' class='controlLinkButtonDisabled' href=''>Next</a><br/><div id='timerLabel'>Song: 1 Timer: 0</div><span id='directLink'></span> <p id='messageCenter'></p>");
							$('#controlsWrapper').fadeIn('slow');
							$('#other').hide();
							showScreen();
							$('#directLink').html("http://www.powerhourfactory.com?mixid=" + html);
							$('#messageCenter').hide('slow');
							$('#messageCenter').html('');
					        mixStarted = 1;
					        songPaused = 0;
					        mixEnded = 0;
					        loadMixClicked = 1;
					        $('#pauseSong').removeClass('controlLinkButtonDisabled');
					        $('#pauseSong').addClass('controlLinkButton');
					        $('#nextSong').removeClass('controlLinkButtonDisabled');
					        $('#nextSong').addClass('controlLinkButton');
					        if(/(iPad|iPhone|iPod)/g.test( navigator.userAgent ) && (mobileViewerMessageFlag == 0)) {
					        	$('#mobileViewerMessage').show();
					        	startSong(songs, startTimes);
					        	pauseSong();
					        } else {
					        	startSong(songs, startTimes);
					        }
						}
					});
				}
			}
    	});
	});
	
	if (query_pair[0] == 'mixid') {
		$('#other').hide();
		$('#content').load('Queried%20Mix', function() {
			mixId = query_pair[1];
			$.ajax({
	            type: "POST",
	            url: "Queried%20Mix/GetMixFromId.php",
	            data: "mixid=" + mixId,
				success: function(html) {
					if (html == 'Mix not found') {
						$('#other').html(html);
						$('#other').show('slow');
						$('#content').html('');
						$('#screenWrapper').hide();
					}
					else {
						titleMix = html;
						$('#content').hide();
						$.ajax({
				            type: "POST",
				            url: "base/Youtube/GetSongs.php",
				            data: "mixTitle=" + titleMix,
				            dataType: "xml",
							success: function(xml) {
								songs = [];
								startTimes = [];
								$(xml).find("header").each(function() {
									songs.push($(this).find("VideoId").text());
									startTimes.push($(this).find("StartTime").text());
								});
								if (songs.length == 0) {
									alert('There are no songs in this mix');
								}
								else {
							    	newScreen = 0;
							    	mixLoaded = 1;
							    	mixStarted = 0;
									$.ajax({
					            		type: "POST",
					            		url: "masterPage/GetMixId.php",
					           			data: "mixname=" + titleMix,
										success: function(html) {
											hideScreen();
											$('#controlsWrapperQuery').show();
											$('#screenWrapper').fadeIn('slow');
											if ($('#blackScreen').attr('class') != 'invisible') {
												$('#blackScreen').addClass('invisible');
											}
											$('#queryBlackScreen').removeClass('invisible');
											$('#controlsWrapperQuery').html("<b><p class='queriedTitleMix' id='titleOfMix'>Mix Name: " + titleMix + "</p></b><a id='start' class='controlLinkButtonDisabled' href=''>Start</a><br/><a id='pauseSong' class='controlLinkButtonDisabled' href=''>Pause</a> <a id='playSong' class='controlLinkButtonDisabled' href=''>Play</a> <a id='prevSong' class='controlLinkButtonDisabled' href=''>Prev</a> <a id='nextSong' class='controlLinkButtonDisabled' href=''>Next</a><br/><br/><div id='timerLabel'><Song: 1 Timer: 0</div><span id='directLink'></span> <p id='messageCenter'></p>");
											$('#controlsWrapper').fadeIn('slow');
											$('#directLink').html("http://www.powerhourfactory.com?mixid=" + mixId + "</p>");
											$('#content').fadeIn('slow');
									    	newScreen = 0;
									    	mixLoaded = 1;
									    	mixStarted = 0;
									    	mixEnded = 0;
									    	loadMixClicked = 1;
											$('#start').removeClass('controlLinkButtonDisabled');
											$('#start').addClass('controlLinkButton');		       								
										}
									});
								}
							}
    					});
    				}
    			}
			});
		});
	}

	$('#loadMix').live("click", function(e) {
    	$('#controlsWrapper').hide();
    	$('#songLoaderGif').hide();
    	$('#songLoaderGif').html("<img src='masterPage/loader.gif'/>");
    	$('#songLoaderGif').show();
    	titleMix = $('.dropdown').val();
    	$.ajax({
            type: "POST",
            url: "base/Youtube/GetSongs.php",
            data: "mixTitle=" + titleMix,
            dataType: "xml",
			success: function(xml) {
				songs = [];
				startTimes = [];
				$(xml).find("header").each(function() {
					songs.push($(this).find("VideoId").text());
					startTimes.push($(this).find("StartTime").text());
				});
				if (songs.length == 0) {
					$('#songLoaderGif').hide();
					$('#controlsWrapper').html("Please select a mix listed in the drop down menu.");
					$('#controlsWrapper').fadeIn('slow');
				}
				else {
					if ($('#blackScreen').attr('class') != 'invisible') {
						$('#blackScreen').addClass('invisible');
					}
					showScreen();					
			    	newScreen = 0;
			    	mixLoaded = 1;
					$.ajax({
			            type: "POST",
			            url: "masterPage/GetMixId.php",
			            data: "mixname=" + titleMix,
						success: function(html) {
							$('#songLoaderGif').hide();
							$('#controlsWrapper').removeClass('invisible');
							$('#controlsWrapper').html("<a id='pauseSong' class='controlLinkButtonDisabled' href=''>Pause</a> <a id='playSong' class='controlLinkButtonDisabled' href=''>Play</a> <a id='prevSong' class='controlLinkButtonDisabled' href=''>Prev</a> <a id='nextSong' class='controlLinkButtonDisabled' href=''>Next</a><div id='timerLabel'>Song: 1 Timer: 0</div><span id='directLink' class='directLink'></span><p id='messageCenter'></p>");
							$('#controlsWrapper').fadeIn('slow');
							$('#other').hide();
							showScreen();
							$('#directLink').html("http://www.powerhourfactory.com?mixid=" + html);
							$('#messageCenter').hide('slow');
					        mixStarted = 1;
					        songPaused = 0;
					        mixEnded = 0;
					        loadMixClicked = 1;
					        $('#pauseSong').removeClass('controlLinkButtonDisabled');
					        $('#pauseSong').addClass('controlLinkButton');
					        //$('#playSong').removeClass('controlLinkButtonDisabled');
					        //$('#playSong').addClass('controlLinkButton');
					        $('#nextSong').removeClass('controlLinkButtonDisabled');
					        $('#nextSong').addClass('controlLinkButton');
					        if(/(iPad|iPhone|iPod)/g.test( navigator.userAgent ) && (mobileViewerMessageFlag == 0)) {
					        	$('#mobileViewerMessage').show();
					        	startSong(songs, startTimes);
					        	pauseSong();
					        } else {
					        	startSong(songs, startTimes);
					        }
						}
					});
				}
			}
    	});
	});
	
	$('#start').live("click", function(e) {
        e.preventDefault();
        if (mixLoaded == 1 && newScreen == 0) {
        	if (mixStarted == 0) {
        		if ($('#blackScreen').attr('class') != 'invisible') {
					$('#blackScreen').addClass('invisible');
				}
				$('#titleOfMix').html(titleMix);
				$('#messageCenter').hide('slow');
				$('#messageCenter').html('');
		        mixStarted = 1;
		        songPaused = 0;
		        showScreen();
		        startSong(songs, startTimes);
		        $('#timerLabel').fadeIn('slow');
		        $('#queryBlackScreen').hide();
		        $('#start').removeClass('controlLinkButton');
		        $('#start').addClass('controlLinkButtonDisabled');
		        $('#pauseSong').removeClass('controlLinkButtonDisabled');
		        $('#pauseSong').addClass('controlLinkButton');
		        $('#playSong').removeClass('controlLinkButtonDisabled');
		        $('#playSong').addClass('controlLinkButton');
		        $('#nextSong').removeClass('controlLinkButtonDisabled');
		        $('#nextSong').addClass('controlLinkButton');
		        if(/(iPad|iPhone|iPod)/g.test( navigator.userAgent ) && (mobileViewerMessageFlag == 0)) {
		        	$('#mobileViewerMessage').show();
		        }
        	}
        }
        else {
        	$('#titleOfMix').html('Load a mix before selecting start');
        }
    });
    
    $('#pauseSong').live("click", function(e) {
		e.preventDefault();
    	if (mixLoaded == 1 && newScreen == 0 && songBuffering == 0) {
    		pauseSong();
    		songPaused = 1;
    	}
    });
    
    $('#playSong').live("click", function(e) {
    	e.preventDefault();
    	if (mixLoaded == 1 && newScreen == 0 && songPaused == 1 && songBuffering == 0) {
        	playSong();
        	songPaused = 0;
    	}
        
    });
    
    $('#prevSong').live("click", function(e) {
        e.preventDefault();
        if (mixStarted == 1 && mixLoaded == 1 && newScreen ==0) {
            prevSong();
            songPaused = 0;
        }
    });
    
    $('#nextSong').live("click", function(e) {
        e.preventDefault();
        if (mixStarted == 1 && mixLoaded == 1 && newScreen ==0) {
            nextSong(0);
            songPaused = 0;
        }
    });
	//YOUTUBE SCRIPT
	
});

function enterFunc(e)
{
	if (e.keyCode == 13) {
		$('#loginbutton').click();
	}
}

function enterFuncSmall(e)
{
	if (e.keyCode == 13) {
		$('#loginbuttonSmall').click();
	}
}

function enterFuncSendPassword(e)
{
	if (e.keyCode == 13) {
		$('#sendPassword').click();
	}
}

function validateSong(vSong) {
	var firstYoutubeCharacter;
	var otherYoutubeCharacter;
	var youtubeURL;
	try
	{
		youtubeURL = '';
		if (isHttps(vSong.substring(0,5))) {
			if (vSong.length > 27) {
				firstYoutubeCharacter = vSong.substring(0,1);
				if (firstYoutubeCharacter == 'h') {
					otherYoutubeCharacter = vSong.substring(24,25);
					if (otherYoutubeCharacter == 'w') {
						youtubeURL = vSong.substring(0, 32);
					}
					else if (otherYoutubeCharacter == 'v') {
						youtubeURL = vSong.substring(0, 26);
					}
				}
				else if (firstYoutubeCharacter == 'w') {
					otherYoutubeCharacter = vSong.substring(17,18);
					if (otherYoutubeCharacter == 'w') {
						youtubeURL = vSong.substring(0, 25);
					}
					else if (otherYoutubeCharacter == 'v') {
						youtubeURL = vSong.substring(0, 19);
					}
				}
				else {
					youtubeURL = 'invalid url';
				}
				if (youtubeURL.toUpperCase() == 'https://www.youtube.com/watch?v='.toUpperCase() || youtubeURL.toUpperCase() == 'www.youtube.com/watch?v='.toUpperCase() || youtubeURL.toUpperCase() == 'https://www.youtube.com/v/'.toUpperCase() || youtubeURL.toUpperCase() == 'www.youtube.com/v/'.toUpperCase() ) {
				}
				else {
					youtubeURL = 'invalid url';
				}
			}
			else {
				youtubeURL = 'invalid url';
			}
			return youtubeURL;
		} else {
			if (vSong.length > 26) {
				firstYoutubeCharacter = vSong.substring(0,1);
				if (firstYoutubeCharacter == 'h') {
					otherYoutubeCharacter = vSong.substring(23,24);
					if (otherYoutubeCharacter == 'w') {
						youtubeURL = vSong.substring(0, 31);
					}
					else if (otherYoutubeCharacter == 'v') {
						youtubeURL = vSong.substring(0, 25);
					}
				}
				else if (firstYoutubeCharacter == 'w') {
					otherYoutubeCharacter = vSong.substring(16,17);
					if (otherYoutubeCharacter == 'w') {
						youtubeURL = vSong.substring(0, 24);
					}
					else if (otherYoutubeCharacter == 'v') {
						youtubeURL = vSong.substring(0, 18);
					}
				}
				else {
					youtubeURL = 'invalid url';
				}
				if (youtubeURL.toUpperCase() == 'http://www.youtube.com/watch?v='.toUpperCase() || youtubeURL.toUpperCase() == 'www.youtube.com/watch?v='.toUpperCase() || youtubeURL.toUpperCase() == 'http://www.youtube.com/v/'.toUpperCase() || youtubeURL.toUpperCase() == 'www.youtube.com/v/'.toUpperCase() ) {
				}
				else {
					youtubeURL = 'invalid url';
				}
			}
			else {
				youtubeURL = 'invalid url';
			}
			return youtubeURL;
		}
	}
	catch (err) {
		youtubeURL = 'invalid url';
		return youtubeURL;
	}
}

function isHttps(s) {
	if (s === 'https') {
		return true;
	} else {
		return false;
	}
}

function isEmailAddress(someEmail) {
	var emailPattern = /^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/;
    return someEmail.match(emailPattern);    
}

function clearloginmessage() {
	document.getElementById('loginmessage').innerHTML = '';
	document.getElementById('loginmessageSmall').innerHTML = '';
}

function checkMixName(nameOfMix) {
	var mixPattern = /[A-Za-z0-9-_' ]/g;
    return nameOfMix.match(mixPattern);
}


//YOUTUBE SCRIPT
var t;
var seconds = 0;
var songList = new Array();
var times = new Array();
var TimerIsOn = 0;
var songPos = 0;
var fromRunTimer = 0;
var paused = 0;
var mixEnded;
stopTimer();
var nothing;

// FOR IPHONE USERS
$('#reloadVideoForMobile').live('click', function(e) {
	e.preventDefault();
	player.stopVideo();
    player.loadVideoById(songList[songPos], times[songPos], 'default');
    player.playVideo();
});

function showScreen() {
	$('#playerWrapper').show();
	$('#screenWrapper').show();
	player.setSize('1024','768');
    stopTimer();
    try {
    	player.stopVideo(); 
    }
    catch (err) {
    	nothing = err.message;
    }
}


function hideScreen() {
	$('#playerWrapper').hide();
	$('#screenWrapper').hide();
	$('#controlsWrapper').hide();
	$('#controlsWrapperQuery').hide();
	try {
		pauseSong();
		player.stopVideo();
	}
	catch(err) {		
		nothing = err.message;
	}
}

function startSong(songz, startTimez) {
    songList = songz;
    times = startTimez;
    songPos = 0;
    mixStarted = 1;
    seconds=0;
    try {
    	player.stopVideo();
    	player.loadVideoById(songList[0], times[0], 'default');
		player.playVideo();
    }
    catch (err) {
    	alert(err.message);
    }
}

function pauseSong() {
    player.pauseVideo();
    paused = 1;
    stopTimer();
}

function playSong() {
    if (paused == 1 && mixEnded == 0) {
        player.playVideo();
        startTimer();
    }
}

function prevSong() {
	loadMixClicked = 0;
	if (songPos > 0) {
		if (songPos == 1) {
			$('#prevSong').removeClass('controlLinkButton');
   			$('#prevSong').addClass('controlLinkButtonDisabled');
		}
		songPos = songPos - 1;
		stopTimer();
		if (fromRunTimer == 0) {
		    startTimer();
		}
		seconds = (songPos) * 60;
	    player.stopVideo();
	    player.loadVideoById(songList[songPos], times[songPos], 'default');
	    player.playVideo();
	}
}

function nextSong(fromRunTimer) {
   
    //if (songPos >= songList.length) {
        //songPos = 0;
    //}
   loadMixClicked = 0;
    if (songPos + 1 < songList.length) {
    	$('#prevSong').removeClass('controlLinkButtonDisabled');
   		$('#prevSong').addClass('controlLinkButton');
    	songPos = songPos + 1;
		stopTimer();
		if (fromRunTimer == 0) {
		    startTimer();
		}
		seconds = (songPos) * 60;
	    player.stopVideo();
	    player.loadVideoById(songList[songPos], times[songPos], 'default');
	    player.playVideo();
	    
    }
    else {
    	stopMix();
    }
}

function stopMix() {
	mixEnded = 1;
	$('#start').removeClass('controlLinkButtonDisabled');
	$('#start').addClass('controlLinkButton');
	$('#pauseSong').removeClass('controlLinkButton');
    $('#pauseSong').addClass('controlLinkButtonDisabled');
    $('#playSong').removeClass('controlLinkButton');
    $('#playSong').addClass('controlLinkButtonDisabled');
    $('#prevSong').removeClass('controlLinkButton');
    $('#prevSong').addClass('controlLinkButtonDisabled');
    $('#nextSong').removeClass('controlLinkButton');
    $('#nextSong').addClass('controlLinkButtonDisabled');
	player.pauseVideo();
	stopTimer();
	if (document.getElementById('timerLabel')) {
		document.getElementById('timerLabel').innerHTML = "Song: " + (songPos + 1) + " Timer: 60";
	}
	player.setSize('0', '1');
	$('#playerWrapper').hide();
	mixStarted = 0;
	$('#blackScreen').removeClass('invisible');
	$('#titleOfMix').html(titleMix + ' finished!');
}

function removeCurrentSongAndPlayNext() {
    songList.splice(songPos, 1);
    seconds = (songPos) * 60;
    player.loadVideoById(songList[songPos], times[songPos], 'default');
}

function runTimer() {
    seconds = seconds + 1;
    //document.getElementById('timerLabel').innerHTML = seconds;
    document.getElementById('timerLabel').innerHTML = "Song: " + (songPos + 1) + " Timer: " + seconds % 60;
    if ((songPos + 1) == (seconds / 60)) {
    		nextSong(1);
    }
    
	t=setTimeout("runTimer()",1000);
}

function startTimer() {
    if (!TimerIsOn) {
        TimerIsOn=1;
        runTimer();
    }
}
function stopTimer()
{
    TimerIsOn=0;
    clearTimeout(t);
}


//------------------------------------------------------------------//
//Youtube embed object script
var tag = document.createElement('script');
tag.src = "http://www.youtube.com/player_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

var player;
function onYouTubePlayerAPIReady() {
	apiLoaded = '1';
	player = new YT.Player('player', {
		height: '1',
		width: '1',
		playbackQuality: 'small',
		playerVars: {'controls': 1},
		videoId: '',
		events: {
			'onError': catchError,
			'onStateChange': onPlayerStateChange
		}
	});
}

function onPlayerReady(event) {
    //event.target.playVideo();
}

function catchError(event) {
    if (event.data == 2) {
        //document.getElementById('errorLabel').innerHTML = 'Video id has invalid characters';
        stopTimer();
        $('#messageCenter').hide();
        $('#messageCenter').html('song ' + (songPos + 1) + ' skipped: invalid video id');
        $('#messageCenter').show('slow');
        setTimeout("clearMessageCenter()", 4000);
        nextSong(0);
    }
    if (event.data == 100) {
        //document.getElementById('errorLabel').innerHTML = 'No video exists at this URL';
        stopTimer();
        $('#messageCenter').hide();
        $('#messageCenter').html('song ' + (songPos + 1) + ' skipped: video id does not exist');
        $('#messageCenter').show('slow');
        setTimeout("clearMessageCenter()", 4000);
        nextSong(0);     
    }
    else if (event.data == 101 || event.data == 150) {
        //document.getElementById('errorLabel').innerHTML = 'Embed disabled on this video';
        stopTimer();
        $('#messageCenter').hide();
        $('#messageCenter').html('song ' + (songPos + 1) + ' skipped: embed disabled for video');
        $('#messageCenter').show('slow');
        setTimeout("clearMessageCenter()", 4000);
        nextSong(0);
    }
}

function clearMessageCenter() {
	$('#messageCenter').hide('slow');
}

var videoLoadedForFirstTimeFix = 0;
function onPlayerStateChange(event) {
    //document.getElementById('errorLabel').innerHTML = event.data;
    if (event.data == YT.PlayerState.PLAYING) {
        startTimer();
        songBuffering = 0;
        if (videoLoadedForFirstTimeFix < 1) {
        	player.seekTo(times[0]);
        	videoLoadedForFirstTimeFix = videoLoadedForFirstTimeFix + 1;
        }
        $('#playSong').removeClass('controlLinkButton');
		$('#playSong').addClass('controlLinkButtonDisabled');
        $('#pauseSong').removeClass('controlLinkButtonDisabled');
        $('#pauseSong').addClass('controlLinkButton');
    }
    else if (event.data == YT.PlayerState.BUFFERING || event.data == -1  ) {
        stopTimer();
        songBuffering = 1;
        
    }
    else if (event.data == YT.PlayerState.PAUSED) {
    	paused = 1;
    	songPaused = 1;
    	if (mixEnded != 1) {
    		$('#playSong').removeClass('controlLinkButtonDisabled');
      		$('#playSong').addClass('controlLinkButton');
    	}
    	if (mixEnded == 1) {
    		mixEnded = 0;
    	}
    	$('#pauseSong').removeClass('controlLinkButton');
		$('#pauseSong').addClass('controlLinkButtonDisabled');
    	stopTimer();
    }
    else if (event.data == YT.PlayerState.ENDED) {
    	stopTimer();
    	nextSong();
    }
}
/*
function fakePlayerStateChange() {
    if (document.getElementById('errorLabel').innerHTML == YT.PlayerState.PLAYING) {
        startTimer();
    }
    else if (document.getElementById('errorLabel').innerHTML == YT.PlayerState.BUFFERING || document.getElementById('errorLabel').innerHTML == -1  ) {
        stopTimer();
    }
}*/

function stopVideo() {
    player.stopVideo();
}
//YOUTUBE SCRIPT
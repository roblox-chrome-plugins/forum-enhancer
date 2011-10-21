(function($) {
    $.QueryString = (function(a) {
        if (a == "") return {};
        var b = {};
        for (var i = 0; i < a.length; ++i)
        {
            var p=a[i].split('=');
            if (p.length != 2) continue;
            b[p[0]] = decodeURIComponent(p[1].replace(/\+/g, " "));
        }
        return b;
    })(window.location.search.substr(1).split('&'))
})(jQuery);

function parseRobloxDate(date) {
	date = $.trim(date);
	
	//AM and PM. Date.js, y u no do this for me?
	date = date.replace(/(\d\d)(:\d\d) (AM|PM)/gi, function(_, hours, rest, ampm) {
		hours = +hours;
		if(hours == 12)
			hours = 0;
		if(ampm == 'PM')
			hours += 12;
		return hours + rest;
	});
	
    /**TODO: Handle time zone being different when logged out. WTF, roblox. */
	date += ' PST';
	
	//Today?
	if(/today @/i.test(date))
		date = Date.parse(date.replace(/today @/i, ''));
	else
		date = Date.parseExact(date, 'MM-dd-yyyy H:mm zzz'); //'dd MMM yyyy HH:mm zzz';
	
	return date;
}

chrome.extension.sendRequest({action: 'all'}, function(data) {
var options = data.options;
var templates = data.templates;

$(function() {
	var submenu;
	var breadcrumb;
	
	var footer;

	$('#ctl00_Announcement').insertBefore('#Container');
	
	var body = $('#Body');
	body.removeAttr('id');
	$(window).load(function() { setTimeout(function() { body.attr('id', 'Body'); }, 1) });
	
	(function makeNavigation() {
		$.template("navigationTemplate", templates.navigation);
		
		//Remove navigation
		$('span#ctl00_cphRoblox_NavigationMenu2').add('span#ctl00_cphRoblox_Navigationmenu1').remove();
		
		//Get one breadcrumb, remove the rest
		var breadcrumb = $('#ctl00_cphRoblox_Whereami1')
			.add('#ctl00_cphRoblox_ThreadView1_ctl00_Whereami1')
			.add('#ctl00_cphRoblox_PostView1_ctl00_Whereami1')
			.add('#ctl00_cphRoblox_PostView1_ctl01_Whereami1')
			.add('#ctl00_cphRoblox_Createeditpost1_PostForm_Whereami1')
			.add('#ctl00_cphRoblox_MyForums1_ctl00_Whereami1')
			.add('#ctl00_cphRoblox_Whereami2')
			.add('#ctl00_cphRoblox_ThreadView1_ctl00_Whereami2')
			.add('#ctl00_cphRoblox_PostView1_ctl00_Whereami2')
			.add('#ctl00_cphRoblox_PostView1_ctl01_Whereami2')
			.add('#ctl00_cphRoblox_Createeditpost1_PostForm_Whereami2')
			.add('#ctl00_cphRoblox_MyForums1_ctl00_Whereami2')
			.remove().first();
			
		
		var data = [];
		
		if(breadcrumb.length == 0) {
			data.push({name: 'Roblox Forum', href: 'http://www.roblox.com/Forum/Default.aspx'});
		}
		else {
			data = breadcrumb.find('nobr a').map(function() {
				var item = {
					name: $(this).text(),
					href: $(this).attr('href')
				};
				var maxLength = 40;
				if(item.name.length > maxLength)
					item.name = item.name.substring(0, maxLength - 3) + '...';
				
				return item;
			}).get();
		}
		
		if(location.pathname == '/Forum/User/MyForums.aspx') data.push({name: 'My Forums', href: ''});
		
		$.tmpl('navigationTemplate', {
			breadcrumb: data,
			optionsPage: chrome.extension.getURL('fancy-settings/source/index.html')
		}).insertBefore(body);
		document.title = data.map(function(item) { return item.name; }).reverse().join(' | ');
	})();
	console.log("Nav");

	(function makePagination() {
		var oldPagination, pageData, pageBaseUrl;
		$.each([
			{
				selector: '#ctl00_cphRoblox_ThreadView1_ctl00_Pager',
				param: 'ForumID'
			}, {
				selector: '#ctl00_cphRoblox_PostView1_ctl00_Pager',
				param: 'PostID'
			}
		], function() {
			var elem = $(this.selector);
			if(elem.length) {
				oldPagination = elem;
				pageBaseUrl = '?'+ this.param + '=' + $.QueryString[this.param] + '&PageIndex=';
				pageData = /Page ([\d,]+) of ([\d,]+)/.exec(oldPagination.text());
				return false;
			}				
		});	
		if(pageData) {
			var currentPage = $.QueryString['PageIndex'] || pageData[1].replace(/,/g, '');
			var lastPage = pageData[2].replace(/,/g, '');
			
			var newPagination = $('<div />').addClass('forum-pagination');
			var justAdded = null;
			for(var i = 1; i <= lastPage; i++) {
				if(currentPage == i) {
					justAdded = $('<span />', {
						text:  i,
						class: 'page-link current'
					}).appendTo(newPagination);
				}
				else if(i == 1 || i == lastPage || Math.abs(currentPage - i) <= 3) {
					justAdded = $('<a />', {
						href: pageBaseUrl + i,
						text:  i,
						class: 'page-link'
					}).appendTo(newPagination);
				}
				else if(justAdded) {
					$('<span />', {
						text:  '...',
						class: 'page-gap'
					}).appendTo(newPagination);
					justAdded = null;
				}
			}
			oldPagination.remove();
			footer = $('<div class="forum-footer"/>');
			$('#ctl00_cphRoblox_CenterColumn').append(footer.append(newPagination));
		}
	})();
	
	function getRawText(robloxElem) {
		return robloxElem.find('br').replaceWith('\n').end().text();
	}

	if(location.pathname == '/Forum/ShowPost.aspx') {
		/** Post list */
		$.template("postTemplate", templates.post);
		$.template("threadTemplate", templates.thread);
		var page = $.tmpl("threadTemplate", getThread()).replaceAll('#ctl00_cphRoblox_PostView1');
		
		hljs.tabReplace = '    '; // 4 spaces
		hljs.initHighlighting();
		$('body').delegate('.markdown-toggle', 'click', function() {
			$('.forum-post .post-info').each(function() {
				$(this).find('.content.markdown').toggle();
				$(this).find('.content.plaintext').toggle();
			});
		});
	}
	else if(location.pathname == '/Forum/AddPost.aspx') {
		var page = $('#ctl00_cphRoblox_Createeditpost1').children('table').eq(1);
		var preview = $('#ctl00_cphRoblox_Createeditpost1_PostForm_Preview').size() > 0;
		if(preview) {
			var previewContainer = page.children('tbody').children('tr').eq(1).children('td').first();
			
			var heading = $('#ctl00_cphRoblox_Createeditpost1_PostForm_PreviewSubject');
			var message = $('#ctl00_cphRoblox_Createeditpost1_PostForm_PreviewBody');
			var actions = $('#ctl00_cphRoblox_Createeditpost1_PostForm_BackButton')
				.add('#ctl00_cphRoblox_Createeditpost1_PostForm_PreviewPostButton');
				
			previewContainer.empty().addClass('forum-post').append(
				$('<div />').addClass('forum-post-heading').append(heading.text()),
				$('<div />').addClass('forum-post-content').addClass('markdown').append(markdownText(getRawText(message))),
				$('<div />').addClass('forum-post-actions').append(actions)
			)
		}
		else {
			$.template('newFormTemplate', templates.newForm);
			$.tmpl("newFormTemplate", {
				message: $('#ctl00_cphRoblox_Createeditpost1_PostForm_PostBody').val(),
				title: $('#ctl00_cphRoblox_Createeditpost1_PostForm_PostSubject').val()
			}).replaceAll($('#ctl00_cphRoblox_Createeditpost1_PostForm_PostSubject').closest('table'));
            var editor1 = new Markdown.Editor(converter);
            editor1.run();
			
			$(aspnetForm).submit(function() {
				var message = $(editor1.panels.input);
				var text = message.val().split('\n').map(function(line) {
					var newText = '';
					var done = false;
					for(var i = 0; i < line.length; i++) {
						var character = line[i];
						if(!done) {
							if(character == ' ')
								character = '\u00a0';
							else if(character == '\t')
								character = '\u00a0\u00a0\u00a0\u00a0';
							else if(/[^\u00a0>0-9.*+-]/.test(character))
								done = true;
						}
						newText += character;
					}
					return newText;
				}).join('\n').replace(/\<(?=[\/\w])/g, '<\u200b').replace(/([" \/])>/g, '$1\u200b>');
				message.val(text);
			});
			
			if($.QueryString['PostID']) {
				//New Post
				
				var lastPostContainer = page.children('tbody').children('tr').eq(1).children('td').first();
				
				var message = $('#ctl00_cphRoblox_Createeditpost1_PostForm_ReplyBody');
				var subject = $('#ctl00_cphRoblox_Createeditpost1_PostForm_ReplySubject');
				var author = $('#ctl00_cphRoblox_Createeditpost1_PostForm_ReplyPostedBy');
				var date = $('#ctl00_cphRoblox_Createeditpost1_PostForm_ReplyPostedByDate');
				
				message = getRawText(message);
				if($.QueryString['quote']) {
					var reply = newPost;
					reply.val('> '+ message.split('\n').join('\n> ') + '\n\n' + reply.val());
					
					setTimeout(function() {
						reply.focus();
						reply.get(0).setSelectionRange(reply.val().length, reply.val().length);
						reply.scrollTop(999999);
					}, 1);
				}
				message = markdownText(message)
				subject.contents().wrapAll('<span class="normalTextSmallBold" />');
				
				lastPostContainer.empty().addClass('forum-post').append(
					$('<div />').addClass('forum-post-heading').append(
						subject,
						'<br />',
						$('<span class="normalTextSmaller" />').append('Posted by ', author, date)
					),
					$('<div />').addClass('forum-post-content').addClass('markdown').append(message)
				);
			}
			else {
				//New Thread
			}
			var table = $('#ctl00_cphRoblox_Createeditpost1_PostForm_Post').next();
			var buttons = $.tmpl($.template(null, templates.postButtons), {});
			table.detach()
				.find('table').css('margin', 'auto')
					.find('tr').filter(function() {return !$.trim($(this).text()); }).remove();
			$('#ctl00_cphRoblox_Createeditpost1').empty().append(table, buttons);
		}
	}
	else if(location.pathname == '/Forum/ShowForum.aspx') {
		$.template("forumTemplate", templates.forum);
		var page = $.tmpl("forumTemplate", {
			id: $.QueryString['ForumID'],
			threads: $('#ctl00_cphRoblox_ThreadView1_ctl00_ThreadList').parent().html()
		}).replaceAll('#ctl00_cphRoblox_ThreadView1');
	}
	
	$('#ctl00_cphRoblox_ThreadView1_ctl00_ThreadList')
		.add('#ctl00_cphRoblox_MyForums1_ctl00_ParticipatedThreads')
		.add('#ctl00_cphRoblox_MyForums1_ctl00_ThreadTracking')
		.find('tr').each(function() {
			var dateBox = $(this).find('td').eq(5).find('span');
			if(dateBox.length == 0) return;
			
			var date = parseRobloxDate(dateBox.text().replace(/\s*by\s*/i,''));
			
			if(date) dateBox.empty().append('<time title="'+date+'" datetime="'+date+'">'+prettyDate(date)+'</time><br />');
		});
		
	var forumstuff = $('#ctl00_cphRoblox_CenterColumn');
	forumstuff.children('br, p').remove();
	
	if(options.enlargeForum) {
		forumstuff.remove().contents().appendTo(body.empty());
	} else
		forumstuff.siblings().removeAttr('width').filter(function() {return $(this).text().match(/^\s+$/g);}).remove();
	/*
	if(options.enlargeForum) {
		forumstuff = forumstuff.siblings('[id]').andSelf().clone();

		$('div#Body > table').remove();

		forumstuff.each(function() {
			$('div#Body').append($('<div />')
				.attr('id', $(this).attr('id'))
				.append($(this).contents())
			);
		})

		var contentElement = $('#ctl00_cphRoblox_PostView1, #ctl00_cphRoblox_ThreadView1');
		contentElement.find('#ctl00_cphRoblox_ThreadView1_ctl00_Search').parent().remove();
		
		var pageContent = $('<div />').attr('id', contentElement.attr('id'));
		contentElement.find('> table > tbody > tr > td').filter(function() {
			return $.trim($(this).text()).length > 0;
		}).each(function() {
			pageContent.append($('<div />').append($(this).contents()));
		});
		contentElement.replaceWith(pageContent);
		
		$('#ctl00_cphRoblox_RightColumn, #ctl00_cphRoblox_LeftColumn').hide();
		console.log("replaced");
	}*/
}); });
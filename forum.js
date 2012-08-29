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

chrome.extension.sendRequest({action: 'all'}, function(data) {
var options = data.options;
var templates = data.templates;
var scraper = new Scraper(options);

var inject = function(code) {
	var injected = document.createElement('script');
	injected.innerHTML = code;
	document.documentElement.appendChild(injected);
}

$(function() {
	$('html').addClass('RFE');
	if(options.fixedWidth) $('html').addClass('fixed-width');
	var submenu;
	var breadcrumb;
	
	var footer;

	$('#AdvertisingLeaderboard').remove();
	$('#ctl00_Announcement').insertBefore('#Container');
	
	var body = $('#Body');
	body.removeAttr('id');
	$(window).load(function() { setTimeout(function() { body.attr('id', 'Body'); }, 1) });
	
	(function makeNavigation() {
		$('#SmallHeaderContainer').prependTo('#Header');
		$.template("navigationTemplate", templates.navigation.default);
		
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
		
		$('.mySubmenuFixed.Redesign').replaceWith(
			$.tmpl('navigationTemplate', {
				breadcrumb: data,
				optionsPage: chrome.extension.getURL('fancy-settings/source/index.html')
			})
		);
		$('.forceSpaceUnderSubmenu').removeAttr('style').height('65px');
		$('.forceSpace').remove();

		var title = document.title = data.map(function(item) { return item.name; }).reverse().join(' | ');
		inject('setTimeout(function() {ChatBar.PageTitle = '+JSON.stringify(title) + ';}, 20);');
	})();
	
	inject('setTimeout(function() {annoyingResize = $(window).data(\'events\').resize[0].handler; $(window).off(\'resize\', annoyingResize); }, 20);');

	var paging = (function makePagination() {
		var data = {};
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
				data.baseUrl = '?'+ this.param + '=' + $.QueryString[this.param] + '&PageIndex=';
				var info = /Page ([\d,]+) of ([\d,]+)/.exec(elem.text());
				data.at = +($.QueryString['PageIndex'] || info[1].replace(/,/g, ''));
				data.count = +info[2].replace(/,/g, '');
				elem.remove();
				return false;
			}				
		});	
		if(data.count) {
			pagination = Pagination(data.at, data.count, data.baseUrl);

			$('#ctl00_cphRoblox_CenterColumn').append(
				$('<div class="forum-footer"/>').append(
					$('<div class="content"/>').append(
						pagination
					)
				)
			);
		}
		return data
	})();
	
	if(location.pathname == '/Forum/ShowPost.aspx') {
		if($.QueryString['View'] == 'Threaded') {
			/** Threaded view */
			var thread = scraper.thread.fromThreadedView();
			
			$.template("postTemplate", templates.post.small);
			$.template("threadTemplate", templates.thread.small);
			var page = $.tmpl("threadTemplate", thread).replaceAll('#ctl00_cphRoblox_PostView1');
		}
		else {
			/** Post list */
			var thread = scraper.thread.fromListView();
			thread.page = paging.at;
			if(paging.count > 1)
				thread.more = true

			$.template("postTemplate", templates.post.default);
			$.template("pagenumberTemplate", templates.pagenumber.default);
			$.template("threadTemplate", templates.thread.default);
			var page = $.tmpl("threadTemplate", thread)
			page.replaceAll('#ctl00_cphRoblox_PostView1');

		}
		var target = paging.at + 1;
		$('body').delegate('.markdown-toggle', 'click', function() {
			$('.forum-post .post-info').each(function() {
				$(this).find('.content.markdown').toggle();
				$(this).find('.content.plaintext').toggle();
			});
		}).delegate('.show-more-posts', 'click', function() {
			var button = this;
			$.get(paging.baseUrl + target++, function(data) {
				var posts = $('#ctl00_cphRoblox_PostView1_ctl00_PostList', data);
				posts = scraper.posts.fromListView(posts);
				$.tmpl("postTemplate", posts).insertBefore(button);
			});
		});
		if(options.infiniteScroll) {
			//$('.forum-footer').remove();
			$(window).scroll(function() {
				if ($(window).scrollTop() == $(document).height() - $(window).height() && target <= paging.count) {
					$.get(paging.baseUrl + target++, function(data) {
						var posts = $('#ctl00_cphRoblox_PostView1_ctl00_PostList', data);
						posts = scraper.posts.fromListView(posts);
						$('<div/>', {
							id: 'page-' + (target - 1),
							'class': 'page'
						}).append(
							$.tmpl("pagenumberTemplate", {n: target - 1}),
							$.tmpl("postTemplate", posts)
						).appendTo('.posts');
						if(target > paging.count) $('.loading-more-posts').remove();
					});
				}
			});
		}
		else {
			$('.loading-more-posts').remove();
		}

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
				$('<div />').addClass('forum-post-content').addClass('markdown').append(
					scraper.markdownText(scraper.getRawText(message))
				),
				$('<div />').addClass('forum-post-actions').append(actions)
			)
		}
		else {
			$.template('newFormTemplate', templates.newForm.default);
			$.tmpl("newFormTemplate", {
				message: $('#ctl00_cphRoblox_Createeditpost1_PostForm_PostBody').val(),
				title: $('#ctl00_cphRoblox_Createeditpost1_PostForm_PostSubject').val()
			}).replaceAll($('#ctl00_cphRoblox_Createeditpost1_PostForm_PostSubject').closest('table'));
            var editor1 = new Markdown.Editor(scraper.markdownConverter);
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
				
				message = scraper.getRawText(message);
				if($.QueryString['quote']) {
					var reply = newPost;
					reply.val('> '+ message.split('\n').join('\n> ') + '\n\n' + reply.val());
					
					setTimeout(function() {
						reply.focus();
						reply.get(0).setSelectionRange(reply.val().length, reply.val().length);
						reply.scrollTop(999999);
					}, 1);
				}
				message = scraper.markdownText(message)
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
			var buttons = $.tmpl($.template(null, templates.postButtons.default), {});
			table.detach()
				.find('table').css('margin', 'auto')
					.find('tr').filter(function() {return !$.trim($(this).text()); }).remove();
			$('#ctl00_cphRoblox_Createeditpost1').empty().append(table, buttons);
		}
	}
	else if(location.pathname == '/Forum/ShowForum.aspx') {
		var threadTable =  $('#ctl00_cphRoblox_ThreadView1_ctl00_ThreadList');
		threadTable.find('tr:last').remove();
		$.template("forumTemplate", templates.forum.default);
		var page = $.tmpl("forumTemplate", {
			id: $.QueryString['ForumID'],
			threads: threadTable.parent().html()
		}).replaceAll('#ctl00_cphRoblox_ThreadView1');
	}
	
	$('#ctl00_cphRoblox_ThreadView1_ctl00_ThreadList')
		.add('#ctl00_cphRoblox_MyForums1_ctl00_ParticipatedThreads')
		.add('#ctl00_cphRoblox_MyForums1_ctl00_ThreadTracking')
		.find('tr').each(function() {
			var dateBox = $(this).find('td').eq(5).find('span');
			if(dateBox.length == 0) return;
			
			var date = scraper.getDate(dateBox.text().replace(/\s*by\s*/i,''));
			
			if(date) dateBox.empty().append('<time title="'+date+'" datetime="'+date+'">'+prettyDate(date)+'</time><br />');
		});
		
	var forumstuff = $('#ctl00_cphRoblox_CenterColumn');
	forumstuff.children('br, p').remove();
	
	if(options.enlargeForum) forumstuff.remove().contents().appendTo(body.empty());
	else forumstuff.siblings().removeAttr('width').filter(function() { return $(this).text().match(/^\s+$/g); }).remove();

	if(options.removeFooter) $('#Footer').remove();

	//Shift chat up off the footer
	var footer = $('.forum-footer .content');
	if(footer) footer.append($('#ChatContainer').addClass('shifted'));

	//Fix location.hash scroll failiure
	$(window).on('hashchange', function() { var e = $(location.hash); if(e) { $(This).scrollTop(e.offset().top - 100); return false; } });

	//Fix page resizing
	inject('setTimeout(function() {alert(2) }, 20);');
}); });
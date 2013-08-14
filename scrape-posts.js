function prettyDate(date){
	if(!date)
		return;

	var diff = (((new Date()).getTime() - date.getTime()) / 1000),
		day_diff = Math.floor(diff / 86400);

	if ( isNaN(day_diff) )
		return;

	else if(day_diff < 0)
		return "ERROR!";

	return day_diff == 0 && (
			diff < 60 && "just now" ||
			diff < 120 && "1 minute ago" ||
			diff < 3600 && Math.floor( diff / 60 ) + " minutes ago" ||
			diff < 7200 && "1 hour ago" ||
			diff < 86400 && Math.floor( diff / 3600 ) + " hours ago"
		) ||
		day_diff == 1 && "Yesterday" ||
		day_diff < 7 && day_diff + " days ago" ||
		day_diff < 14 && "1 week ago" ||
		day_diff < 31 && Math.ceil( day_diff / 7 ) + " weeks ago" ||
		date.toString('dd MMM yyyy');
}

Scraper = function(options) {
	var $this = this;
	var converter = this.markdownConverter = Markdown.getSanitizingConverter();

	if(options.disableImages)
		converter.hooks.chain('imageRender', function() {
			return "http://t4ak.roblox.com/p1-unapprove-110x110.Jpeg";
		});

	this.getRawText = function(robloxElem) {
		return robloxElem.find('br').replaceWith('\n').end().text().replace(/\u200b/g, '');
	};

	this.getDate = function(date) {
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
		//date += ' -800';
		date += ' -700';
		//Today?
		if(/today @/i.test(date))
			date = Date.parse(date.replace(/today @/i, ''));
		else
			date = Date.parseExact(date, 'MM-dd-yyyy H:mm zzz'); //'dd MMM yyyy HH:mm zzz';

		return date;
	};

	this.markdownText = function(plainText) {
		plainText = plainText
			//Replace nbsps
			.replace(/\u00a0/g, " ")
			// Turn all line breaks into markup format for backwards compatibility
			// TODO: Add special character to distinguish markdown posts
			.replace(/\n([^\n])/g, '  \n$1');

		return converter.makeHtml(plainText);
	};

	this.posts = {
		fromListView: function(table) {
			return (
			table.children('tbody').children()
				.slice(2, -1) //Exclude headers and footer
				.map(function() {
					var data = {};


					var userContainer = $(this).children('td').eq(0);
					var rows = userContainer.find('td');
					data.user = {
						name:    rows.eq(0).find('.normalTextSmallBold').text(),
						online:  /online/i.test(rows.eq(0).find('img').attr('src')),
						details: rows.filter(function(i) {return i > 1 && !$(this).html().match('&nbsp;') }).map(function() { return $(this).html(); }).get()
					};


					var info = $(this).children('td').eq(1).find('td');
					var heading = info.eq(0);


					data.id            = +heading.find('a').attr('name');
					data.locked        = info.eq(4).find('a[href^="/Forum/AddPost.aspx"]').size() == 0;
					data.title         = heading.children('span').eq(0).text();
					//data.date          = $.trim(heading.find('a span').eq(1).text());
					data.date          = $.trim(heading.find('span').last().text());
					data.ownerPage     = location.href;

					data.content       = $this.getRawText(info.eq(1).children('span'));
					data.markedContent = $this.markdownText(data.content);

					var tryParse       = $this.getDate(data.date);
					data.date          = tryParse || data.date;
					data.dateString    = tryParse ? prettyDate(tryParse) : tryParse; //data.date.toString('dd MMM yyyy @ hh:mm tt'); //

					return data;
				})
				.get()
			)
		}
	};

	this.thread = {
		fromListView: function() {
			return {
				posts: $this.posts.fromListView($('#ctl00_cphRoblox_PostView1_ctl00_PostList')),
				tracked: $('#ctl00_cphRoblox_PostView1_ctl00_TrackThread').prop('checked')
			};
		},
		fromThreadedView: function() {
			var theThread = $('#ctl00_cphRoblox_PostView1_ctl01_ThreadView');

			var stack = [];
			var data = theThread.children('table').map(function() {
				var header = $(this).find('td.threadTitle');
				if(header.length) {
					var data = {};

					var postAnchor = header.find('a[name]');

					data.title = postAnchor.find('span').first().text();
					data.id = +postAnchor.attr('name');
					data.author = header.find('a[href]').first().text();
					data.date =header.find('td > span').first().text();
					data.replies = [];
					data.level = header.prev().text().length / 6;
					data.ownerPage = location.href;

					data.content = $this.getRawText($(this).find('td.forumRow'));
					data.markedContent = $this.markdownText(data.content);

					var tryParse = $this.getDate(data.date);
					data.date = tryParse || data.date;
					data.dateString = tryParse ? prettyDate(tryParse) : tryParse; //data.date.toString('dd MMM yyyy @ hh:mm tt'); //

					return data;
				}
				else {
					var indentLevel = $(this).find('td').eq(0).text().length / 6;
					var elems = $(this).find('img').nextAll();
					return {
						title: elems.eq(0).text(),
						author: elems.eq(1).text(),
						date: elems.eq(2).text(),
						replies: [],
						level: indentLevel
					}
				}
			}).each(function() {
			    stack[this.level] = this;
			    if(this.level > 0)
			        stack[this.level - 1].replies.push(this);
				delete this.level;
			});

			return {
				posts: [stack[0]],
				tracked: $('#ctl00_cphRoblox_PostView1_ctl01_TrackThread').prop('checked')
			};
		}
	}
}

Pagination = function(at, to, baseUrl) {


	var pagination = $('<div />').addClass('forum-pagination');

	var pages = [1];
	for(var p = Math.max(at - 3, 2); p <= Math.min(at + 3, to - 1); p++)
		pages.push(p);
	if(to != 1) pages.push(to);

	var last = 0;
	$.each(pages, function(_, i) {
		if(i - 1 != last) $('<span />', { text: '...', class: 'page-gap'                     }).appendTo(pagination);
		if(at == i)       $('<span />', { text: i,     class: 'page-link current'            }).appendTo(pagination);
		else              $('<a />',    { text: i,     class: 'page-link', href: baseUrl + i }).appendTo(pagination);

		last = i;
	});
	return pagination;
}

/*
chrome.extension.sendRequest({action: 'getTemplates'}, function(t) {
	console.log(t);
	$.template("postTemplate", t.post);
	$.template("threadTemplate", t.thread);
	$(function() {
		$.tmpl("threadTemplate", getThread()).replaceAll('#ctl00_cphRoblox_PostView1_ctl00_PostList');
	});
});*/
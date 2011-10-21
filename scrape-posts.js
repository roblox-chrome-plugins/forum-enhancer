function prettyDate(date){
	if(!date)
		return;

	var diff = (((new Date()).getTime() - date.getTime()) / 1000),
		day_diff = Math.floor(diff / 86400);
			
	if ( isNaN(day_diff) || day_diff < 0)
		return;
			
	return day_diff == 0 && (
			diff < 60 && "just now" ||
			diff < 120 && "1 minute ago" ||
			diff < 3600 && Math.floor( diff / 60 ) + " minutes ago" ||
			diff < 7200 && "1 hour ago" ||
			diff < 86400 && Math.floor( diff / 3600 ) + " hours ago") ||
		day_diff == 1 && "Yesterday" ||
		day_diff < 7 && day_diff + " days ago" ||
		day_diff < 31 && Math.ceil( day_diff / 7 ) + " weeks ago" ||
			date.toString('dd MMM yyyy')
		;
}

function getRawText(robloxElem) {
	return robloxElem.find('br').replaceWith('\n').end().text().replace(/\u200b/g, '');
}

var converter = Markdown.getSanitizingConverter();
function markdownText(plainText) {
	plainText = plainText
		//Replace nbsps
		.replace(/\u00a0/g, " ")
		// Turn all line breaks into markup format for backwards compatibility
		// TODO: Add special character to distinguish markdown posts
		.replace(/\n([^\n])/g, '  \n$1');
		
	return converter.makeHtml(plainText);
}


function getThread() {
	var table = $('#ctl00_cphRoblox_PostView1_ctl00_PostList');
	var postData = table.children('tbody').children().slice(2, -1).map(function() {
		var data = {};
		
		
		var userContainer = $(this).children('td').eq(0);
		var rows = userContainer.find('td');
		data.user = {
			name: rows.eq(0).find('.normalTextSmallBold').text(),
			online: /online/i.test(rows.eq(0).find('img').attr('src')),
			details: rows.filter(function(i) {return i > 1 && !$(this).html().match('&nbsp;') }).map(function() { return $(this).html(); }).get()
		};
		
		
		var info = $(this).children('td').eq(1).find('td');
		var heading = info.eq(0);
		
		
		data.id = +heading.find('a').attr('name');
		data.locked = info.eq(4).find('a[href^="/Forum/AddPost.aspx"]').size() == 0;
		data.title = heading.children('span').eq(0).text();
		data.date = $.trim(heading.find('a span').eq(1).text());
		data.ownerPage = location.href;
		data.content = getRawText(info.eq(1).children('span'));
		data.markedContent = markdownText(data.content);
		
		data.date = parseRobloxDate(data.date);
		data.dateString = prettyDate(data.date); //data.date.toString('dd MMM yyyy @ hh:mm tt'); //
		
		return data;
	}).get();

	var threadData = {
		posts: postData,
		tracked: $('#ctl00_cphRoblox_PostView1_ctl00_TrackThread').prop('checked')
	};
	
	return threadData;
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
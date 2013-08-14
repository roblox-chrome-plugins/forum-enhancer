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

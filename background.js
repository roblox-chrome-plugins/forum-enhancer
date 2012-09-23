
var settings = new Store("settings", {
	disableImages: false,
	disableLinks: false,
	enlargeForum: true,
	removeFooter: true,
	infiniteScroll: true,
	postLayout: 'old',
	filterImages: 'roblox'
});

function getVersion() {
    var details = chrome.app.getDetails();
    return details.version;
}

chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
	if (request.action == 'getOptions') {
		sendResponse(settings.toObject());
	} else if(request.action == 'getTemplates') {
		var templates = document.querySelectorAll('#templates > div');
		var toSend = {};
		
		for (var i = 0; i < templates.length; i++) {
			var name = templates[i].getAttribute('data-name');
			var theme = templates[i].getAttribute('data-theme') || 'default';
			if(toSend[name] == null)
				toSend[name] = {};

			toSend[name][theme] = templates[i].innerHTML;
		}
		
		sendResponse(toSend);
	} else {
		var templates = document.querySelectorAll('#templates > div');
		var toSend = {};
		
		for (var i = 0; i < templates.length; i++) {
			var name = templates[i].getAttribute('data-name');
			var theme = templates[i].getAttribute('data-theme') || 'default';
			if(toSend[name] == null)
				toSend[name] = {};

			toSend[name][theme] = templates[i].innerHTML;
		}
		
		sendResponse({options: settings.toObject(), templates: toSend, version: getVersion()});
	}
});
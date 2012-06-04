// SAMPLE
this.manifest = {
	"name": "Roblox Forum Enhancer",
	"icon": "../../icon.ico",
	"settings": [
		{
			"tab": "Markdown",
			"group": "Disable",
			"name": "disableImages",
			"type": "checkbox",
			"label": "Images"
		},
		{
			"tab": "Markdown",
			"group": "Disable",
			"name": "disableLinks",
			"type": "checkbox",
			"label": "Links"
		},/*
		{
			"tab": "Markdown",
			"group": "Custom styles",
			"name": "customMarkdownCSS",
			"type": "textarea",
			"label": "Enter your CSS here"
		},*/
		{
			"tab": "Markdown",
			"group": "Help",
			"type": "description",
			"text": 'Want some help with the markdown syntax? Head off to the <a href="http://daringfireball.net/projects/markdown/syntax">markdown syntax documentation</a>!'
		},/*
		{
			"tab": "Forum Appearance",
			"group": "Navigation",
			"name": "showBreadcrumb",
			"type": "checkbox",
			"label": "Show the breadcrumb in the navigation bar"
		},
		{
			"tab": "Forum Appearance",
			"group": "Navigation",
			"name": "showSearch",
			"type": "checkbox",
			"label": "Show the search box in the navigation bar"
		},
		{
			"tab": "Forum Appearance",
			"group": "Navigation",
			"name": "showTwice",
			"type": "checkbox",
			"label": "Show the navigation bar at the top and bottom of each page"
		},*/
		{
			"tab": "Forum Appearance",
			"group": "More options",
			"name": "enlargeForum",
			"type": "checkbox",
			"label": "Hide the advertisements at the side"
		},
		{
			"tab": "Forum Appearance",
			"group": "More options",
			"name": "removeFooter",
			"type": "checkbox",
			"label": "Remove the page footer"
		},
		{
			"tab": "Forum Appearance",
			"group": "More options",
			"name": "removeFooter",
			"type": "checkbox",
			"label": "Remove the page footer"
		},
		{
			"tab": "Forum Appearance",
			"group": "More options",
			"name": "fixedWidth",
			"type": "checkbox",
			"label": "Prevent the page sizing to the width of the screen - limit it to 900px"
		},
		{
			"tab": "Forum Appearance",
			"group": "Forum Style",
			"name": "post-layout",
			"type": "radioButtons",
			"label": "Post layout:",
			"options": [
				["old", "Standard layout"],
			]
		}/*
		{
			"tab": "Forum Appearance",
			"group": "More options",
			"name": "rearrangeUsers",
			"type": "radioButtons",
			"label": "Change the layout of the user box",
			"options": [
				[false, "Standard arrangement"],
				["wide", "Short and wide"],
				["small", "Reduced avatars"]
			]
		}*//*,
		{
			"tab": i18n.get("information"),
			"group": i18n.get("login"),
			"name": "myDescription",
			"type": "description",
			"text": i18n.get("description")
		},
		{
			"tab": i18n.get("information"),
			"group": i18n.get("logout"),
			"name": "myCheckbox",
			"type": "checkbox",
			"label": i18n.get("enable")
		},
		{
			"tab": i18n.get("information"),
			"group": i18n.get("logout"),
			"name": "myButton",
			"type": "button",
			"label": i18n.get("disconnect"),
			"text": i18n.get("logout")
		},
		{
			"tab": "Details",
			"group": "Sound",
			"name": "noti_volume",
			"type": "slider",
			"label": "Notification volume:",
			"max": 1,
			"min": 0,
			"step": 0.01,
			"display": true,
			"displayModifier": function (value) {
				return (value * 100).floor() + "%";
			}
		},
		{
			"tab": "Details",
			"group": "Sound",
			"name": "sound_volume",
			"type": "slider",
			"label": "Sound volume:",
			"max": 100,
			"min": 0,
			"step": 1,
			"display": true,
			"displayModifier": function (value) {
				return value + "%";
			}
		},
		{
			"tab": "Details",
			"group": "Food",
			"name": "myPopupButton",
			"type": "popupButton",
			"label": "Soup 1 should be:",
			"options": [
				["hot", "Hot and yummy"],
				["cold"]
			]
		},
		{
			"tab": "Details",
			"group": "Food",
			"name": "myListBox",
			"type": "listBox",
			"label": "Soup 2 should be:",
			"options": [
				["hot", "Hot and yummy"],
				["cold"]
			]
		},
		{
			"tab": "Details",
			"group": "Food",
			"name": "myRadioButtons",
			"type": "radioButtons",
			"label": "Soup 3 should be:",
			"options": [
				["hot", "Hot and yummy"],
				["cold"]
			]
		}*/
	],
	"alignment": [
	]
};

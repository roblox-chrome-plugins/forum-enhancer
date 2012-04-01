1.7
===

1.7.0
-----
 * Infinite scroll!

1.6
===

1.6.9
-----
 * Fixed critical regression introduced in 1.6.8

1.6.8
-----
 * Fixed bug induced by Roblox changing the template again
 * Footer now removed by default - can be changed in the options page
 * Subheading now correctly sticks/slides with page
 * Pagination optimized - should run faster on large forums now

1.6.6
-----
 * Updated to match new layout - sticky header
 * Bottom breadcrumb removed

1.6.5
-----
 * Fixed links when using www1.roblox.com or another similar subdomain
 * Bodged DST again - should probably get forum time from the main forum page.

1.6.4
-----
 * Improved Threaded view
   - No reply buttons yet
   - (Semi) intelligent nesting - don't nest a single thread of comments
 * Bodged dates to work without daylight saving times

1.6.3
-----
 * Navigation links no longer flow over "Toggle Markdown"
 * Breadcrumb duplicated at the bottom
 * Data-urls removed now that [chromium bug 39899](http://crbug.com/39899) is resolved
 * [Changelog](chrome-extension://kcpdfglmclgjedmjhiakmmgkcibkimod/Changelog.md) added

1.6.2
-----
 * Roblox Studio -style syntax highlighting
 
1.6.1
-----
 * "Do not allow replies to this post" tickbox put back

1.6.0
-----
 * New markdown parser - PageDown - as used by Stack Overflow
   - Inline link parsing, such as http://roblox.com/
   - Parses basic HTML (still preferable to use markdown), e.g. super <?sup>script<?/sup>
     - HTML is automatically ZWSP split to allow posting it
   - **WYSIWYM (What You See Is What You Mean) markdown editor**
 * More minor UI tweaks
 * Fixed line wrapping bug
 
1.5
===
1.5.15
------
 * No more ad-induced crashes
 * Times starting with 0s are not ignored
 * Shuffle around on new post page
 * Moderator/top posted images copied across correctly

1.5.14
------
 * Dates now work at AM/PM boundaries
 * Thread list page is tidied up
 * Settings page link added to navigation


1.5.11
------
 * Fixed that goddam "Track" bug

1.5.5
-----
 * Top area of post view cleaned up
 * Toggle Markdown button added

1.5.3
-----
 * "12 PM" is now correctly parsed as "12 AM"
 * Dates older than 1 month are now actually visible
 * Relative times are extended to the MyForums and thread list pages

1.5.1
-----
 * Rewrite to use templates for thread view
   - No longer uses tables in thread view!
 * Tweaks in the user box in thread view
 * Shorter post heading
 * Dates in thread view are in the users time zone
   - And are displayed relative to the current time.
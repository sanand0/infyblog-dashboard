var toInfyDB,
    strUserName,
    intTimeout = 600000;

var intFrPg   = 0,
    intCmPg   = 0,
    intUpPg   = 0,
    intFrMax  = 6,
    intCmMax  = 5,
    intUpMax  = 8;

// var hosted_at = "http://infyblog-dashboard.googlecode.com/svn/trunk/";
var hosted_at = "http://www.s-anand.net/";
var now = new Date();

var fnOnLoadDom = function(callback) {

/*--------- Loading jQuery js file ---------*/

	var objHead   = document.getElementsByTagName('head')[0],
	elmScript     = document.createElement('script');

	elmScript.setAttribute('src','http://ajax.googleapis.com/ajax/libs/jquery/1.3.1/jquery.min.js');
	objHead.appendChild(elmScript);

/*--------- Loading jTip js file ---------*/
	elmScript = document.createElement('script');
	elmScript.setAttribute('src',hosted_at + 'jquery.jtip.js');
	objHead.appendChild(elmScript);

	elmScript.onload = elmScript.onreadystatechange = function(){
		if ( !this.readyState || this.readyState == 'loaded' || this.readyState == 'complete' ) {
			callback();
		}
	};
};

/*--------- Create the dashboard ---------*/
var fnInitialize = function() {
	/*--------- Ensure that the user is on infyblogs ---------*/
	if (location.host != 'blogs' && location.host != 'blogs.ad.infosys.com') {
		var notice = $('<div>This bookmarklet works only at <a href="http://blogs.ad.infosys.com/">blogs.ad.infosys.com</a></div>')
			.css({
				position: 'absolute',
				width: '200',
				margin: '0 auto',
				top: 0,
				left: '40%',
				padding: '5px 10px',
				backgroundColor: '#f99',
				font: '14px sans-serif',
				textAlign: 'center'
			})
			.appendTo($('body'));
		$('html,body').animate({scrollTop: 0}, {complete: function() { setTimeout(function() { notice.fadeOut(4000); }, 2000); } });
		return;
	}
	/*--------- Ensure that the user is logged in infyblogs ---------*/
	var blnSign = false;
	if (typeof $('#navAlpha a[href="/login.bml"]') === 'undefined') blnSign = false;
	else
		if ($('#navAlpha a[href="/login.bml"]').length > 0) blnSign = true;
	if (blnSign) {
		var loginN = $('<div>This bookmarklet works only when you login.<br/>Please login to the InfyBLOGS</div>')
			.css({
				position: 'absolute',
				width: '200',
				margin: '0 auto',
				top: 0,
				left: '40%',
				padding: '5px 10px',
				backgroundColor: '#f99',
				font: '14px sans-serif',
				textAlign: 'center'
			})
			.appendTo($('#header'));
		$('html,body').animate({scrollTop: 0}, {complete: function() { setTimeout(function() { loginN.fadeOut(4000); }, 2000); } });
		return;
	}

	/*--------- Show placeholders ---------*/
	$('head,body').empty();
	document.title = "InfyBLOGS Dashboard";

	$('head').append('<link rel="stylesheet" href="' + hosted_at + 'infyblog-dashboard.css"/>');
	$('head').append('<link rel="stylesheet" href="' + hosted_at + 'jquery.jtip.css"/>');

	/*--------- common functions to create the title bar and content bar for the divs ---------*/
	var placeholder = function(id) { return '<div id="' + id + '" class="placeholder"><img src="' + hosted_at + 'loading-white.gif"></div>'; },
	    table_head  = function(hd) { return '<div class="heading"><div class="entryCol">' + hd + '</div><div class="userCol">Who</div><div class="timeCol">When</div></div><hr>'; },

	    comments             = table_head('Recent comments for you'     ) + placeholder('comments'),
	    entries_from_friends = table_head('Recent entries by friends'   ) + placeholder('friends'),
	    entries_from_all     = ['<div class="grid_3 alpha"><div class="heading"><div class="entryCol">Recent entries from all</div></div><hr>', placeholder('entries_from_all'), '</div>'].join(''),
	    community            = ['<div class="grid_3 omega"><div class="heading"><div class="entryCol">Recently updated communities</div></div><hr>', placeholder('community'), '</div>'].join(''),
	    recently_created     = ['<div class="grid_3 alpha"><div class="heading"><div class="entryCol">Recently created journals</div></div><hr>', placeholder('recently_created'), '</div>'].join(''),
	    demographics         = ['<div class="grid_3 omega"><div class="heading"><div class="entryCol">Age demographics</div></div><hr>', placeholder('demographics'), '</div>'].join(''),

	    your_statistics      = ['<div class="heading"><div class="entryCol">Your statistics</div></div><hr><div class="placeholder">',
	                            '<div class="grid_3 alpha half_block"><div id="num_entries"       class="bignum">&nbsp;</div><a target="_blank" class="stats_header" href="/editjournal.bml"          >journal entries</a><div class="stats_details">Updated <span id="last_updated"></span></div></div>',
	                            '<div class="grid_3 omega half_block"><div id="num_friends"       class="bignum">&nbsp;</div><a target="_blank" class="stats_header friends_link" href=""             >friends        </a><div class="stats_details" id="list_friends"></div></div>',
	                            '<div class="grid_3 alpha half_block"><div id="num_interests"     class="bignum">&nbsp;</div><a target="_blank" class="stats_header" href="/interests.bml"            >interests      </a><div class="stats_details" id="list_interests"></div></div>',
	                            '<div class="grid_3 omega half_block"><div id="num_followers"     class="bignum">&nbsp;</div><a target="_blank" class="stats_header" href="/userinfo.bml?mode=full"   >followers      </a><div class="stats_details" id="list_followers"></div></div>',
	                            '<div class="grid_3 alpha half_block"><div id="comments_received" class="bignum">&nbsp;</div><a target="_blank" class="stats_header" href="/tools/recent_comments.bml#received">comments<br>received</a></div>',
	                            '<div class="grid_3 omega half_block"><div id="comments_posted"   class="bignum">&nbsp;</div><a target="_blank" class="stats_header" href="/tools/recent_comments.bml#posted">comments<br>posted</a></div>',
	                            '</div>'
	                           ].join(''),
	    infyblog_statistics  = ['<div class="grid_6"><div class="heading"><div class="entryCol">Infyblog statistics</div></div><hr><div class="placeholder">',
	                            '<div class="grid_3 alpha half_block"><div id="num_visits" class="bignum">&nbsp;</div><div class="chart chart_visitors"   ></div><a target="_blank" class="stats_header usage" href="">visitors </a><div class="stats_details">per day   </div></div>',
	                            '<div class="grid_3 omega half_block"><div id="page_visit" class="bignum">&nbsp;</div><div class="chart chart_page_visit" ></div><a target="_blank" class="stats_header usage" href="">pages    </a><div class="stats_details">per visit </div></div>',
	                            '<div class="grid_3 alpha half_block"><div id="num_sites"  class="bignum">&nbsp;</div><div class="chart chart_sites"      ></div><a target="_blank" class="stats_header usage" href="">sites    </a><div class="stats_details">per day   </div></div>',
	                            '<div class="grid_3 omega half_block"><div id="site_visit" class="bignum">&nbsp;</div><div class="chart chart_site_visit" ></div><a target="_blank" class="stats_header usage" href="">sites    </a><div class="stats_details">per visit </div></div>',
	                            '<div class="grid_3 alpha half_block"><div id="num_mb"     class="bignum">&nbsp;</div><div class="chart chart_mb"         ></div><a target="_blank" class="stats_header usage" href="">MB       </a><div class="stats_details">per day   </div></div>',
	                            '<div class="grid_3 omega half_block"><div id="mb_page"    class="bignum">&nbsp;</div><div class="chart chart_mb_page"    ></div><a target="_blank" class="stats_header usage" href="">KB       </a><div class="stats_details">per page</div></div>',
	                            '</div></div>'].join(''),
	    referer_links        = '<div class="grid_3 omega"><div class="heading"><div class="entryCol">Popular referrers</div></div><hr>' + placeholder('referer_links') + '</div>',
	    popular_links        = '<div class="grid_3 alpha"><div class="heading"><div class="entryCol">Popular links recently</div></div><hr>' + placeholder('popular_links') + '</div>',
	    help                 = ['<div class="heading"><div class="entryCol">Links and help</div></div><hr>',
	                            '<div class="grid_2 alpha"><div class="row"><a href="/support/faq.bml">FAQ</a></div>',
	                            '<div class="row"><a target="_blank" href="/support/">Help</a></div>',
	                            '<div class="row"><a target="_blank" href="/directory.bml?com_do=1">Communities</a></div>',
	                            '<div class="row"><a target="_blank" href="/sixdegrees.bml">Six degrees</a></div>',
	                            '<div class="row"><a target="_blank" href="/featured.bml">Featured blogs</a></div>',
	                            '<div class="row"><a target="_blank" href="/usage">Usage statistics</a></div>',
	                            '<div class="row"><a target="_blank" href="/stats.bml">General statistics</a></div>',
	                            '<div class="row"><a target="_blank" href="/usagepolicy.bml">Usage policy</a></div>',
	                            '</div><div class="grid_2">',
	                            '<div class="row"><a target="_blank" href="http://wiki.ad.infosys.com/InfyBLOGs/InfyBloggers">On InfyBlogging</a></div>',
	                            '<div class="row"><a target="_blank" href="http://wiki.ad.infosys.com/InfyBLOGs/Starter%27s_guide">Starter\'s Guide</a></div>',
	                            '<div class="row"><a target="_blank" href="http://wiki.ad.infosys.com/InfyBLOGs/Tips">Tips</a></div>',
	                            '<div class="row"><a target="_blank" href="http://wiki.ad.infosys.com/InfyBLOGs/Advanced_Customization">Advanced Customisation</a></div>',
	                            '<div class="row"><a target="_blank" href="http://wiki.ad.infosys.com/InfyBLOGs/Meetups">Meetups</a></div>',
	                            '<div class="row"><a target="_blank" href="http://wiki.ad.infosys.com/InfyBLOGs/Awards/2008">2008 InfyBlogger awards</a></div>',
	                            '<div class="row"><a target="_blank" href="http://wiki.ad.infosys.com/InfyBLOGs/Suggestions">Your suggestions</a></div>',
	                            '</div><div class="grid_2 omega">',
	                            '<div class="row"><a target="_blank" href="/users/rpraveen/21159.html">Friends blog widget</a></div>',
	                            '<div class="row"><a target="_blank" href="/users/utkarshraj_atmaram/97332.html">Analyzing InfyBLOGs</a></div>',
	                            '<div class="row"><a target="_blank" href="/users/utkarshraj_atmaram/97662.html">Counting # of hits</a></div>',
	                            '<div class="row"><a target="_blank" href="/subramanian_anand/155873.html">Crawling InfyBLOGs</a></div>',
	                            '<div class="row"><a target="_blank" href="http://www.s-anand.net/reco">Find new friends</a></div>',
	                            '<div class="row"><a target="_blank" href="http://www.livejournal.com/doc/server/ljp.csp.xml-rpc.protocol.html">XML-RPC API</a></div>'
	                           ].join('');

	$('body').html(['<div class="container_12"><div class="grid_12"><div class="divNewEn"><a href="/update.bml" target="_blank" id="ancNew">New entry</a></div><h1>InfyBLOGS <span id="my_name"></span></h1></div>',
	                '<div class="grid_6">', comments, entries_from_friends, entries_from_all, community, popular_links, referer_links, '</div>',
	                '<div class="grid_6">', your_statistics, infyblog_statistics, recently_created, demographics, help, '</div>',
	                '</div>'].join(''));

	/*--------- Not much data changes so we load the data only once ---------*/
	fnLoadStatic();

	/*--------- All the happening data, so we reload this every 10mins ---------*/
	fnLoadDynamic();
};

var fnLoadStatic = function(){

	/*--------- Get blogs usage and referrers using iframes ---------*/
	var usage_url = '/usage/';
	$('<iframe class="hiddenframe" src="' + usage_url + '"></iframe>').appendTo('body').load(function() {
		var doc    = $(this).contents(),
		    trs    = doc.find('table:eq(0) tr'),
		    visits = trs.find('td:eq(4)').map(function() { return +$(this).text(); }).get(),
		    pages  = trs.find('td:eq(3)').map(function() { return +$(this).text(); }).get(),
		    sites  = trs.find('td:eq(5)').map(function() { return +$(this).text(); }).get(),
		    mb     = trs.find('td:eq(6)').map(function() { return Math.round(+$(this).text()/30000); }).get();
		mb[0] = Math.round(mb[0] * 30 / now.getDate()); // The first entry is for the current month, so we need to divide by today's date to get MB / day
		for (var page_visit=[], site_visit=[], mb_page=[], i=0, l=pages.length; i<l; i++) {
			page_visit[i] = pages[i] / visits[i];
			site_visit[i] = sites[i] / visits[i];
			mb_page[i]    =    mb[i] / pages[i];
		}
		$('#num_visits'      ).html(visits[0]);
		$('#num_sites'       ).html(sites[0]);
		$('#num_mb'          ).html(mb[0]);
		$('#page_visit'      ).html(parseInt(pages[0] / visits[0] * 10, 10) / 10);
		$('#site_visit'      ).html(parseInt(sites[0] / visits[0] * 10, 10) / 10);
		$('#mb_page'         ).html(parseInt(mb[0]    / pages[0] * 10000, 10) / 10);
		$('.chart_visitors'  ).html(fnGenChart(visits.reverse()));
		$('.chart_sites'     ).html(fnGenChart(sites.reverse()));
		$('.chart_mb'        ).html(fnGenChart(mb.reverse()));
		$('.chart_page_visit').html(fnGenChart(page_visit.reverse()));
		$('.chart_site_visit').html(fnGenChart(site_visit.reverse()));
		$('.chart_mb_page'   ).html(fnGenChart(mb_page.reverse()));

		$('.usage').attr('href', usage_url);

		var usage_url_1 = doc.find('a[href^=usage_]').eq(0).attr('href');
		$('<iframe class="hiddenframe" src="' + usage_url + usage_url_1 + '"></iframe>').appendTo('body').load(function() {
			var doc = $(this).contents();
			$('#referer_links').html(doc.find('table:eq(9) tr a').filter(function() {
				return $(this).attr('href').match(/users\/\w+\/(\d+\.html)?$/);
			}).slice(0,8).parents('tr').map(function() {
				var el   = $(this),
				    url  = el.find('a').attr('href'),
				    hits = el.find('td:eq(1)').text();
				return '<div class="pop_count">' + hits + '</div><div class="popular_url"><a target="_blank" href="' + url + '">' + fnNiceUser(url.replace('http://blogs.ad.infosys.com/users/', '').replace(/\/.*/, ''),"user") + '</a></div>';
			}).get().join('') + '<a class="more" target="_blank" href="' + $(this).attr('src') + '">View more...</a>');
		});

	});

	$('<iframe class="hiddenframe" src="/meme.bml"></iframe>').appendTo('body').load(function() {
		var doc   = $(this).contents(),
		    links = doc.find('a[href^=meme.bml]'),
		    html  = links.slice(0,8).map(function() {
		    	var el = $(this),
		    	    url = el.attr('href').replace('meme.bml?url=', '');
		    	return '<div class="link_count">' + el.text().replace(' links', '') + '</div><div class="popular_url"><a target="_blank" href="' + url + '">' + url.replace('http://', '').replace('.ad.infosys.com', '') + '</a></div>';
		    }).get().join('');
		$('#popular_links').html(html + '<a class="more" target="_blank" href="' + $(this).attr('src') + '">View more...</a>');
	});

	$('<iframe class="hiddenframe" src="/stats.bml"></iframe>').appendTo('body').load(function() {
		var doc = $(this).contents(),
		    new_journals = doc.find('h1:contains(New Journals)').nextAll('ul').eq(0).find('li');
		$('#recently_created').html(new_journals.slice(0,8).map(function() {
			var m = $(this).text().match(/(\w+), (\d+)\-(\d+)\-(\d+) (\d+):(\d+):(\d+)/),
			    user = m[1],
			    when = new Date(+m[2], +m[3]-1, +m[4], +m[5], +m[6], +m[7]);
			return '<div class="row"><div class="userCol">' + fnNiceUser(user,"user") + '</div><div class="timeCol">' + fnNiceTime(when, 1) + '</div></div>';
		}).get().join('') + '<a class="more" target="_blank" href="' + $(this).attr('src') + '">View more...</a>');

		var age_distrib  = doc.find('h1:contains(Age Distribution)').nextAll('table').eq(0).find('tr'),
		    count = age_distrib.map(function() { return $(this).find('td').eq(1).text(); }).get().join(","),
		    ages  = age_distrib.map(function() { return $(this).find('td').eq(0).text(); }).get(),
		    xl    = [ages[0], ages[Math.floor(ages.length / 2)], ages[ages.length - 1]].join('|');
		$('#demographics').html('<img src="http://chart.apis.google.com/chart?cht=ls&chs=220x132&chxt=x,y&chds=0,1000&chco=4f81bd&chxp=0,|1,&chxs=0,777777,9,0|1,777777,9,0&chg=50,50,1,3&chxl=0:|' + xl + '|1:|0|500|1000&chd=t:' + count + '">' + '<a class="more" target="_blank" href="' + $(this).attr('src') + '">View more...</a>');
	});

};

var fnLoadDynamic = function() {

	/*--------- Get user details using iframes ---------*/
	$('<iframe class="hiddenframe" src="/userinfo.bml?mode=full"></iframe>').appendTo('body').load(function() {
		var doc       = $(this).contents(),
		    my_name   = doc.find('tr').eq(1),
		    entries   = doc.find('td:contains(Journal entries:)').next(),
		    friends   = doc.find('td:contains(Friends:)'        ).next(),
		    followers = doc.find('td:contains(Also Friend of:)' ).next(),
		    interests = doc.find('td:contains(Interests:)'      ).next(),
		    comments  = doc.find('td:contains(Comments:)'       ).next(),
		    updated   = doc.find('td:contains(Date updated:)'   ).next(),
		    username      = doc.find('td:contains(User:)'       ).next().find('a').text();
		strUserName = username;
		$('#my_name'        ).html(my_name.text());
		$('#num_entries'    ).html(entries.text());
		$('#num_friends'    ).html((friends  .find('td').eq(1).text().match(/\d+/) || ['0'])[0]);
		$('#num_followers'  ).html((followers.find('b' ).text()      .match(/\d+/) || ['0'])[0]);
		$('#num_interests'  ).html((interests.find('b' ).text()      .match(/\d+/) || ['0'])[0]);
		$('#list_friends'   ).html(friends  .find('a').map(function() { return fnNiceUser(    $(this).text(),"user"); }).get().slice(0,5).join(', '));
		$('#list_followers' ).html(followers.find('a').map(function() { return fnNiceUser(    $(this).text(),"user"); }).get().slice(0,5).join(', '));
		$('#list_interests' ).html(interests.find('a').map(function() { return fnNiceInt($(this).text()); }).get().slice(0,5).join(', '));
		$('#last_updated'   ).html(updated.find('i').text());
		var m = comments.text().match(/Posted: (\d+) \- Received: (\d+)/);
		if (m) {
			$('#comments_posted'  ).html(m[1]);
			$('#comments_received').html(m[2]);
		}
		$('.friends_link').attr('href', '/users/' + username + '/friends');

	/*--------- To load friends, we need username so this can be run only when the username is generated ---------*/
		fnPgFriends();
	});

	//$('<iframe class="hiddenframe" src="/directory.bml?com_do=1"></iframe>').appendTo('body').load(function() {
	$('<iframe class="hiddenframe" src="/directory.bml?com_do=1&ut_days=7&opt_format=simple&opt_sort=ut&opt_pagesize=8"></iframe>').appendTo('body').load(function() {
		var doc   = $(this).contents(),
		    //users = doc.find('.ljuser');
		    users = doc.find('ul > a[href^=/users]');
		$('#community').html(users.slice(0,8).map(function() {
			var el = $(this);
			return '<div class="row"><div class="userCol">' + fnNiceUser(el.text(),'jTipp') + '</div><div class="timeCol">' + el.next().next().text().replace('Updated','') + '</div></div>';
		}).get().join('') + '<a class="more" target="_blank" href="' + $(this).attr('src') + '">View more...</a>');
		$('a.jTipp').hover(function(){JT_show('/customview.cgi?styleid=2403&user=' + this.href.split("/")[4],this.id,'')},function(){$('#JT').remove()});
	});

	fnPgComments();

	fnPgUpdates();

	if (typeof toInfyDB != 'undefined') clearTimeout(toInfyDB);
	toInfyDB = setTimeout(fnLoadDynamic,intTimeout);
};

var fnNiceUser = function (username, styleId) {
	var names = username.split('_');
	for (var i=0, l=names.length; i<l; i++) {
		names[i] = names[i].substring(0,1).toUpperCase() + names[i].substring(1, names[i].length);
	}
	if (styleId != 'user')
		return '<a class="' + styleId + '" id="'+ styleId + username + '" target="_blank" href="/users/' + username + '">' + names.join(' ') + '</a>';
	else
		return '<a class="' + styleId + '" target="_blank" href="/users/' + username + '">' + names.join(' ') + '</a>';
};

var fnNiceInt = function (interest) {
	return '<a class="interest" target="_blank" href="/interests.bml?int=' + interest + '">' + interest + '</a>';
};

var fnNiceTime = function (date, offset) {
	var d = (now - date) / 1000 - offset * now.getTimezoneOffset() * 60;
	return  d < 120     ? "moments ago" :
	        d < 7200    ? Math.round(d / 60   ) + " minutes ago" :
	        d < 172800  ? Math.round(d / 3600 ) + " hours ago" :
	                      Math.round(d / 86400) + " days ago";
};

var fnGenChart = function (a) {
	for (var m1=a[0], m2=a[0], i=0, l=a.length; i<l; i++) {
		if (+a[i] < m1) { m1 = +a[i]; }
		if (+a[i] > m2) { m2 = +a[i]; }
	}
	for (i=0, l=a.length; i<l; i++) { a[i] = Math.round((+a[i] - m1) / (m2 - m1) * 100); }
	return '<img src="http://chart.apis.google.com/chart?cht=ls&chs=60x24&chco=4f81bd&chd=t:' + a.join(',') + '">';
};

var fnPgComments = function() {

	/*--------- Get comments using iframes also ensure the code is ready for pagination ---------*/
	$('#comments').html('<img src="' + hosted_at + 'loading-white.gif">');
	$('<iframe class="hiddenframe" src="/tools/recent_comments.bml"></iframe>').appendTo('body').load(function() {
		var doc = $(this).contents(),
		    html = doc.find('table:eq(1) tr').slice(intCmPg * 8, (intCmPg + 1) * 8).map(function() {
		    	var el = $(this),
		    	    user         = el.find('td:eq(0) b').text(),
		    	    when         = el.find('td:eq(0)').text().replace(user, ''),
		    	    entry_link   = el.find('td:eq(1) a:contains(Entry Link)').attr('href'),
		    	    comment_link = el.find('td:eq(1) a:contains(Comment Link)').attr('href'),
		    	    comment_id   = el.find('td:eq(1) a:contains(Comment Link)').attr('href').split("#")[1],
		    	    strHTML      = el.find('td:eq(1)').html(),
		    	    comment_html = strHTML.substr(parseInt(strHTML.toLowerCase().indexOf('<br>') + 8), (strHTML.toLowerCase().indexOf('(<a',strHTML.toLowerCase().indexOf('<br>')) - strHTML.toLowerCase().indexOf('<br>') - 16)),
		    	    comment      = '<a id="' + comment_id + 'm" target="_blank" class="post" href="' + entry_link + '">' + el.find('td:eq(1)').text().replace(' (Entry Link)', '</a> : <a id="' + comment_id + '" name="' + user + '" target="_blank" class="jTipper" href="' + comment_link + '">').replace('(Comment Link) (Reply to this)', '<div class="hidden">'+ comment_html + '</div></a>');
		    	return '<div class="row"><div class="entryCol">' + comment + '</div><div class="userCol">' + fnNiceUser(user, "user") + '</div><div class="timeCol">' + when + '</div></div>';
		    }).get().join('');
		//$('#comments').html(html + '<a class="more" target="_blank" href="' + $(this).attr('src') + '">View more...</a>');
		$('#comments').html(html + '<div class="prevDiv"><a href="#" id="comPrev" text="Prev"><img src="' + hosted_at + 'prev.gif" alt="Prev"></a>&nbsp;</div><div class="nextDiv">&nbsp;<a href="#" id="comNext" text="Next"><img src="' + hosted_at + 'next.gif" alt="Next"></a></div><div align="center">Showing ' + parseInt((intCmPg * 8) + 1) + ' to ' + parseInt(((intCmPg + 1) * 8)) + ' <a class="more" target="_blank" href="' + $(this).attr('src') + '">View more...</a></div>');
		$("a.jTipper").hover(function(){JT_shower($(this).children().html(),this.id + 'm',this.name, 350)},function(){$('#JT').remove()});

		if (intCmPg < 1) $('#comPrev').hide();
		if (intCmPg > 0) $('#comPrev').show();
		if (intCmPg > intCmMax - 1) $('#comNext').hide();
		if (intCmPg < intCmMax) $('#comNext').show();
		$('a#comPrev').click(function()
		{
			if (intCmPg > 0) intCmPg--;
			fnPgComments();
			return false;
		}
		);
		$('a#comNext').click(function()
		{
			if (intCmPg < intCmMax) intCmPg++;
			fnPgComments();
			return false;
		}
		);
	});
};

var fnPgFriends = function() {

	/*--------- Get friend's posts using iframes also ensure the code is ready for pagination' ---------*/
	$('#friends').html('<img src="' + hosted_at + 'loading-white.gif">');
	$('<iframe class="hiddenframe" src="/customview.cgi?styleid=2309&user=' + strUserName + '&skip=' + (intFrPg * 8) + '"></iframe>').appendTo('body').load(function() {
		var doc  = $(this).contents(),
		    html = doc.find('.entry').slice(0,8).map(function() {
		    	var el = $(this),
		    	    user         = el.find('.author .name').text(),
		    	    when         = Date.parse(el.find('.updated').text().replace(user, '')),
		    	    content      = el.find('.content').html(),
		    	    title        = el.find('.title').text();
		    	if(typeof el.find('.permalink').attr('href') !== 'undefined')
		    	{
		    		entry_link   = el.find('.permalink').attr('href') || '/users/' + user;
		    		post_id      = el.find('.permalink').attr('href').split("/")[5].split(".")[0];
		    	}
		    	else
		    	{
		    		entry_link   = "";
		    		post_id = "";
		    	}
		    	if (title == '') title = 'No Subject';
		    	return '<div class="row"><div class="entryCol"><a name="' + title + '" id="' + post_id + '" class="jTip" id="' + entry_link + '" target="_blank" href="' + entry_link + '">' + title + '</a><div class="hidden">' + content + '</div></div><div class="userCol">' + fnNiceUser(user,'user') + '</div><div class="timeCol">' + fnNiceTime(when, 0) + '</div></div>';
		    }).get().join(''),
		    cnt  = doc.find('.entry').length;
		//$('#friends').html(html + '<a class="more" target="_blank" href="/users/' + strUserName + '/friends">View more...</a>');
		$('#friends').html(html + '<div class="prevDiv"><a href="#" id="FrPrev" text="Prev"><img src="' + hosted_at + 'prev.gif" alt="Prev"></a>&nbsp;</div><div class="nextDiv">&nbsp;<a href="#" id="FrNext" text="Next"><img src="' + hosted_at + 'next.gif" alt="Next"></a></div><div align="center">Showing ' + parseInt((intFrPg * 8) + 1) + ' to ' + parseInt(((intFrPg + 1) * 8)) + ' <a class="more" target="_blank" href="/users/' + strUserName + '/friends">View more...</a></div>');
		$("a.jTip").hover(function(){JT_shower($(this).next().html(),this.id,this.name, 500)},function(){$('#JT').remove()});

		if (intFrPg < 1) $('#FrPrev').hide();
		if (intFrPg > 0) $('#FrPrev').show();
		if (cnt < 8) $('#FrNext').hide();
		if (cnt == 8) $('#FrNext').show();
		$('a#FrPrev').click(function()
		{
			if (intFrPg > 0) intFrPg--;
			fnPgFriends();
			return false;
		}
		);
		$('a#FrNext').click(function()
		{
			if (cnt == 8) intFrPg++;
			fnPgFriends();
			return false;
		}
		);
	});
};

var fnPgUpdates = function (){

	/*--------- Get blog updates by all users using iframes ---------*/
	$('#entries_from_all').html('<img src="' + hosted_at + 'loading-white.gif">');
	$('<iframe class="hiddenframe" src="/directory.bml?ut_days=7&opt_format=simple&opt_sort=ut&opt_pagesize=8&page=' + parseInt(intUpPg + 1) + '"></iframe>').appendTo('body').load(function() {
		var doc = $(this).contents(),
		    users = doc.find('ul > a[href^=/users]');
		$('#entries_from_all').html(users.slice(0,8).map(function() {
			var el = $(this);
			return '<div class="row"><div class="userCol">' + fnNiceUser(el.text(), "jTips") + '</div><div class="timeCol">' + el.next().next().text().replace('Updated','') + '</div></div>';
		}).get().join('') + '<div class="prevDiv"><a href="#" id="updPrev" text="Prev"><img src="' + hosted_at + 'prev.gif" alt="Prev"></a>&nbsp;</div><div class="nextDiv">&nbsp;<a href="#" id="updNext" text="Next"><img src="' + hosted_at + 'next.gif" alt="Next"></a></div><div align="center">Showing ' + parseInt((intUpPg * 8) + 1) + ' to ' + parseInt(((intUpPg + 1) * 8)) + ' <a class="more" target="_blank" href="' + $(this).attr('src') + '">View more...</a></div>');

		$("a.jTips").hover(function(){JT_show('/customview.cgi?styleid=2403&user=' + this.href.split("/")[4],this.id,'')},function(){$('#JT').remove()});

		if (intUpPg < 1) $('#updPrev').hide();
		if (intUpPg > 0) $('#updPrev').show();
		if (intUpPg > intUpMax - 1) $('#updNext').hide();
		if (intUpPg < intUpMax) $('#updNext').show();
		$('a#updPrev').click(function()
		{
			if (intUpPg > 0) intUpPg--;
			fnPgUpdates();
			return false;
		}
		);
		$('a#updNext').click(function()
		{
			if (intUpPg < intUpMax) intUpPg++;
			fnPgUpdates();
			return false;
		}
		);
	});
}

fnOnLoadDom(fnInitialize);
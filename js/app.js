/*

This file contains all of the code that does the main work.

*/

var client_ID = "I3ZEE1QKWPUD2F3ICVHWQJUVBRJP2MES3VRHORZ4EOJ0ZWAO";
var client_secret = "0L1BPBPX2YOJK23RQEOXPEKIO2X11NBGY5W2FJGRCGUCZHWF";
var URL = "https://api.foursquare.com/v2/venues/search?client_id=" +
			client_ID +
			"&client_secret=" +
			client_secret +
			"&v=20130815&ll=40.7,-74&query=sushi";

var wikiRequestTimeout = setTimeout(function() {
	$wikiElem.text("failed to get wikipedia resources");
}, 8000);

$.ajax({
	url: URL,
	dataType: "jsonp",
    success: function(response) {
		clearTimeout(wikiRequestTimeout);
    }
});

function loadData() {

    var $body = $('body');
    var $wikiElem = $('#wikipedia-links');
    var $nytHeaderElem = $('#nytimes-header');
    var $nytElem = $('#nytimes-articles');
    var $greeting = $('#greeting');

    // clear out old data before new request
    $wikiElem.text("");
    $nytElem.text("");

    // load streetview
    var streetStr = $('#street').val();
    var cityStr = $('#city').val();
    var address = streetStr + ', ' + cityStr;

    $greeting.text('So, you want to live at ' + address + '?');

    var streetViewUrl = 'http://maps.googleapis.com/maps/api/streetview?size=600x400&location=' + address + '';
    $body.append('<img class="bgimg" src="' + streetViewUrl + '">');

    // NY times articles
	var nytimesURL = 'http://api.nytimes.com/svc/search/v2/articlesearch.json?q=' + cityStr + '&api-key=393997003a2ed9f518a44b5c77316eaf:17:70996517';
    $.getJSON(nytimesURL, function(data) {
        $nytHeaderElem.text('New York Times Articles About ' + cityStr);
        var articles = data.response.docs;
		var items = [];
        $.each(articles, function(index) {
                var article = articles[index];
				$nytElem.append("<li class='article'>" + "<a href='" + article.web_url + "'>" + article.headline.main + "</a>" + "<p>" + article.snippet + "</p></li>" );
            })
    }).error(function(e) {
         $nytElem.text("New York Times Article Could Not Be Loaded");
    });;

    // Wikipedia links
	var wikiUrl = "http://en.wikipedia.org/w/api.php?action=opensearch&search=" + cityStr + "&format=json&callback=wikiCallBack";

	var wikiRequestTimeout = setTimeout(function() {
	    $wikiElem.text("failed to get wikipedia resources");
    }, 8000);

	$.ajax({
        url: wikiUrl,
		dataType: "jsonp",
        success: function(response) {
            var articleList = response[1];

	        $.each(articleList, function(index) {
                var articleStr = articleList[index];
				var url = "http://en.wikipedia.org/wiki/" + articleStr;
				$wikiElem.append("<li><a href='" + url + "'>" + articleStr + "</a></li>");
            })
            clearTimeout(wikiRequestTimeout);
        }
	});


    return false;
};


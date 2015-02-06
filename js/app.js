var client_ID = "I3ZEE1QKWPUD2F3ICVHWQJUVBRJP2MES3VRHORZ4EOJ0ZWAO";
var client_secret = "0L1BPBPX2YOJK23RQEOXPEKIO2X11NBGY5W2FJGRCGUCZHWF";
var URL = "https://api.foursquare.com/v2/venues/search?client_id=" + client_ID + "&client_secret=" + client_secret + "&v=20130815&ll=40.7,-74&query=sushi";

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


$("#mapDiv").append(googleMap);

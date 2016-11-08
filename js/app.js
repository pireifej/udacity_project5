/**
	* This file contains the code that does all of the heavy lifting for the Neighborhood Map Project.
	* Paul Ireifej, Udacity Student
*/

/**
	* This is the fun part. Here's where we generate the custom Google Map for the website.
	* See the documentation below for more details.
	* https://developers.google.com/maps/documentation/javascript/reference
*/

function wait(ms){
	var start = new Date().getTime();
	var end = start;
	while(end < start + ms) {
		end = new Date().getTime();
	}
}

/** declares a global map variable */
var map;

/** list of all markers plotted in the map */
var allMarkers = [];

/** URL for Google marker image */
var markerURL = "http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|";

/** default and selected pin images for map markers */
var point1;
var point2;
var size;
var defaultPin;
var selectedPin;

/** Foursquare.com API (not used) */
var client_ID = "I3ZEE1QKWPUD2F3ICVHWQJUVBRJP2MES3VRHORZ4EOJ0ZWAO";
var client_secret = "0L1BPBPX2YOJK23RQEOXPEKIO2X11NBGY5W2FJGRCGUCZHWF";
var foursquareURL = "https://api.foursquare.com/v2/venues/search?client_id=" +
			client_ID +
			"&client_secret=" +
			client_secret +
			"&v=20130815&ll=40.7,-74&query=sushi";

/**
	* Location object
	* @param {object} data Contains properties name, street, city and state
*/
var Location = function(data) {
	var self = this;

	this.name = ko.observable(data.name);
	this.street = ko.observable(data.street);
	this.city = ko.observable(data.city);
	this.state = ko.observable(data.state);
	this.notes = ko.observable(data.notes);
	this.image = ko.observable(data.image);
	this.lat = ko.observable(data.lat);
	this.lon = ko.observable(data.lon);

	/** Wikipedia links */
	this.wikiUrls = ko.observableArray([]);
	this.articleStrs = ko.observableArray([]);

	/** NY times articles */
	this.nytimesUrls = ko.observableArray([]);

	this.imageGoogle = ko.computed(function() {
		var personalImgLoc = 'img/' + this.image() + 'google.JPG';
		return personalImgLoc;
	}, this);

	this.address = ko.computed(function() {
		return this.street() + ' ' + this.city() + ', ' + this.state();
	}, this);

	this.selectionLabel = ko.computed(function() {
		return "(" + this.name() + ") " + this.address();
	}, this);

	/** URL for Google API street view image */
	this.imgSrc = ko.computed(function() {
		var streetViewUrl = 'http://maps.googleapis.com/maps/api/streetview?size=400x400&location=';
		return streetViewUrl + this.street() + this.city() + ', ' + this.state();
	}, this);

	/** Local file location for personal image */
	this.personalImgSrc = ko.computed(function() {
		var personalImgLoc = 'img/' + this.image() + '.jpg';
		return personalImgLoc;
	}, this);

	/** Set Wikipedia links */
/*
	this.setWikiUrls = ko.computed(function() {
		var wikiRequestUrl = 'http://en.wikipedia.org/w/api.php?action=opensearch&search=' + self.city() + "&format=json&callback=wikiCallBack";
		var wikiRequestTimeout = setTimeout(function() {
			self.wikiUrls.push({myUrl:"", myArticleStr:"Oops - Wikipedia timed out! Try again later."});
		}, 3000);

		$.ajax({
			url: wikiRequestUrl,
			dataType: "jsonp",
			success: function(response) {
				clearTimeout(wikiRequestTimeout);

				var articleList = response[1];
				$.each(articleList, function(index) {
					var articleStr = articleList[index];
					var url = "http://en.wikipedia.org/wiki/" + articleStr;
					self.wikiUrls.push({myUrl:url, myArticleStr:articleStr});
				});
			}
		});
	},this);
*/

	/** Set New York Times links */
    this.setNytimesUrls = ko.computed(function() {
/*
		var nytimesURL = 'http://api.nytimes.com/svc/search/v2/articlesearch.json?q=' + self.city() + '&api-key=393997003a2ed9f518a44b5c77316eaf:17:70996517';

		$.getJSON(nytimesURL, function(data) {
			var articles = data.response.docs;
			$.each(articles, function(index) {
				var article = articles[index];
				self.nytimesUrls.push({myUrl:article.web_url, myArticleStr:article.headline.main});
			});
		}).error(function(e) {
			self.nytimesUrls.push({myUrl:"", myArticleStr:"Oops - New York Times had a boo boo! Try again later."});
		});
*/
	}, this);
};

/** list of initial Locations - simply add a new Location() here to extend the application */
var initialLocations = [
	new Location(
	{
		name: "",
		street: "",
		city: "",
		state: "",
		notes: "",
		image: "",
		lat: 41.4745403,
		lon: -74.0270993
	}),
	// upstate NY
	new Location(
	{
		name: "Paul's Parents' Home",
		street: "3 On the Green",
		city: "New Windsor",
		state: "NY",
		notes: "This is where my parents live. We came here often when preparing for the wedding.",
		image: "windsor",
		lat: 41.4745403,
		lon: -74.0270993
	}),
	new Location(
	{
		name: "Powelton Club",
		street: "29 Old Balmville Rd",
		city: "Newburgh",
		state: "NY",
		notes: "We had our wedding reception here. We danced to 'You'll Be in My Heart' by Phil Collins and then did the YMCA.",
		image: "powelton",
		lat: 41.523726,
		lon: -74.0196777
	}),
	new Location(
	{
		name: "Riverfront",
		street: "Front St.",
		city: "Newburgh",
		state: "NY",
		notes: "We came here after the wedding to take pictures.",
		image: "riverfront",
		lat: 41.5021792,
		lon: -74.0057125
	}),
	new Location(
	{
		name: "St. Joseph's Church",
		street: "4 St Joseph Pl",
		city: "New Windsor",
		state: "NY",
		notes: "We got married here and visited Father Dennis often to discuss the wedding and marriage in general.",
		image: "stjoseph",
		lat: 41.474652,
		lon: -74.0210667
	}),
	new Location(
	{
		name: "Courtyard Newburgh Stewart Airport",
		street: "4 Governor Dr",
		city: "Newburgh",
		state: "NY",
		notes: "We stayed here for our first night as huband & wife.",
		image: "courtyard",
		lat: 41.518834,
		lon: -74.1120607
	}),
	new Location(
	{
		name: "Pastry Garden",
		street: "2586-2600 South Rd #5",
		city: "Poughkeepsie",
		state: "NY",
		notes: "We came here to taste different cake flavors for our wedding cake.",
		image: "pastrygarden",
		lat: 41.6674519,
		lon: -73.9280217
	}),
	new Location(
	{
		name: "Town of New Windsor",
		street: "555 Union Avenue",
		city: "New Windsor",
		state: "NY",
		notes: "We raced here on a rainy afternoon, on a work day, to get our marriage license before they closed.",
		image: "town",
		lat: 41.4821296,
		lon: -74.0650603
	}),
	new Location(
	{
		name: "West Point",
		street: "415 Main St",
		city: "Highland Falls",
		state: "NY",
		notes: "We visited West Point for a tour with popo. We were in the cemetary talking about gravestones for 1 hour.",
		image: "westpoint",
		lat: 41.3733545,
		lon: -74.0650603
	}),
	new Location(
	{
		name: "Red Lobster",
		street: "303 NJ-10",
		city: "Ledgewood",
		state: "NJ",
		notes: "We came here with grandma & grandma to celebrate something. We probably used gift cards that we bought them for Christmas. I don't remember. I'm probably wrong about all of this and just making it up. It may also just have been a dream.",
		image: "redlobster",
		lat: 40.8740098,
		lon: -74.648126
	}),
     // Madison
	new Location(
	{
		name: "Our Apartment",
		street: "294 Main St",
		city: "Madison",
		state: "NJ",
		notes: "I spent a lot of time here early into our relationship. Many times, I didn't even go back to my apartment; I just sleep over and we went into work together. We were madly inlove. I told you my feelings when sitting on the blue couch after an episode of Harry's Law. Perfect timing. Eventually we got married and moved here together.",
		image: "apt",
		lat: 40.750938,
		lon: -74.4019547
	}),
	new Location(
	{
		name: "Starbucks Madison",
		street: "309 Main St",
		city: "Madison",
		state: "NJ",
		notes: "We met here for one of our 'dates' and then walked around outside. I was dressed up because I went to church that morning and I was trying to impress you. We talked about hiking when we were inside. Shortly after we left, you realized you forgot your hat so we went back in to get it.",
		image: "starbucks",
		lat: 40.7489866,
		lon: -74.4019008
	}),
	new Location(
	{
		name: "Starbucks Florham Park",
		street: "Crescent Center, 184 Columbia Turnpike",
		city: "Florham Park",
		state: "NJ",
		notes: "I came here alone to read books and drink coffee back-in-the-day, but this quickly became a favorite spot for us to drive to during work breaks. I would get Pike Place coffee and you would get dark roast, so they usually wrote 'P' on my cup and 'D' on yours. So romantic!",
		image: "starbucksfl",
		lat: 40.789278,
		lon: -74.39329
	}),
	new Location(
	{
		name: "China Chalet",
		street: "Crescent Center, 184 Columbia Turnpike #13",
		city: "Florham Park",
		state: "NJ",
		notes: "This was a favorite Chinese food place for lunch during work. We also did take out to eat back in your office during a few late nights in the office.",
		image: "chinachalet",
		lat: 40.78943,
		lon: -74.393459
	}),
	new Location(
	{
		name: "KFC",
		street: "185 Ridgedale Ave",
		city: "Florham Park",
		state: "NJ",
		notes: "You're obsessed with KFC and love eating here as often as you can. I didn't like it that much but tolerated it for your sake. You always asked for chicken legs only and we usually got drinks & sides. I was usually depressed after eating here.",
		image: "kfc",
		lat: 40.7877236,
		lon: -74.3920268
	}),
	new Location(
	{
		name: "Panera Bread",
		street: "187 Columbia Turnpike",
		city: "Florham Park",
		state: "NJ",
		notes: "We came here a few times for lunch, usually during work because the location is convenient. They had good soups.",
		image: "panera",
		lat: 40.7871662,
		lon: -74.3917238
	}),
	new Location(
	{
		name: "Viet Ai Vietnamese Restaurant",
		street: "189 Ridgedale Ave",
		city: "Florham Park",
		state: "NJ",
		notes: "We had delicious Vietnamese cuisine here that always hit the spot (if you will). We enjoyed the spring rolls, vegetable rolls and beef soups.",
		image: "viet",
		lat: 40.7872921,
		lon: -74.3919009
	}),
	new Location(
	{
		name: "Trader Joe's",
		street: "176 Columbia Turnpike",
		city: "Florham Park",
		state: "NJ",
		notes: "We came here rarely (maybe 2 times in total) and bought almost nothing. It had a nice farm-like feel to it and we enjoyed their free coffee samples.",
		image: "trader",
		lat: 40.7890754,
		lon: -74.3920002
	}),
	new Location(
	{
		name: "QDOBA Mexican Eats",
		street: "176 Columbia Turnpike",
		city: "Florham Park",
		state: "NJ",
		notes: "I always mispronounced the name of this place. We had lunch each several times during work when we needed a Mexican fix.",
		image: "qdoba",
		lat: 40.7886387,
		lon: -74.3879704
	}),
	new Location(
	{
		name: "Panda Chinese",
		street: "235 Ridgedale Ave",
		city: "Cedar Knolls",
		state: "NJ",
		notes: "We ate here one time during the big storm when we lost power. We were cold, smelly and homeless. We basically lived in the AT&T office in Florham Park during this period. This plaza also had a KFC and a Walmart.",
		image: "panda",
		lat: 40.8090662,
		lon: -74.4578353
	}),
	new Location(
	{
		name: "Five Guys Burgers and Fries",
		street: "233 Main St",
		city: "Madison",
		state: "NJ",
		notes: "We had dinner here sometimes after work. We invited Cathy Deng here one night to thank her for letting us take a shower at her place.",
		image: "fiveguys",
		lat: 40.7520499,
		lon: -74.4070707
	}),
	new Location(
	{
		name: "Dunkin' Donuts",
		street: "227 Main St",
		city: "Madison",
		state: "NJ",
		notes: "We came here from time to time to get drinks. You bought me a box of heart doughnuts for Valentine's Day one evening.",
		image: "donuts",
		lat: 40.752423,
		lon: -74.4074937
	}),
	new Location(
	{
		name: "Chase",
		street: "2 Waverly Pl",
		city: "Madison",
		state: "NJ",
		notes: "This was our bank of choice for opening a joint account where we eventually deposited all checks given to us as wedding gifts. There was a nice African American gentleman named Tamba Peters who helped us. We also came here to get cash from the ATM. One night, we bumped into Cathy Deng here and we gave her a ride back to her place. When I tried meeting you for the first time at Soho 33, I got lost (naturally) and I think I accidentally turned into this place.",
		image: "chase",
		lat: 40.7576205,
		lon: -74.413487
	}),
	new Location(
	{
		name: "Burger King",
		street: "317 Main St",
		city: "Madison",
		state: "NJ",
		notes: "We ate here sometimes just because you had coupons. We usually ordered out and took the food back to our apartment.",
		image: "burgerking",
		lat: 40.7485783,
		lon: -74.401194
	}),
	new Location(
	{
		name: "Madison Area YMCA",
		street: "111 Kings Rd",
		city: "Madison",
		state: "NJ",
		notes: "You came here every week by yourself to go swimming. After we were together, I went with you and we swam together. I clogged the pool with my hair. We also spent time in the hot tub together, even after you were pregnant. We also did some classes here: Zumba, Step, Spinning. There was an older asian woman who you wanted to avoid talking to because she asked you about awkward things.",
		image: "ymca",
		lat: 40.7536227,
		lon: -74.4147795
	}),
	new Location(
	{
		name: "Yuki Hana",
		street: "300 Main St",
		city: "Madison",
		state: "NJ",
		notes: "We came here for sushi often since it was convenientally close to our apartment. We did take out here one night after doing the 'Cross Walk' at St. Ann in Parispanny.",
		image: "yukihana",
		lat: 40.749639,
		lon: -74.398945
	}),
	new Location(
	{
		name: "La Rosa Chicken & Grill Madison",
		street: "306 Main St",
		city: "Madison",
		state: "NJ",
		notes: "We had lunch here when we were in the mood for chicken!",
		image: "chicken",
		lat: 40.749855,
		lon: -74.398612
	}),
	new Location(
	{
		name: "Laundromat",
		street: "306 Main St",
		city: "Madison",
		state: "NJ",
		notes: "We cleaned all of my clothes here after we moved in together because they were smelly. It took 4 1/2 hours.",
		image: "laundromat",
		lat: 40.7498169,
		lon: -74.3989592
	}),
	new Location(
	{
		name: "Radio Shack",
		street: "300 Main St",
		city: "Madison",
		state: "NJ",
		notes: "We came here very rarely only because you had a gift card that you wanted to use before they went out of business. We got an iPad case from here.",
		image: "radioshack",
		lat: 40.749987,
		lon: -74.398358
	}),
	new Location(
	{
		name: "Staples",
		street: "300 Main St",
		city: "Madison",
		state: "NJ",
		notes: "We came here sometimes just to browse, but we also got supplies like envelopes from here. This is where we bought our beautiful gay stapler that we decorated together to show our love. We got some children's puzzles from here.",
		image: "staples",
		lat: 40.750249,
		lon: -74.398255
	}),
	new Location(
	{
		name: "Begum Palace",
		street: "301 Main St",
		city: "Madison",
		state: "NJ",
		notes: "We had lunch here very often especially for the warm naan. We came here during work a lot, too!",
		image: "begum",
		lat: 40.749956,
		lon: -74.398605
	}),
	new Location(
	{
		name: "Madison Wok",
		street: "300 Main St.",
		city: "Madison",
		state: "NJ",
		notes: "This Chinese take out place was a very close walk from our apartment. We could even cross magically through the fence to get here. This was our primary Chinese food place. We came here very often. Usually I came here alone to pick up the food that you ordered via phone.",
		image: "wok",
		lat: 40.750312,
		lon: -74.398737
	}),
	new Location(
	{
		name: "Noah's Bagels",
		street: "459 Main St",
		city: "Chatham",
		state: "NJ",
		notes: "We came here sometimes in the morning to get a delicious egg & cheese bagel with ketchup. When I started driving from Holmdel to Florham Park on my own, I stopped here and got a bagel/coffee alone. That was so depressing.",
		image: "noah",
		lat: 40.7465694,
		lon: -74.3974152
	}),
	new Location(
	{
		name: "Whole Foods Market",
		street: "222 Main St",
		city: "Madison",
		state: "NJ",
		notes: "We came here just to have a place to walk to from your apartment. One time, you let me practice one of my Toastmasters speeches when we walked here. If we bought stuff, it was rare because it's expensive. We ate the prepared meals a few times. One night, as we walked back to your apartment, it started raining very heavily. Because I'm dumb, I proposed we just run back to the apartment.",
		image: "wholefoods",
		lat: 40.7534523,
		lon: -74.4077012
	}),
	new Location(
	{
		name: "St. Vincent Martyr Church",
		street: "26 Green Village Rd",
		city: "Madison",
		state: "NJ",
		notes: "This was the church I attended regularly and you usually came too! It was a very rich church with Father Mitt Romney. It also had a Priest who didn't speak English. They still send us envelopes",
		image: "vincent",
		lat: 40.7581083,
		lon: -74.4211801,
	}),
	new Location(
	{
		name: "Costco (East Hanover)",
		street: "156 Sr-10 West",
		city: "East Hanover",
		state: "NJ",
		notes: "We came here at least once per week to shop for groceries! You also got new tires from their auto shop. This was my introduction into Costco. I found it very hectic at first and was always confused which side of the checkout counter I was supposed to go. I remember being nervous when you would go shopping while I was waiting on line since I didn't have a Costco membership card at that time.",
		image: "costco",
		lat: 40.8127234,
		lon: -74.3815172,
	}),
	new Location(
	{
		name: "Kam Man",
		street: "200 NJ-10",
		city: "East Hanover",
		state: "NJ",
		notes: "We loved the food court here! We came often to eat prepared food that came with yummy soup and rice. When you pregnant with Gabriel, you had an urgent need for rice. I rushed here, dropping my Note in the process and cracking the screen. It was worth it, I think.",
		image: "kamman",
		lat: 40.8101977,
		lon: -74.3743106
	}),
	new Location(
	{
		name: "Marshalls",
		street: "240 Rte 10 West",
		city: "East Hanover",
		state: "NJ",
		notes: "I never enjoyed coming here, but I did enjoy watching you change into various clothes because I'm a pervert.",
		image: "marshalls",
		lat: 40.809187,
		lon: -74.372055
	}),
	new Location(
	{
		name: "Penang",
		street: "200 NJ-10",
		city: "East Hanover",
		state: "NJ",
		notes: "We enjoyed the Malaysian Fried Rice from this place. We came here to sit and eat and sometimes did take out. We did take out from here one day when we were cleaning my Parsippany apartment. We ate here one time early on in our relationship and you were dressed like Steve Jobs.",
		image: "penang",
		lat: 40.8092315,
		lon: -74.375435
	}),
	new Location(
	{
		name: "Royal Buffet & Grill",
		street: "240 NJ-10 #7",
		city: "East Hanover",
		state: "NJ",
		notes: "We ate here during the weekends. We also came here once when it was raining and did take out to eat in the car. So romantic. This was also where you learned you were pregnant apparently. And when you learned that the wedding was real.",
		image: "royalbuffet",
		lat: 40.8079505,
		lon: -74.3720776
	}),
	new Location(
	{
		name: "Bow Tie Madison Cinemas 4",
		street: "14 Lincoln Pl",
		city: "Madison",
		state: "NJ",
		notes: "This was our second 'date' (if you will) where we saw the silent black & white movie 'The Artist.' I remember having a strong urge to hug you during the movie but would have been inappropriate. You're fluffy and huggable like Raphael.",
		image: "bow",
		lat: 40.7574163,
		lon: -74.416834
	}),
	new Location(
	{
		name: "US Post Office",
		street: "10 Lincoln Pl",
		city: "Madison",
		state: "NJ",
		notes: "We came here often because you were shipping packages and stuff to China.",
		image: "postoffice",
		lat: 40.7586246,
		lon: -74.4163135 
	}),
	new Location(
	{
		name: "Soho 33",
		street: "22 Main St",
		city: "Madison",
		state: "NJ",
		notes: "First 'date'. We met here for the first time outside of work. We talked mostly about work. Afterwards you helped me to find where I parked my car because you knew I was lost. You shipped a package in the post office aftwards. About 4 months later, I officially proposed to you here.",
		image: "soho",
		lat: 40.7595586,
		lon: -74.4185509
	}),
	new Location(
	{
		name: "Brookhollow's Barnyard",
		street: "301 Rockaway Valley Rd",
		city: "Bonton",
		state: "NJ",
		notes: "We visited this farm to look at the hideous alpacas with popo and get pumpkins.",
		image: "brookhollow",
		lat: 40.937517,
		lon: -74.4264767
	}),
	new Location(
	{
		name: "Cape May",
		street: "Cape May",
		city: "Cape May",
		state: "NJ",
		notes: "Catching sharks with Chinese people, one of our very early expeditions. Before you met me, you went on outings with a Chinese group you met online (or something creepy like that). Since then, we tried to plan stuff together and preferred to do it without the group because of our enormous and extensive love.",
		image: "capemay",
		lat: 38.9392798,
		lon: -74.9227128
	}),
	new Location(
	{
		name: "Sacred Heart Cathedral",
		street: "89 Ridge St",
		city: "Newark",
		state: "NJ",
		notes: "Very early outing we did during work. We wanted to look at the cherry blossoms but, alas, no cherries were blossoming at this time.",
		image: "sacredheart",
		lat: 40.7549078,
		lon: -74.1806966
	}),
	new Location(
	{
		name: "Brooks Brothers at Short Hills",
		street: "1200 Morris Turnpike, Suite B161",
		city: "Short Hills",
		state: "NJ",
		notes: "Got my suit here (and maybe tie?) for our wedding.",
		image: "brooks",
		lat: 40.7401849,
		lon: -74.3651747
	}),
	new Location(
	{
		name: "Short Hills Mall",
		street: "1200 Morris Turnpike",
		city: "Short Hills",
		state: "NJ",
		notes: "We came here for shopping sometimes. You reminded me constantly how high end it is. We had lunch here often at Au Bon Pain.",
		image: "shorthills",
		lat: 40.7402136,
		lon: -74.3664926
	}),
	new Location(
	{
		name: "David's Bridal",
		street: "80 Route 22 West",
		city: "Springfield",
		state: "NJ",
		notes: "Getting your wedding dress. We returned a few times for adjustments. They ripped us off and I'm pretty sure we got angry at them. Driving here was always so dangerous because of the U-turn we had to make at one point. To make it worse, we usually traveled here at night.",
		image: "david",
		lat: 40.6665609,
		lon: -74.3527924
	}),
	new Location(
	{
		name: "Takuma Japanese Restaurant",
		street: "32 Lincoln Pl",
		city: "Madison",
		state: "NJ",
		notes: "We got sushi here and were eating it in the BMW with no air condition. It got very hot.",
		image: "takuma",
		lat: 40.757037,
		lon: -74.4166327
	}),
	new Location(
	{
		name: "Daimatsu",
		street: "860 Mountain Ave",
		city: "Mountainside",
		state: "NJ",
		notes: "This was during your Groupon phase. You got a special deal online at this place, but we learned that the hours were very weird. I think we drove here one evening only to find out it was closed.",
		image: "daimatsu",
		lat: 40.6665609,
		lon: -74.3527924
	}),
	new Location(
	{
		name: "Gyu-Kaku Japanese BBQ",
		street: "34 Cooper Sq",
		city: "New York",
		state: "NY",
		notes: "We came here with your friend Yung-Kyun.",
		image: "gyukaku",
		lat: 40.728262,
		lon: -73.9936867
	}),
	new Location(
	{
		name: "Liberty Science Center",
		street: "222 Jersey City Blvd",
		city: "Jersey City",
		state: "NY",
		notes: "We spent the day here with Paul Lustgarten and his kids. Ever since then, we knew we wanted to take our kids here ... after they're born.",
		image: "science",
		lat: 40.7080177,
		lon: -74.0555664
	}),
	new Location(
	{
		name: "Madison Train Station",
		street: "Kings Rd",
		city: "Madison",
		state: "NJ",
		notes: "We waited here often for the train when we wanted to go to NYC for a haircut and/or food.",
		image: "madisontrain",
		lat: 40.7567535,
		lon: -74.4157538
	}),
	new Location(
	{
		name: "Marc Motors",
		street: "85 Main St",
		city: "Madison",
		state: "NJ",
		notes: "Marc Albert was your favorite mechanic because he kept his shop very clean.",
		image: "marc",
		lat: 40.7580297,
		lon: -74.413846
	}),
	new Location(
	{
		name: "Gerswhin Theatre",
		street: "222 W 51st St",
		city: "New York",
		state: "NY",
		notes: "We celebrated one of your birthdays by having lunch in NYC and then watching Wicked in the Gerswhin Theatre. We never celebrated your birthday since. We had fun, enjoyed a nice show from mediocre seats and learned about 'puff puff.'",
		image: "gerswhin",
		lat: 40.7623402,
		lon: -73.987424
	}),
	new Location(
	{
		name: "Salon De Tops",
		street: "76 Elizabeth St",
		city: "New York",
		state: "NY",
		notes: "This is your haircut place of choice. The gentleman cutting your hair used to ask you about me; if I'm your boyfriend, husband or just play thing. I'm all of the above, baby. I used to wait for you while you get your hair cut, eagerly awaiting the lunch and bubble tea that's to follow.",
		image: "salon",
		lat: 40.7178132,
		lon: -73.9982093
	}),
	new Location(
	{
		name: "XO Kitchen",
		street: "148 Hester St",
		city: "New York",
		state: "NY",
		notes: "We came here for lunch most times when we visited NYC for your haircut. It was delicious food and I especialy enjoyed the bubble tea!",
		image: "xo",
		lat: 40.7166572,
		lon: -73.9963441
	}),
	new Location(
	{
		name: "Madison Public Library",
		street: "39 Keep St.",
		city: "Madison",
		state: "NJ",
		notes: "We visited this library with popo and took lots of pictures!",
		image: "madisonlibrary",
		lat: 40.7524488,
		lon: -74.415782
	}),
	new Location(
	{
		name: "Jos. A. Bank",
		street: "6 N Park Pl #2.",
		city: "Morristown",
		state: "NJ",
		notes: "This was one of the many places we visited to shop for suits for the wedding. You were frustrated because my body is oddly shaped. I was convinced to buy two amazing looking suits from here for a low, low prince. You told me I was wrong.",
		image: "josabank",
		lat: 40.7978538,
		lon: -74.4810927
	}),
	new Location(
	{
		name: "Morristown Green",
		street: "N Park Pl & W Park Place",
		city: "Morristown",
		state: "NJ",
		notes: "We came here briefly on the way to Jos. A. Bank.",
		image: "green",
		lat: 40.7975552,
		lon: -74.4808497
	}),
	new Location(
	{
		name: "Thai Nam Phet II",
		street: "7 Woodside Ave",
		city: "Newton",
		state: "NJ",
		notes: "We had dinner after a viewing for Jim Hohman's husband who passed away. I remember it being delicious but the service was slow.",
		image: "thai",
		lat: 41.049998,
		lon: -74.7520704
	}),
	new Location(
	{
		name: "Thumbs Up",
		street: "411 US-1",
		city: "Edison",
		state: "NJ",
		notes: "We had lunch where with your friend. I pretended to have a conversation with your friend about clouds. Shortly afterwards, I had an emergency and we drove to a nearby Marshalls so I could empty myself.",
		image: "thumbsup",
		lat: 40.5037552,
		lon: -74.4024338
	}),
	new Location(
	{
		name: "Garlic Rose Bistro",
		street: "41 Main St.",
		city: "Madison",
		state: "NJ",
		notes: "We had a romantic, up-scale dinner here one night (I think when you were pregnant with Gabriel). It was deliciously mediocre. I probably had pasta and you had some sea-related cuisine.",
		image: "garlic",
		lat: 40.759021,
		lon: -74.4181387
	}),
	new Location(
	{
		name: "Harrah Resort Atlantic City",
		street: "777 Harrah's Blvd.",
		city: "Atlatnic City",
		state: "NJ",
		notes: "We came here for a multi-day outing when you were very pregnant with Gabriel. We had fun using a Groupon to get an unreasonable number of orange juice drinks per day. We ate daily at a very nice buffet. We slept over in their hotel and watched America's Got Talent in the evenings. It was the last vacation we would ever have.",
		image: "atlantic",
		lat: 39.3843009,
		lon: -74.4304509
	}),
	new Location(
	{
		name: "Public Storage",
		street: "300 NJ-10",
		city: "East Hanover",
		state: "NJ",
		notes: "This is where we kept our extra furniture and stuff that we couldn't cram into your apartment after we moved in together. We hired two strong Russian men (Igor and Igor Jr.) to help us move.",
		image: "storage",
		lat: 40.8088387,
		lon: -74.3818293
	}),
	new Location(
	{
		name: "AMC Loews East Hanover 12",
		street: "145 NJ-10",
		city: "East Hanover",
		state: "NJ",
		notes: "This was our favorite movie theatre to have romantic outings early into our relationship. I would try very hard to hold your hand during the entire duration of the movie.",
		image: "movie",
		lat: 40.8090487,
		lon: -74.3820834
	}),
	new Location(
	{
		name: "Dr. Sharon Mass",
		street: "101 Madison Ave",
		city: "Morristown",
		state: "NJ",
		notes: "I think Dr. Sharon Mass was the first OBGYN we visited to check on Gabriel. We were concerned that the salads I prepared for lunch used deli meat. We were also concerned that we gorged on tiramisu. And we boiled Gabriel in the hot tub. All three points turned out to be moot; Gabriel was destined to be 'screw up' regardless.",
		image: "obgyn",
		lat: 40.7879006,
		lon: -74.4638389
	}),
     // Holmdel
	new Location(
	{
		name: "Our Home",
		street: "2 Windsor Terrace",
		city: "Holmdel",
		state: "NJ",
		notes: "We bought this home from Alice Houston. We commuted here often during week nights, after work, to move our stuff over. I remember one particular romantic night (maybe two?) where we watched fireworks as we drove back from our new home to our apartment. The house is OK. We learned that the plumbing has trees growing in it, the toilets run water for no reason and we have mice in the basement but that's OK. Also it's haunted.",
		image: "2windsorterr",
		lat: 40.4055193,
		lon: -74.1730312
	}),
	new Location(
	{
		name: "AT&T Middletown",
		street: "200 S Laurel Ave",
		city: "Middletown",
		state: "NJ",
		notes: "When the AT&T building in Florham Park closed, we were forced to move here. It's a very big campus. We visited here a few times before moving over officially. I worked 'remotely' from here a few times because you moved before I did. I enjoyed getting coffee and cookies in the afternoon.",
		image: "attmid",
		lat: 40.3974568,
		lon: -74.1378021
	}),
	new Location(
	{
		name: "Weichert",
		street: "43 Main St",
		city: "Holmdel",
		state: "NJ",
		notes: "This church was actually the location of Weichert. This is where we met the sales-associate-of-the-month the Great Martina Concepcion. She thought my name was Pauly. She was an expert on septic tanks. We drove around Holmdel and Middletown in her smoky car to look at houses.",
		image: "weichert",
		lat: 40.3454014,
		lon: -74.1863203
	}),
	new Location(
	{
		name: "Dr. Michael Conley",
		street: "704 N Beers St.",
		city: "Holmdel",
		state: "NJ",
		notes: "We came here for checkups while Gabriel was still in your tummy. We had a great experience with Dr. Michael Conley.",
		image: "ob",
		lat: 40.4052293,
		lon: -74.1969443
	}),
     // Other
	new Location(
	{
		name: "Hunan Spring",
		street: "288 Morris Ave",
		city: "Springfield Township",
		state: "NJ",
		notes: "I think we had dinner here after going to an outing of some kind. I think it was raining.",
		image: "hunan",
		lat: 40.7114697,
		lon: -74.3133165
	}),
	new Location(
	{
		name: "Men's Warehouse",
		street: "466 W Mt Pleasant Ave",
		city: "Livingston",
		state: "NJ",
		notes: "We were looking for a suit that fit my abnormal body for our wedding. I kept calling back to see if they ordered certain suits. They never arrived.",
		image: "warehouse",
		lat: 40.7969928,
		lon: -74.3469192
	}),
	new Location(
	{
		name: "Olive Garden",
		street: "277 Eisenhower Pkwy",
		city: "Livingston",
		state: "NJ",
		notes: "We had a lovely authentic Italian dinner here with popo before going to Men's Warehouse. We never came back.",
		image: "olive",
		lat: 40.7971851,
		lon: -74.3420867
	}),
	new Location(
	{
		name: "Summit Tailors",
		street: "37 Maple St",
		city: "Summit",
		state: "NJ",
		notes: "We raced here during work, during our lunch break, to try own suits for the wedding.",
		image: "summit",
		lat: 40.7173925,
		lon: -74.358921
	}),
	new Location(
	{
		name: "Mintea Sushi & Asian Bistro",
		street: "99 Ridgedale Ave",
		city: "Cedr Knolls",
		state: "NJ",
		notes: "We had lunch here at some point, I think during work.",
		image: "mintea",
		lat: 40.8212141,
		lon: -74.4511153
	}),
	new Location(
	{
		name: "My Old Apartment",
		street: "300 Parsippany Rd",
		city: "Parsippany",
		state: "NJ",
		notes: "This was my old apartment that I lived when we met, before moving in together into your apartment. You helped me to clean everything and move my stuff via two Russian gentleman. We had some very nice memories from here. One night, when I was coughing nonstop, we had a conversation via Notepad. Awwww.",
		image: "parsippany",
		lat: 40.8567381,
		lon: -74.4238114
	}),
	new Location(
	{
		name: "Parsippany Lake",
		street: "701 Lake Shore Dr.",
		city: "Parsippany",
		state: "NJ",
		notes: "We came here probably just once to walk around with popo. It was very close to my old apartment. I used to ride my bike around here.",
		image: "lake",
		lat: 40.848286,
		lon: -74.4423662
	}),
	new Location(
	{
		name: "St. Ann Church",
		street: "781 Smith Rd",
		city: "Parsippany",
		state: "NJ",
		notes: "This was the main church I attended on Sundays when I lived in Parsippany. I helped out here as an usher. We came here together during the early days of our relationship and even went on a Cross Walk together. It was very romantic.",
		image: "stann",
		lat: 40.847553,
		lon: -74.40701
	}),
	new Location(
	{
		name: "St. Peter the Apostle Church",
		street: "179 Baldwin Rd",
		city: "Parsippany",
		state: "NJ",
		notes: "We did Pre Cana here. We had a beautiful time here because they had cream cheese and bagels at one point. This is also where we wrote our very personal & emotional love letters to each other. We're going to read them at our 10 year anniversary. I think.",
		image: "stpeter",
		lat: 40.864481,
		lon: -74.3963975
	}),
	new Location(
	{
		name: "AT&T Florham Park",
		street: "180 Park Ave",
		city: "Florham Park",
		state: "NJ",
		notes: "We both worked here and this is where we met for the first time. I initially said 'hi' to you on the staircase ouside of my office window. I then started an actual 'conversation' in the little kitchen area. I spent the majority of time at that point in your office on the 2nd floor and then in your office on the ground floor.",
		image: "florhampark",
		lat: 40.7782745,
		lon: -74.4173462
	}),
	new Location(
	{
		name: "New World Mall",
		street: "36-20 Roosvelt Ave",
		city: "Flushing",
		state: "NY",
		notes: "We had a fun outing here in a very large shopping mall that was an exact replica of China. I even suffered from jet lag.",
		image: "newworldmall",
		lat: 40.7593729,
		lon: -73.8312462
	}),
	new Location(
	{
		name: "YMCA Westfield",
		street: "422 E Broad St",
		city: "Westfield",
		state: "NJ",
		notes: "We enjoyed fun things at this YMCA for Paul's kid's birthday. You were pregnant with Gabriel but jumped around on a bouncy thing anyway. That probably explains why Gabriel is 'screw up' now. I climbed a rock wall like a monkey.",
		image: "ymcawest",
		lat: 40.65452,
		lon: -74.3468113
	}),
	new Location(
	{
		name: "Paul Lustgarten's Home",
		street: "323 Park St",
		city: "Westfield",
		state: "NJ",
		notes: "We went to Paul Lustgarten's children's birthday party at the YMCA and visited his home afterwards. Our gift was the best.",
		image: "lustgarten",
		lat: 40.6452551,
		lon: -74.3466695
	}),
	new Location(
	{
		name: "Six Flags Great Adventure",
		street: "1 Six Flags Blvd",
		city: "Jackson",
		state: "NJ",
		notes: "Another outing with Paul Lustgarten and his family. It was a very hot day. We had fun on roller coasters and other scary rides. We also drove through the safari and saw giraffes, elephants and many other lovely animals. You drove us back home and were very tired, so when you parked next to our apartment you hit another car just a little bit.",
		image: "sixflags",
		lat: 40.1370678,
		lon: -74.4424036
	}),
	new Location(
	{
		name: "Princeton University",
		street: "Princeton",
		city: "Princeton",
		state: "NJ",
		notes: "We visited this school with your cousin and her daughter, Joyce. We had a lot of fun learning about academics.",
		image: "princeton",
		lat: 40.3439888,
		lon: -74.6536368
	}),
	// Holmldel
	new Location(
	{
		name: "TGI Fridays",
		street: "3054 NJ-35",
		city: "Hazlet",
		state: "NJ",
		notes: "I think we went here for lunch sometimes with my parents. We talked about names for Gabriel here.",
		image: "fridays",
		lat: 40.419,
		lon: -74.1824887
	}),
	new Location(
	{
		name: "Red Oak Diner",
		street: "2973 NJ-35",
		city: "Hazlet",
		state: "NJ",
		notes: "We had a lovely lunch here a few times when looking for homes in Holmdel. There were depressed kids sitting at the bar talking about how hard their lives are and that they need tequila.",
		image: "redoak",
		lat: 40.4183318,
		lon: -74.1787118
	}),
	new Location(
	{
		name: "Crown Palace",
		street: "1283 NJ-35",
		city: "Middletown",
		state: "NJ",
		notes: "We had dinner here a few nights when were visiting our new house to do various maintenance things, like painting.",
		image: "crown",
		lat: 40.400343,
		lon: -74.117724
	}),
	new Location(
	{
		name: "Sm Food Market",
		street: "1281 NJ-35",
		city: "Middletown",
		state: "NJ",
		notes: "We visited the old asian grocery store (it closed eventually) sometimes when we visited our new house to do maintenance things. Because eating at Crown Palace got expensive quickly, we bought frozen dinners from here. It was delicious.",
		image: "sm",
		lat: 40.400343,
		lon: -74.117724
	}),
	new Location(
	{
		name: "Riverview Medical Center",
		street: "1 Riverview Plaza",
		city: "Red Bank",
		state: "NJ",
		notes: "This is where our children were born. We came here for classes prior to Gabriel's birth and ultrasound appointments.",
		image: "riverview",
		lat: 40.3538638,
		lon: -74.0653699
	}),
	// Paterson
	new Location(
	{
		name: "Sultan",
		street: "429 Crooks Ave",
		city: "Clifton",
		state: "NJ",
		notes: "Met my family for the first time",
		image: "sultan",
		lat: 40.8903448,
		lon: -74.1514757
	}),
	new Location(
	{
		name: "Beirut Restaurant",
		street: "1543 Main Ave",
		city: "Clifton",
		state: "NJ",
		notes: "We had a celebration of Gabriel-related pregancy. We also came here for mama's 60th birthday.",
		image: "arabic",
		lat: 40.8859585,
		lon: -74.1532021
	}),
	// Honey Moon
	new Location(
	{
		name: "Vatican City",
		street: "",
		city: "Vatican City",
		state: "Italy",
		notes: "You were a little bit angry at me during our Vatican City adventure. I don't want to talk about it.",
		image: "vatican",
		lat: 41.9038163,
		lon: 12.4476838
	}),
	new Location(
	{
		name: "Vatican Museums",
		street: "Viale Vaticano, 00165",
		city: "Vatican City",
		state: "Italy",
		notes: "Honey moon!",
		image: "vatmus",
		lat: 41.904409,
		lon: 12.4501724
	}),
	new Location(
	{
		name: "St. Peter's Basilica",
		street: "Piazza San Pietro, 00120 Città del Vaticano",
		city: "Vatican City",
		state: "Italy",
		notes: "Honey moon!",
		image: "peter",
		lat: 41.9021667,
		lon: 12.451748
	}),
	new Location(
	{
		name: "Colloseum",
		street: "Piazza del Colosseo, 1, 00184 Roma",
		city: "Rome",
		state: "Italy",
		notes: "One of our first European Honey moon adventures. It was drizzling a little bit outside. We did audio tours that ended up being useless.",
		image: "col",
		lat: 41.8902102,
		lon: 12.4900422
	}),
	new Location(
	{
		name: "Pantheon",
		street: "Piazza della Rotonda, 00186 Roma",
		city: "Rome",
		state: "Italy",
		notes: "We did an audio tour that was very educational. We walked around and looked at the lovey things.",
		image: "pantheon",
		lat: 41.8986108,
		lon: 12.4746842
	}),
	new Location(
	{
		name: "Basilica Papale San Paolo fuori le Mura",
		street: "Piazzale San Paolo, 1, 00146",
		city: "Rome",
		state: "Italy",
		notes: "Saint Paul Outside the Walls. Literally!!",
		image: "stpaul",
		lat: 41.8586767,
		lon: 12.4745451
	}),
	new Location(
	{
		name: "Trevi Fountain Fontana di Trevi",
		street: "Piazza di Trevi, 00187",
		city: "Rome",
		state: "Italy",
		notes: "The Trevi Fountain was a beautiful site to behold. I think we had something to eat at a nearby cafe. There was a gentleman who took my phone (or maybe our camera?), took our pictures, then asked for money. It was the scariest night of my life.",
		image: "trevi",
		lat: 41.9009325,
		lon: 12.4811243
	}),
	new Location(
	{
		name: "Pompei / Museo Vesuviano G.B. Alfano",
		street: "Via Colle S. Bartolomeo, 10, 80045",
		city: "Pompei",
		state: "Italy",
		notes: "I wasn't allowed to take pictures of the dead people.",
		image: "pompei",
		lat: 40.7466183,
		lon: 14.4761726
	}),
	new Location(
	{
		name: "Acropolis of Athens",
		street: "Acropolis of Athens Greece",
		city: "Athens",
		state: "Greece",
		notes: "Honey moon!",
		image: "acropolis",
		lat: 37.9715323,
		lon: 23.7235605
	}),
	new Location(
	{
		name: "Ancient Olympia",
		street: "270 65",
		city: "Athens",
		state: "Greece",
		notes: "Honey moon!",
		image: "ancient",
		lat: 37.650718,
		lon: 21.6238603
	}),
	new Location(
	{
		name: "Olympia Archaeological Museum",
		street: "Olympia",
		city: "Olympia",
		state: "Greece",
		notes: "Honey moon!",
		image: "olympia",
		lat: 37.6434582,
		lon: 21.6272198
	}),
	new Location(
	{
		name: "Basilica Cistern",
		street: "Alemdar Mh., Yerebatan Cd. 1/3",
		city: "Istanbul",
		state: "Turkey",
		notes: "We went deep underground to explore the cistern. We found an upside down Medusa head.",
		image: "cistern",
		lat: 41.008384,
		lon: 28.9756893
	}),
	new Location(
	{
		name: "House of Virgin Mary",
		street: "35922 Selçuk/İzmir",
		city: "Istanbul",
		state: "Turkey",
		notes: "We got the holiest of waters here at the house of the Virgin Mary.",
		image: "virgin",
		lat: 37.9124015,
		lon: 27.3305685
	}),
	new Location(
	{
		name: "Church of the Holy Saviour",
		street: "Derviş Ali Mh., Kariye Cami Sk. No:8",
		city: "Istanbul",
		state: "Turkey",
		notes: "Museum with Muslim & Christian artworks.",
		image: "holy",
		lat: 41.031205,
		lon: 28.9369996
	}),
	new Location(
	{
		name: "The Blue Mosque Sultan Ahmet Camii",
		street: "Sultanahmet Mh., At Meydanı No:7, 34122",
		city: "Istanbul",
		state: "Turkey",
		notes: "This is where we discovered our newly adopted religion, Islam.",
		image: "blue",
		lat: 41.0054096,
		lon: 28.9746251
	}),
	new Location(
	{
		name: "Grand Bazaar",
		street: "Beyazıt Mh., 34126",
		city: "Istanbul",
		state: "Turkey",
		notes: "I remember being terrified here and wanted to leave quickly.",
		image: "bazaar",
		lat: 41.0106888,
		lon: 28.9658794
	}),
	new Location(
	{
		name: "Hagia Sophia",
		street: "Sultanahmet Mh., Ayasofya Meydanı",
		city: "Istanbul",
		state: "Turkey",
		notes: "This was very beautiful. We even stuck our thumbs into a hole in the wall and made a wish. God knows why! We also found the door between Heaven and Hell.",
		image: "hagia",
		lat: 41.008583,
		lon: 28.9779863
	}),
	new Location(
	{
		name: "Ephesus",
		street: "Atatürk Mah, Uğur Mumcu Sevgi Yolu., 35920 Acarlar Köyü/Selçuk/İzmir",
		city: "Izmir",
		state: "Turkey",
		notes: "Honey moon!",
		image: "eph",
		lat: 37.9490349,
		lon: 27.3655701
	}),
	new Location(
	{
		name: "Topkapi Palace",
		street: "Fatih/İstanbul",
		city: "Istanbul",
		state: "Turkey",
		notes: "Honey moon!",
		image: "top",
		lat: 41.0115195,
		lon: 28.9811902
	})
];

/** LocationsMap object for generating the Google Map dynamically */
var LocationsMap = function() {
	this.initializeMap = function() {
		point1 = new google.maps.Point(0,0);
		point2 = new google.maps.Point(10, 34);
		size = new google.maps.Size(21, 34);
		defaultPin = new google.maps.MarkerImage(markerURL + "FE7569", size, point1, point2);
		selectedPin = new google.maps.MarkerImage(markerURL + "FFFF00", size, point1, point2);

		var mapOptions = {
			zoom: 8,
			disableDefaultUI: true
		};

	/** This next line makes `map` a new Google Map JavaScript Object and attaches it to <div id="map-canvas"> */
		map = new google.maps.Map(document.querySelector('#map-canvas'), mapOptions);

	/**
		* createMapMarker(placeData) reads Google Places search results to create map pins.
		* placeData is the object returned from search results containing information
		* about a single location.
	*/
	function createMapMarker(placeData) {
		/** The next lines save location data from the search result object to local variables */
		//var lat = placeData.geometry.location.lat();  /** latitude from the place service */
		var lat = placeData.lat;
		//var lon = placeData.geometry.location.lng();  /** longitude from the place service */
		var lon = placeData.lon;
		//var name = placeData.formatted_address;   /** name of the place from the place service */
		var name = placeData.name;
		var bounds = window.mapBounds;            /** current boundaries of the map window */

		/** marker is an object with additional data about the pin for a single location */
		var marker = new google.maps.Marker({
			map: map,
			position: {lat: lat, lng: lon},
			title: name,
			icon: defaultPin
		});
		//console.log(placeData.geometry.location);
		/** we want to store the list of Markers for future reference */
		allMarkers.push(marker);

		/** infoWindows are the little helper windows that open when you click
			* or hover over a pin on a map. They usually contain more information
			* about a location.
		*/
		var contentString = "<div class='pop-up' id='locationDetail'>";
		$.each(initialLocations, function(index, value) {
				if (name.indexOf(value.street()) > -1) {
					contentString += "<p class='header'>" + value.name() + "</p>" +
					"<p class='sub-heading'>" + value.address() + "</p>" +
					value.notes();
				}
		});
		contentString += "</div>";

		var infoWindow = new google.maps.InfoWindow({
			content: contentString
		});

		/** kicked off whenever a marker is selected */
		google.maps.event.addListener(marker, 'click', function() {
			var round = 4;
			//infoWindow.open(map, marker);
			var markerTitle = this.getTitle();
			var thisLat = this.position.lat().toFixed(round);
			var thisLon = this.position.lng().toFixed(round);

			$.each(initialLocations, function(index, value) {
					var valueLat = value.lat().toFixed(round);
					var valueLon = value.lon().toFixed(round);
					if (thisLat == valueLat && thisLon == valueLon) {
						vm.currentLocation(value);
						vm.selectMarker();
					}
			});
		});

		/** this is where the pin actually gets added to the map.
			* bounds.extend() takes in a map location object
		*/
		bounds.extend(new google.maps.LatLng(lat, lon));

		/** fit the map to the new marker */
		map.fitBounds(bounds);

		/** center the map */
		map.setCenter(bounds.getCenter());
	}

	/**
		* callback(results, status) makes sure the search returned results for a location.
		* If so, it creates a new map marker for that location.
	*/
	function callback(results, status) {
		if (status == google.maps.places.PlacesServiceStatus.OK) {
			createMapMarker(results[0]);
		}
		/** select initial marker once all markers are displayed */
		if (allMarkers.length == initialLocations.length) {
			allMarkers[0].setIcon(selectedPin);
		}
	}

	/**
		* pinPoster(locations) takes in the array of locations created by locationFinder()
		* and fires off Google place searches for each location
	*/
	function pinPoster() {
		/**
			* creates a Google place search service object. PlacesService does the work of
			* actually searching for location data.
		*/
		var service = new google.maps.places.PlacesService(map);

		/** Iterates through the array of locations, creates a search object for each location */
		for (var location in initialLocations) {
			var myLocation = initialLocations[location];
			/** the search request object */
			//var address = initialLocations[location].address();
			//var request = {
			//	query: address
			//};

			/**
				* Actually searches the Google Maps API for location data and runs the callback
				* function with the search results after each search.
			*/
			//service.textSearch(request, callback);
			var myPlaceData = {
				lat: myLocation.lat(),
				lon: myLocation.lon(),
				name: myLocation.address()
			};
			createMapMarker(myPlaceData);
		}
		allMarkers[0].setIcon(selectedPin);
	}

		/** Sets the boundaries of the map based on pin locations */
		window.mapBounds = new google.maps.LatLngBounds();

		/**
			* pinPoster(locations) creates pins on the map for each location in
			* the locations array
		*/
		pinPoster();
	};
};


/** Our Octopus! :-) */
var ViewModel = function() {
	var self = this;

	/** list of locations */
	this.locationList = ko.observableArray([]);
	initialLocations.forEach(function(locationItem) {
            self.locationList.push(locationItem);
	});
	/** current location - all views are updated based on this value changing */
    this.currentLocation = ko.observable(this.locationList()[0]);

	this.selectLocation = function() {
		self.currentLocation(this);
		self.selectMarker();
	};

	/**
		* current filtered location - 'none' means that nothing is being filtered
		* and all locations should be displayed
	*/
	this.filteredLocation = ko.observable("none");

	/**
		* highlights the selected location's marker on the map
		* resets all other markers to default
	*/
	this.selectMarker = function() {
		var myLoc = self.currentLocation();
		var round = 4;
		/** reset the currently selected marker */
		for (var i= 0; i < allMarkers.length; i++) {

			var myMarkers = allMarkers[i];
			var title = myMarkers.getTitle();
			var myLocLat = myLoc.lat().toFixed(round);
			var myLocLon = myLoc.lon().toFixed(round);
			var myMarkersLat = myMarkers.getPosition().lat().toFixed(round);
			var myMarkersLng = myMarkers.getPosition().lng().toFixed(round);

			/** "map" the marker to the Location via the Title propery */
			if (myLocLat == myMarkersLat && myLocLon == myMarkersLng) {
				/** show the selected marker as such */
				myMarkers.setIcon(selectedPin);
				map.panTo(myMarkers.getPosition());
				map.setZoom(16);
				continue;
			}
			/** show all other markers with the default pin */
			allMarkers[i].setIcon(defaultPin);
		}
	};
};

if (typeof google != "undefined") {
	/** Start here! initializeMap() is called when page is loaded. */
	var myMap = new LocationsMap();

	/** Calls the initializeMap() function when the page loads */
	google.maps.event.addDomListener(window, 'load', myMap.initializeMap);
} else {
	$("#map-canvas").text("Oops - Google Map is blocked!");
	$("#map-canvas").addClass("google-error");
}

var map;
var vm = new ViewModel();
ko.applyBindings(vm);

var locationTags = [];
$.each(initialLocations, function(index) {
	var myLoc = initialLocations[index];
	locationTags.push(myLoc.selectionLabel());
});

/** reset the marker visiblity if no filter is entered */
$("#search").on("keypress", function(key) {
	var text = $("#search").val();
	vm.filteredLocation("none");
	/** charCode 13 is the 'enter' key */
	if (key.charCode == 13 && text.length == 0) {
		for (var i= 0; i < allMarkers.length; i++) {
			allMarkers[i].setVisible(true);
		}
	}
});

$("#search").autocomplete({
	source: locationTags,
	select: function(event, ui) {
			$.each(initialLocations, function(index) {
					var myLoc = initialLocations[index];
					var myMarker = {};
					if (ui.item.value.indexOf(myLoc.address()) > -1) {
						vm.currentLocation(myLoc);
						vm.filteredLocation(myLoc);
						for (var i= 0; i < allMarkers.length; i++) {
							myMarker = allMarkers[i];
							/** "map" the marker to the Location via the Title propery */
							if (myMarker.getTitle().indexOf(myLoc.street()) > -1) {
								/** show the selected marker */
								myMarker.setVisible(true);
								vm.selectMarker();
								continue;
							}
							/** hide all other markers */
							myMarker.setVisible(false);
						}
					}
			});
	}
});

$("#toggle-list").click(function() {
	$("#map-location-list").toggle();
});

$("#dialog").dialog();

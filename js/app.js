/**
	* This file contains the code that does all of the heavy lifting for the Neighborhood Map Project.
	* Paul Ireifej, Udacity Student
*/

/**
	* This is the fun part. Here's where we generate the custom Google Map for the website.
	* See the documentation below for more details.
	* https://developers.google.com/maps/documentation/javascript/reference
*/

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

	/** Wikipedia links */
	this.wikiUrls = ko.observableArray([]);
	this.articleStrs = ko.observableArray([]);

	/** NY times articles */
	this.nytimesUrls = ko.observableArray([]);

	/** URL for Google API street view image */
	this.address = ko.computed(function() {
		return this.street() + ' ' + this.city() + ', ' + this.state();
	}, this);

	this.selectionLabel = ko.computed(function() {
		return "(" + this.name() + ") " + this.address();
	}, this);

	this.imgSrc = ko.computed(function() {
		var streetViewUrl = 'http://maps.googleapis.com/maps/api/streetview?size=400x400&location=';
		return streetViewUrl + this.city() + ', ' + this.state();
	}, this);

	/** Set Wikipedia links */
	this.setWikiUrls = ko.computed(function() {
	    var wikiRequestUrl = 'http://en.wikipedia.org/w/api.php?action=opensearch&search=' + self.city() + "&format=json&callback=wikiCallBack";
		var wikiRequestTimeout = setTimeout(function() {
                $("#wiki").text("Oops - Wikipedia timed out! Try again later.");
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

	/** Set New York Times links */
    this.setNytimesUrls = ko.computed(function() {
		var nytimesURL = 'http://api.nytimes.com/svc/search/v2/articlesearch.json?q=' + self.city() + '&api-key=393997003a2ed9f518a44b5c77316eaf:17:70996517';

		$.getJSON(nytimesURL, function(data) {
			var articles = data.response.docs;
			$.each(articles, function(index) {
				var article = articles[index];
				self.nytimesUrls.push({myUrl:article.web_url, myArticleStr:article.headline.main});
			});
		}).error(function(e) {
			$("#nytimes").text("Oops - New York Times had a boo boo! Try again later.");
		});
	}, this);
};

/** list of initial Locations - simply add a new Location() here to extend the application */
var initialLocations = [
	new Location(
	{
		name: "My Home",
		street: "2 Windsor Terrace",
        city: "Holmdel",
        state: "NJ"
	}),
	new Location(
	{
		name: "Parents' Home",
		street: "3 On the Green",
		city: "New Windsor",
		state: "NY"
	}),
	new Location(
	{
		name: "Work",
		street: "180 Park Ave",
		city: "Florham Park",
		state: "NJ"
	}),
	new Location(
	{
		name: "Research",
		street: "4202 E Fowler Ave",
		city: "Tampa",
		state: "FL"
	}),
	new Location(
	{
		name: "Co-op",
		street: "7171 Southwest Pkwy",
		city: "Austin",
		state: "TX"
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
		var lat = placeData.geometry.location.lat();  /** latitude from the place service */
		var lon = placeData.geometry.location.lng();  /** longitude from the place service */
		var name = placeData.formatted_address;   /** name of the place from the place service */
		var bounds = window.mapBounds;            /** current boundaries of the map window */

		/** marker is an object with additional data about the pin for a single location */
		var marker = new google.maps.Marker({
			map: map,
			position: placeData.geometry.location,
			title: name,
			icon: defaultPin
		});
		/** we want to store the list of Markers for future reference */
		allMarkers.push(marker);

		/** infoWindows are the little helper windows that open when you click
			* or hover over a pin on a map. They usually contain more information
			* about a location.
		*/
		var infoWindow = new google.maps.InfoWindow({
			content: name
		});

		/** kicked off whenever a marker is selected */
		google.maps.event.addListener(marker, 'click', function() {
			var markerTitle = this.getTitle();
			$.each(initialLocations, function(index, value) {
					if (markerTitle.indexOf(value.street()) > -1) {
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
			/** the search request object */
			var address = initialLocations[location].address();
			var request = {
				query: address
			};

			/**
				* Actually searches the Google Maps API for location data and runs the callback
				* function with the search results after each search.
			*/
			service.textSearch(request, callback);
		}
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
		* highlights the selected location's marker on the map
		* resets all other markers to default
	*/
	this.selectMarker = function() {
		var myLoc = self.currentLocation();
		/** reset the currently selected marker */
		for (var i= 0; i < allMarkers.length; i++) {
			/** "map" the marker to the Location via the Title propery */
			if (allMarkers[i].getTitle().indexOf(myLoc.street()) > -1) {
				/** show the selected marker as such */
				allMarkers[i].setIcon(selectedPin);
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

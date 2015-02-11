Welcome to Neighborhood Map Project!

The locations being presented here have some personal connection to me:
- My parents live in upstate NY.
- My home is in NJ.
- I work at AT&T Labs in NJ.
- I did an REU (research opportunity for students) at the University of South Florida in Tampa, FL back in the day.
- I did a Co-op (education/work opportunity) for Advanced Micro Devices in Austin, TX back in the day.

To run the web application, just visit the index.html page.

There is a details section in the lower right corner of the screen. The "details" contains the name, address, picture from Google Maps, Wikipedia links and NY Times articles.

A change in the current location always updates four views:
- The corresponding marker in the map is selected.
- The name & address is populated into the search toolbar.
- The location is hightlighted in the location list below.
- The details screen is updated with that location's information.

The search toolbar has autocomplete functionality on *multiple* fields. For some example, type in just "0" and you'll get all addrsses that have a street name with 0 in it. Also, you can type in "Home" and you'll get all addresses that have a label with "Home" in it (i.e., "Parents' Home" and "My Home"). You can type in "NJ" and all addresses with a state of NJ will show up.

Some personal notes:

- Please ignore cat_clicker.html and the img directory. The cat clicker was my inspiration. Everytime I got lost with using MVVM, I made reference to my beautiful cat clicker program. I have an emotional connection with the cat clicker now. Please don't judge me.
- Also kindly ignore the Foursquare code. I'd like to keep this information in my repository so I can remind myself how to use it for future projects.


Lastly, I've had some time for soul searching. Here is my retrospective on the code:

- If I could add a new location to my initialLocations array without making any other changes to the code, then my goal of separating code properly based upon Knockout's best practices following an MVVM pattern was acheived. After my code was written and tested, I added the "Ausin, TX" address and nothing broke. So I think I accomplished this.
- Some wikipedia links aren't accurate (for example, the "New Windsor, NY" address has links to other states like Maryland and Illinois; similiar with the TX address). I'm not sure how to fix this?
- In some places, I'm forced to call the ViewModel class directly (vm.currentLocation() and vm.selectMarker()). I don't think this is best practice. It would be helpful to get some feedback on the best way to do this.
- Part of the issue, I think, was the inability to define the Google Map and markers through HTML so I wasn't sure how to do the data-bind.
- I validated app.js through jshint.com because you complained about silly things like missing semi-colons (ooh la la!). I fixed instances of this. There were some unused variables that I chose to keep for code readability purposes and four "undefined" variables, but they are defined via the external libraries (google for Google Map API, ko for Knockout, $ for jQuery and mapBounds in the Google Map API).

Thank you for this opportunity.
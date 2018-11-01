/* Abdur Khan 
Last updated 11/1/18
This is the JavaScript document for the AIC New Tab Chrome Extension */

/*
Print salutation based on time (e.g. good morning if AM, good afternoon if early PM, good evening if later, decide when to divide good evening/good night)
Get local date and print in format [Day (name), Month day(date)] (e.g. Thursday, November 1st)
Print local time
*/

/* Query AIC API for image
 * Artworks endpoint: URL to hit to get data about artworks
 * Going to be using search endpoint to get info and images of artworks
 * Query the Datahub and search for random artworks, filtering by CC0 public domain
 * Obtaining "title", "date_display", and "artist_title" fields
 * Obtain image link, construct IIIF image link based on image ID
 * Once tombstone info is retrieved, format tombstone 
 * Set up container for images (unsure if that's JS or other doc)
 * Print tombstone in bottom left region of page 
*/

/* Place download button near image
 * Construct download link using image ID
 * When button is pressed, download image using user's browser
*/


/* function createParagraph() {
  var para = document.createElement('p');
  para.textContent = 'You clicked the button!';
  document.body.appendChild(para);1
}

var buttons = document.querySelectorAll('button');

for(var i = 0; i < buttons.length ; i++) {
  buttons[i].addEventListener('click', createParagraph);
}
*/

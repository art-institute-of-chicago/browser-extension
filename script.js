/* Abdur Khan 
Last updated 11/19/18
This is the JavaScript document for the AIC New Tab Chrome Extension */

/*
Print salutation based on time (e.g. good morning if AM, good afternoon if early PM, good evening if later, decide when to divide good evening/good night)
Get local date and print in format [Day (name), Month day(date)] (e.g. Thursday, November 1st)
Print local time
*/
// Print greeting based on time

// Array to test random function
var imgArray = ["bay_marseille.jpeg", 
    "bedroom.png", 
    "jatte.png", 
    "lozenge.png", 
    "shiva.png", 
    "water-lilies.png", 
    "wave.png"
    ];

// Array to test tombstone association function
var titleArray = [
    "The Bay of Marseille, Seen from L'Estaque, 1885",
    "The Bedroom, 1889",
    "A Sunday on La Grande Jatte -- 1884, 1884/86",
    "Lozenge Composition with Yellow, Black, Blue, Red, and Gray, 1921",
    "Shiva as Lord of the Dance (Nataraja), 10th/11th Century",
    "Water Lilies, 1906",
    'Under the Wave off Kanagawa (Kanagawa oki nami ura), also known as the Great Wave, from the series "Thirty-six Views of Mount Fuji (Fugaku sanjurokkei)"'
    ]

// Array to test artist association function
var artistArray = [
    "Paul Cézanne",
    "Vincent van Gogh",
    "Georges Seurat",
    "Piet Mondrian",
    "India, Tamil Nadu",
    "Claude Monet",
    "Katsushika Hokusai"
]

// Declare random number
var imgIndex = Math.floor(Math.random() * imgArray.length);

function randomImage(imgBank, path) {
    path = path || "assets/";
    var imgChoice = imgArray[imgIndex];
    var imgPath = '<img src="' + path + imgChoice + '" alt - "">';
    document.write(imgPath); document.close();
}

// Print title in tombstone
function tombstone() {
    var tombstone = titleArray[imgIndex];
    document.write(tombstone); document.close();
}

// Print artist in tombstone
function artist() {
  var artist = artistArray[imgIndex];
  document.write(artist); document.close();
}


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

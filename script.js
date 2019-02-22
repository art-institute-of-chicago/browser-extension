/* Abdur Khan
Last updated 12/11/18
This is the JavaScript document for the AIC New Tab Chrome Extension */

getArtworkData();

function getArtworkData() {
    var xmlhttp = new XMLHttpRequest();
    var dataHubURL = 'http://aggregator-data-test.artic.edu/api/v1/search';
    xmlhttp.open("POST", dataHubURL, true);
    xmlhttp.setRequestHeader('Content-Type', 'application/json');
    xmlhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
        var myObj = JSON.parse(this.responseText);
        console.log('myObj', myObj);
        console.log(myObj.data[0].artist_display);
        var artistPrint = myObj.data[0].artist_display;
        document.getElementById("artist").innerHTML = artistPrint;
        var titlePrint = myObj.data[0].title;
        document.getElementById("tombstone").innerHTML = titlePrint;
        //use ID to generate artwork link
        var imageID = myObj.data[0].image_id;
        var windowWidth = window.innerWidth;
        var windowHeight = window.innerHeight;
        console.log("this window is" + windowWidth + "x" + windowHeight)
        //seeds available - 800 and 1200 for now
        var imageWidth = 800;
        if (windowWidth > 800) {
            imageWidth = 1200;
        }
            console.log(imageWidth);
        var imageLink = '<img src = ' + '"https://www.artic.edu/iiif/2/' + imageID + '/full/' + imageWidth + ',/0/default.jpg">'
        document.getElementById("artwork").innerHTML = imageLink;
        //get browser dimensions to get appropriate width and height?
        var downloadUrl = 'https://www.artic.edu/iiif/2/' + imageID + '/full/3000,/0/default.jpg'
        document.getElementById("download-link").setAttribute('href', downloadUrl);
        document.getElementById("download-link").setAttribute('download', titlePrint + '.jpg');
        }
    };

    //how often the randomness should work
    let timeStamp = Math.floor(Date.now() / 1000);

    console.log(timeStamp);

    let artworkRequest = {
    "resources": "artworks",
    "fields": [
    "id",
    "title",
    "artist_display",
    "image_id",
    "date_display"
    ],
    "boost": false,
    "limit": 1,
    "query": {
        "function_score": {
            "query": {
                "bool": {
                    "must": [
                        {
                            "term": {
                                "is_public_domain": true
                            }
                        },
                        {
                            "exists": {
                                "field": "image_id"
                            }
                        },
                        {
                            "term" : {
                                "thumbnail.width": 3000

                            }
                        },
                        {
                            "range": {
                                "thumbnail.height": {
                                    "gte": 1575,
                                    "lte": 2175
                                }
                            }
                        }

                    ]
                }
            },
            "random_score": {
                "field": "id",
                "seed": timeStamp
            }
        }
    }
};

    let artworkRequest2 = JSON.stringify(artworkRequest);
    //dataHubURL = dataHubURL + artworkRequest;*/
    xmlhttp.send(artworkRequest2);



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

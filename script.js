getArtworkData();

function getArtworkData() {
    var xmlhttp = new XMLHttpRequest();
    var dataHubURL = 'https://aggregator-data.artic.edu/api/v1/search';
    xmlhttp.open("POST", dataHubURL, true);
    xmlhttp.setRequestHeader('Content-Type', 'application/json');
    xmlhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var myObj = JSON.parse(this.responseText);

            var artistVals = [myObj.data[0].artist_title, myObj.data[0].date_display];
            artistVals = artistVals.filter(function (el) {
                return el != null;
            });
            var artistPrint = artistVals.join(', ');
            document.getElementById("artist").innerHTML = artistPrint;

            var titlePrint = myObj.data[0].title;
            var titleElement = document.querySelector("#title a");
            titleElement.innerHTML = titlePrint;

            var linkToArtwork = 'https://www.artic.edu/artworks/' + myObj.data[0].id + '/' + slugify(titlePrint);
            titleElement.setAttribute('href', linkToArtwork);

            var imageID = myObj.data[0].image_id;
            var windowWidth = window.innerWidth;
            var windowHeight = window.innerHeight;
            var imageWidth = myObj.data[0].thumbnail.width;
            var imageHeight = myObj.data[0].thumbnail.height;
            //resize image to fit in browser
            newImageWidth = Math.round(window.innerWidth * .80);
            newImageHeight = Math.round(window.innerHeight * .80);

            imageWidth = newImageWidth;
            imageHeight = newImageHeight;

            //use iiif protocol to display and fit image in browser window space
            var imageLink = '<img src = ' + '"https://www.artic.edu/iiif/2/' + imageID + '/full/!'+imageWidth+',' + imageHeight + '/0/default.jpg">'
            imageLink = '<a href="' + linkToArtwork + '">' + imageLink + '</a>';
            document.getElementById("artwork-container").innerHTML = imageLink;

            var downloadUrl = 'https://www.artic.edu/iiif/2/' + imageID + '/full/3000,/0/default.jpg'
            document.getElementById("download-link").setAttribute('href', downloadUrl);
            document.getElementById("download-link").setAttribute('download', titlePrint + '.jpg');
        }
    };

    //how often the randomness should work
    let timeStamp = Math.floor(Date.now() / 1000);

    let artworkRequest = {
        "resources": "artworks",
        "fields": [
            "id",
            "title",
            "artist_title",
            "date_display",
            "image_id",
            "date_display",
            "thumbnail"
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
                            }

                        ]
                    }
                },
                "boost_mode": "replace",
                "random_score": {
                    "field": "id",
                    "seed": timeStamp
                }
            }
        }
    };

    let artworkRequest2 = JSON.stringify(artworkRequest);
    xmlhttp.send(artworkRequest2);

    /**
     * Use this for artwork slugs to prevent a redirect.
     * @link https://gist.github.com/mathewbyrne/1280286
     */
    function slugify(text) {
      return text.toString().toLowerCase()
        .replace(/\s+/g, '-')           // Replace spaces with -
        .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
        .replace(/\-\-+/g, '-')         // Replace multiple - with single -
        .replace(/^-+/, '')             // Trim - from start of text
        .replace(/-+$/, '');            // Trim - from end of text
    }
}

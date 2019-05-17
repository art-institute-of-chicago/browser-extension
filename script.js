getArtworkData();

function getArtworkData() {
    var xmlhttp = new XMLHttpRequest();
    var dataHubURL = 'http://aggregator-data.artic.edu/api/v1/search';
    xmlhttp.open("POST", dataHubURL, true);
    xmlhttp.setRequestHeader('Content-Type', 'application/json');
    xmlhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var myObj = JSON.parse(this.responseText);
            console.log(myObj);

            var artistPrint = myObj.data[0].artist_display;
            artistPrint = artistPrint.replace('\n', '<br/>');
            document.getElementById("artist").innerHTML = artistPrint;

            var titlePrint = myObj.data[0].title;
            var titleElement = document.querySelector("#title a");
            titleElement.innerHTML = titlePrint;
            titleElement.setAttribute('href', 'https://www.artic.edu/artworks/' + myObj.data[0].id + '/' + slugify(titlePrint));

            var imageID = myObj.data[0].image_id;

            // TODO: Align this with sizes used on the website?
            var windowWidth = window.innerWidth;
            var windowHeight = window.innerHeight;
            var imageWidth = myObj.data[0].thumbnail.width;
            var imageHeight = myObj.data[0].thumbnail.height;
            console.log('window width', windowWidth);
            console.log('window width', windowHeight);
            var windowAspect = window.innerWidth / window.innerHeight;
            var imageAspect = imageWidth / imageHeight;

            var diffAspect = imageAspect - windowAspect;
            if (diffAspect > 0) {
                console.log('landscape');
            } else {
                console.log('portrait');
            }

            imageWidth = 843;

            /*var imageWidth = 800;
            if (windowWidth > 800) {
                imageWidth = 1200;
            }*/

            var imageLink = '<img src = ' + '"https://www.artic.edu/iiif/2/' + imageID + '/full/' + imageWidth + ',/0/default.jpg">'
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
            "artist_display",
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

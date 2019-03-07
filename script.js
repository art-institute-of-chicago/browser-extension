getArtworkData();

function getArtworkData() {
    var xmlhttp = new XMLHttpRequest();
    var dataHubURL = 'http://aggregator-data.artic.edu/api/v1/search';
    xmlhttp.open("POST", dataHubURL, true);
    xmlhttp.setRequestHeader('Content-Type', 'application/json');
    xmlhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var myObj = JSON.parse(this.responseText);
            var artistPrint = myObj.data[0].artist_display;
            document.getElementById("artist").innerHTML = artistPrint;
            var titlePrint = myObj.data[0].title;
            document.getElementById("tombstone").innerHTML = titlePrint;
            //use ID to generate artwork link
            var imageID = myObj.data[0].image_id;
            var windowWidth = window.innerWidth;
            var windowHeight = window.innerHeight;
            //seeds available - 800 and 1200 for now
            var imageWidth = 800;
            if (windowWidth > 800) {
                imageWidth = 1200;
            }
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
    xmlhttp.send(artworkRequest2);

}

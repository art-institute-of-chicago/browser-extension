(function () {

    let tombstoneElement;
    let titleElement;
    let artistElement;
    let artworkContainer;
    let viewer;

    document.addEventListener("DOMContentLoaded", function(event) {
        tombstoneElement = document.getElementById('tombstone');
        titleElement = document.getElementById('title');
        artistElement = document.getElementById('artist');
        artworkContainer = document.getElementById('artwork-container');

        viewer = OpenSeadragon({
            element:         artworkContainer,
            xmlns:           "http://schemas.microsoft.com/deepzoom/2008",
            prefixUrl:       "//openseadragon.github.io/openseadragon/images/",
            homeFillsViewer: true,
            springStiffness: 15,
            visibilityRatio: 1,
            zoomPerScroll: 1.2,
            zoomPerClick: 1.3,
            immediateRender:false,
            constrainDuringPan: true,
            animationTime: 1.5,
            minZoomLevel: 0,
            minZoomImageRatio: 0.8,
            maxZoomPixelRatio: 1.0,
            defaultZoomLevel: 0,
            gestureSettingsMouse: {
                scrollToZoom: true
            },
            showZoomControl: false,
            showHomeControl: false,
            showFullPageControl: false,
            showRotationControl: false,
            showSequenceControl: false,
        });

        getJson('https://aggregator-data.artic.edu/api/v1/search', getQuery(), updatePage);
    });

    function getJson(url, body, callback) {
        let request = new XMLHttpRequest();
        request.open('POST', url, true);
        request.setRequestHeader('Content-Type', 'application/json');
        request.onreadystatechange = function() {
            if (this.readyState === 4 && this.status === 200) {
                callback(JSON.parse(this.responseText));
            }
        };
        request.send(JSON.stringify(body));
    }

    function updatePage(response) {

        let artwork = response.data[0];

        let artistPrint = [artwork.artist_title, artwork.date_display].filter(function (el) {
            return el != null;
        }).join(', ');
        let titlePrint = artwork.title;
        let linkToArtwork = 'https://www.artic.edu/artworks/' + artwork.id + '/' + slugify(titlePrint);

        artistElement.innerHTML = artistPrint;
        titleElement.innerHTML = titlePrint;
        tombstoneElement.setAttribute('href', linkToArtwork);

        let imageID = artwork.image_id;

        viewer.addTiledImage( {
            tileSource:             {
              "@context": "http://iiif.io/api/image/2/context.json",
              "@id": 'https://www.artic.edu/iiif/2/' + imageID,
              "width": artwork.thumbnail.width,
              "height": artwork.thumbnail.height,
              "profile": [ "http://iiif.io/api/image/2/level2.json" ],
              "protocol": "http://iiif.io/api/image",
              "tiles": [{
                "scaleFactors": [ 1, 2, 4, 8, 16 ],
                "width": 256
              }]
            },
        });

        var downloadUrl = 'https://www.artic.edu/iiif/2/' + imageID + '/full/3000,/0/default.jpg'
        document.getElementById("download-link").setAttribute('href', downloadUrl);
        document.getElementById("download-link").setAttribute('download', titlePrint + '.jpg');
    }

    function getQuery() {
        let timeStamp = Math.floor(Date.now() / 1000);

        return {
            "resources": "artworks",
            "fields": [
                "id",
                "title",
                "artist_title",
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
                                    },
                                },
                                {
                                    "exists": {
                                        "field": "image_id",
                                    },
                                },
                                {
                                    "exists": {
                                        "field": "thumbnail.width",
                                    },
                                },
                                {
                                    "exists": {
                                        "field": "thumbnail.height",
                                    },
                                },
                            ],
                        },
                    },
                    "random_score": {
                        "field": "id",
                        "seed": timeStamp
                    },
                },
            },
        };
    }

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

}());

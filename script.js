(function () {

    // LocalStorage keys for reference
    const savedResponseKey = 'response';

    // Settings for cache aggressiveness
    const artworksToPrefetch = 50;

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

        // https://developer.mozilla.org/en-US/docs/Web/API/Storage/getItem
        // ...returns `null` if not found. JSON.parsing `null` also returns `null`
        let savedResponse = JSON.parse(localStorage.getItem(savedResponseKey));

        if (savedResponse !== null) {
            if (savedResponse.data.length > 0) {
                return processResponse(savedResponse);
            }
        }

        getJson('https://aggregator-data.artic.edu/api/v1/search', getQuery(), processResponse);
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

    /**
     * Remove one artwork from the response and save it to LocalStorage.
     */
    function processResponse(response) {
        let artwork = response.data[0];
        response.data = response.data.slice(1);
        localStorage.setItem(savedResponseKey, JSON.stringify(response));
        updatePage(response.data[0]);
    }

    function updatePage(artwork) {
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
            "limit": artworksToPrefetch,
            "query": {
                "function_score": {
                    "query": {
                        "bool": {
                            "filter": [
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
                    "boost_mode": "replace",
                    "random_score": {
                        "field": "id",
                        "seed": getSeed(),
                    },
                },
            },
        };
    }

    /**
     * Using millisecond for seed lowers chance of collision. Since we prefetch
     * API results and images, we don't depend on serverside collision.
     */
    function getSeed() {
        return Date.now();
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

(function () {
    // LocalStorage keys for reference
    const savedResponseKey = 'response';
    const preloadedImagesKey = 'preloaded';
    const preloadingImagesKey = 'preloading';

    // Settings for cache aggressiveness
    const artworksToPrefetch = 50;
    const imagesToPreload = 7;

    const imagesToPreloadPerSession = 3;
    let imagesPreloadedThisSession = 0;

    let tombstoneElement;
    let titleElement;
    let artistElement;
    let artworkContainer;
    let viewer;

    document.addEventListener('DOMContentLoaded', function (event) {
        tombstoneElement = document.getElementById('tombstone');
        titleElement = document.getElementById('title');
        artistElement = document.getElementById('artist');
        artworkContainer = document.getElementById('artwork-container');

        viewer = OpenSeadragon({
            element: artworkContainer,
            xmlns: 'http://schemas.microsoft.com/deepzoom/2008',
            prefixUrl: '//openseadragon.github.io/openseadragon/images/',
            homeFillsViewer: false,
            mouseNavEnabled: false,
            springStiffness: 15,
            visibilityRatio: 1,
            zoomPerScroll: 1.2,
            zoomPerClick: 1.3,
            immediateRender: true,
            constrainDuringPan: true,
            animationTime: 1.5,
            minZoomLevel: 0,
            minZoomImageRatio: 0.8,
            maxZoomPixelRatio: 1.0,
            defaultZoomLevel: 0,
            gestureSettingsMouse: {
                scrollToZoom: true,
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

        getJson('https://api.artic.edu/api/v1/search', getQuery(), processResponse);
    });

    function getJson(url, body, callback) {
        let request = new XMLHttpRequest();
        request.open('POST', url, true);
        request.setRequestHeader('Content-Type', 'application/json');
        request.onreadystatechange = function () {
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

        // Remove any artwork not in left-over response from preloaded trackers
        let imageIdsInResponse = response.data.map(function (item) {
            return item.image_id;
        });

        let preloadedImages = JSON.parse(localStorage.getItem(preloadedImagesKey)) || [];
        let preloadingImages = JSON.parse(localStorage.getItem(preloadingImagesKey)) || [];

        preloadedImages = preloadedImages.filter(function (item) {
            return imageIdsInResponse.includes(item);
        });

        preloadingImages = preloadingImages.filter(function (item) {
            return imageIdsInResponse.includes(item);
        });

        localStorage.setItem(preloadingImagesKey, JSON.stringify(preloadingImages));
        localStorage.setItem(preloadedImagesKey, JSON.stringify(preloadedImages));

        updatePage(artwork);
    }

    function updatePage(artwork) {
        let artistPrint = [artwork.artist_title, artwork.date_display]
            .filter(function (el) {
                return el != null;
            })
            .join(', ');

        let titlePrint = artwork.title ? artwork.title : '';

        let linkToArtwork = 'https://www.artic.edu/artworks/' + artwork.id + '/' + slugify(titlePrint);

        // Track referrals from the extension in analytics
        linkToArtwork += '?utm_medium=chrome-extension&utm_source=' + titlePrint;

        artistElement.innerHTML = artistPrint;
        titleElement.innerHTML = titlePrint;
        tombstoneElement.setAttribute('href', linkToArtwork);

        var downloadUrl = 'https://www.artic.edu/iiif/2/' + artwork.image_id + '/full/3000,/0/default.jpg';

        document.getElementById('download-link').setAttribute('href', downloadUrl);

        document.getElementById('download-link').setAttribute('download', titlePrint + '.jpg');

        document.getElementById('artwork-url').setAttribute('href', linkToArtwork);

        // Work-around for saving canvas images with white borders
        document
            .getElementById('artwork-save-overlay')
            .setAttribute('src', 'https://www.artic.edu/iiif/2/' + artwork.image_id + '/full/843,/0/default.jpg');

        addTiledImage(artwork, false);
    }

    /**
     * Work-around to encourage cache collision.
     *
     * https://openseadragon.github.io/examples/tilesource-legacy/
     */
    function getIIIFLevel(artwork, displayWidth) {
        return {
            url: 'https://www.artic.edu/iiif/2/' + artwork.image_id + '/full/' + displayWidth + ',/0/default.jpg',
            width: displayWidth,
            height: Math.floor((artwork.thumbnail.height * displayWidth) / artwork.thumbnail.width),
        };
    }

    function addTiledImage(artwork, isPreload) {
        // Save this so we can add it to our preload log
        let currentImageId = artwork.image_id;

        // https://openseadragon.github.io/docs/OpenSeadragon.Viewer.html#addTiledImage
        viewer.addTiledImage({
            tileSource: {
                type: 'legacy-image-pyramid',
                levels: [
                    getIIIFLevel(artwork, 200),
                    getIIIFLevel(artwork, 400),
                    getIIIFLevel(artwork, 843),
                    getIIIFLevel(artwork, 1686),
                ],
            },
            opacity: isPreload ? 0 : 1,
            preload: isPreload ? true : false,
            success: function (event) {
                // https://openseadragon.github.io/docs/OpenSeadragon.TiledImage.html#.event:fully-loaded-change
                event.item.addHandler('fully-loaded-change', function (callbackObject) {
                    let tiledImage = callbackObject.eventSource;

                    // We don't want this to fire on every zoom and pan
                    tiledImage.removeAllHandlers('fully-loaded-change');

                    // We want to check LocalStorage each time in case multiple new tabs are preloading
                    let preloadedImages = JSON.parse(localStorage.getItem(preloadedImagesKey)) || [];
                    let preloadingImages = JSON.parse(localStorage.getItem(preloadingImagesKey)) || [];

                    // Be sure to exclude the current image from preloading!
                    let excludedImages = preloadedImages.concat(preloadingImages, [currentImageId]);

                    if (isPreload) {
                        if (!preloadedImages.includes(currentImageId)) {
                            preloadedImages.push(currentImageId);
                        }

                        preloadingImages = preloadingImages.filter(function (item) {
                            return item !== currentImageId;
                        });

                        localStorage.setItem(preloadingImagesKey, JSON.stringify(preloadingImages));
                        localStorage.setItem(preloadedImagesKey, JSON.stringify(preloadedImages));

                        tiledImage.destroy(); // don't load more tiles during zoom and pan

                        imagesPreloadedThisSession++;
                    }

                    // Exit early if we have enough images preloaded
                    if (
                        excludedImages.length > imagesToPreload ||
                        imagesPreloadedThisSession >= imagesToPreloadPerSession
                    ) {
                        return;
                    }

                    // We want the freshest data to determine what to cache next
                    let savedResponse = JSON.parse(localStorage.getItem(savedResponseKey));

                    // TODO: Preload next API response here if there's too few items remaining?
                    if (savedResponse !== null && savedResponse.data.length > 0) {
                        let nextArtwork = savedResponse.data.find(function (item) {
                            return !excludedImages.includes(item.image_id);
                        });

                        if (nextArtwork) {
                            preloadingImages.push(nextArtwork.image_id);
                            localStorage.setItem(preloadingImagesKey, JSON.stringify(preloadingImages));
                            addTiledImage(nextArtwork, true);
                        }
                    }
                });
            },
        });
    }

    function getQuery() {
        return {
            resources: 'artworks',
            // prettier-ignore
            fields: [
                'id',
                'title',
                'artist_title',
                'image_id',
                'date_display',
                'thumbnail',
            ],
            boost: false,
            limit: artworksToPrefetch,
            query: {
                function_score: {
                    query: {
                        bool: {
                            filter: [
                                {
                                    term: {
                                        is_public_domain: true,
                                    },
                                },
                                {
                                    exists: {
                                        field: 'image_id',
                                    },
                                },
                                {
                                    exists: {
                                        field: 'thumbnail.width',
                                    },
                                },
                                {
                                    exists: {
                                        field: 'thumbnail.height',
                                    },
                                },
                            ],
                        },
                    },
                    boost_mode: 'replace',
                    random_score: {
                        field: 'id',
                        seed: getSeed(),
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
        return text
            .toString()
            .toLowerCase()
            .replace(/\s+/g, '-') // Replace spaces with -
            .replace(/[^\w\-]+/g, '') // Remove all non-word chars
            .replace(/\-\-+/g, '-') // Replace multiple - with single -
            .replace(/^-+/, '') // Trim - from start of text
            .replace(/-+$/, ''); // Trim - from end of text
    }
})();

var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-4351925-30']);
_gaq.push(['_trackPageview']);

(function () {
    var ga = document.createElement('script');
    ga.type = 'text/javascript';
    ga.async = true;
    ga.src = 'https://ssl.google-analytics.com/ga.js';
    var s = document.getElementsByTagName('script')[0];
    s.parentNode.insertBefore(ga, s);
})();

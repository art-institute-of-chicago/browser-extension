(function () {

    getJson('https://aggregator-data.artic.edu/api/v1/search', getQuery(), updatePage);

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

        let titleElement = document.querySelector('#title a');
        let artistElement = document.getElementById('artist');

        let artistPrint = [artwork.artist_title, artwork.date_display].filter(function (el) {
            return el != null;
        }).join(', ');
        let titlePrint = artwork.title;
        let linkToArtwork = 'https://www.artic.edu/artworks/' + artwork.id + '/' + slugify(titlePrint);

        artistElement.innerHTML = artistPrint;
        titleElement.innerHTML = titlePrint;
        titleElement.setAttribute('href', linkToArtwork);

        let imageID = artwork.image_id;
        let windowWidth = window.innerWidth;
        let windowHeight = window.innerHeight;
        let imageWidth = artwork.thumbnail.width;
        let imageHeight = artwork.thumbnail.height;

        //resize image to fit in browser
        let newImageWidth = Math.round(window.innerWidth * .80);
        let newImageHeight = Math.round(window.innerHeight * .80);

        imageWidth = newImageWidth;
        imageHeight = newImageHeight;

        //use iiif protocol to display and fit image in browser window space
        let imageLink = '<img src ="https://www.artic.edu/iiif/2/' + imageID + '/full/!' + imageWidth + ',' + imageHeight + '/0/default.jpg">'
        imageLink = '<a href="' + linkToArtwork + '">' + imageLink + '</a>';
        document.getElementById("artwork-container").innerHTML = imageLink;

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

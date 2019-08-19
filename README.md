![Art Institute of Chicago](https://raw.githubusercontent.com/Art-Institute-of-Chicago/template/master/aic-logo.gif)

# Art Institute of Chicago Browser Extension (DRAFT)

This Chrome plug-in presents a work of art in the browser window every time a new tab is opened. It uses the Art Institute of Chicago's new data API to access images and other data for over 50,000 artworks.

For public use, we've made this extension available in the Chrome Web Store [link]. We're providing this repo to serve as a simple example of using the Art Institute of Chicago's data API.

## Features

* Presents artwork from the Art Institute's collection in every new browser tab
* Demonstrates use of the Art Institute's data API

## Requirements

Chrome browser in Developer Mode

## Installing

Clone or download the project:

```shell
git clone https://github.com/art-institute-of-chicago/aic-browser-extension.git
cd aic-browser-extension
```

* If you downloaded a zip file from GitHub, unzip the package
* From Chrome menu choose Window - Extensions
* Toggle on "Developer Mode"
* Click "Load Unpacked"
* Select the aic-browser-extension folder you cloned
* Optionally toggle "Developer Mode" off

![Screenshot of Chrome Windows menu with Extensions highlighted](docs/chrome-setup-1.jpg)

![Screenshot of the Extensions window ](docs/chrome-setup-2.jpg)

## Configuration

In [script.js](script.js), you'll find the query that fetches a random artwork:

```
let timeStamp = Math.floor(Date.now() / 1000);
    let artworkRequest = {
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
```

## Contributing

We encourage your contributions. Please fork this repository and make your changes in a separate branch. To better understand how we organize our code, please review our [version control guidelines](https://docs.google.com/document/d/1B-27HBUc6LDYHwvxp3ILUcPTo67VFIGwo5Hiq4J9Jjw).

```bash
# Clone the repo to your computer
git clone git@github.com:your-github-account/aic-browser-extension.git

# Enter the folder that was created by the clone
cd browser-extension

# Start a feature branch
git checkout -b feature/good-short-description

# ... make some changes, commit your code

# Push your branch to GitHub
git push origin feature/good-short-description
```

Then on github.com, create a Pull Request to merge your changes into our
`develop` branch.

This project is released with a Contributor Code of Conduct. By participating in
this project you agree to abide by its [terms](CODE_OF_CONDUCT.md).

We welcome bug reports and questions under GitHub's [Issues](issues). For other concerns, you can reach our engineering team at [engineering@artic.edu](mailto:engineering@artic.edu)

## Acknowledgements

Thanks to [Abdur Khan](https://github.com/AKhan139), a 2018 summer intern in the Experience Design department
at the Art Institute of Chicago that kicked off this project. [Tina Shah](https://github.com/surreal8),
[nikhil trivedi](https://github.com/nikhiltri), [Illya Moskvin](https://github.com/IllyaMoskvin)
and [Mark Dascoli](https://github.com/markdascoli) finished up what he started.

The following article was the starting point for this project:

[How to Create and Publish a Chrome Extension in 20 minutes](https://www.freecodecamp.org/news/how-to-create-and-publish-a-chrome-extension-in-20-minutes-6dc8395d7153/) from [freeCodeCamp.org](https://freeCodeCamp.org)

## Licensing

This project is licensed under the [GNU Affero General Public License
Version 3](LICENSE).

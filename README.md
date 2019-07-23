![Art Institute of Chicago](https://raw.githubusercontent.com/Art-Institute-of-Chicago/template/master/aic-logo.gif)

# DRAFT - aic-browser-extension

This Chrome Plug-in presents a work of art in the browser window every time a new tab is opened. It uses the Art Institute of Chicago's new data API to access images and other data for over 50,000 artworks.

We've made this compiled extension available for public distribution [link]. We're providing this repo to serve as simple example of using AIC's data API.

## Features

* Presents artwork from AIC's collection in every new browser tab
* Demonstrates use of AIC's data API

## Requirements

Chrome browser in Developer Mode

## Installing

Git clone or download the project:

```shell
git clone https://github.com/art-institute-of-chicago/aic-browser-extension.git
cd aic-browser-extension
```

* From Chrome menu choose Window - extensions
* Toggle on Developer Mode
* Click Load Unpacked
* Select aic-browser-extension folder
* Optionally toggle developer mode off

(add screenshbots)


## Configuration

This is the query that fetches a random artwork:

```
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
                    "constant_score" : {
                        "filter": {
                            "exists": {
                                "field": "image_id"
                            }
                        }
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

We encourage your contributions. Please fork this repository and make your changes in a separate branch.
We like to use [git-flow](https://github.com/nvie/gitflow) to make this process easier.

```bash
# Clone the repo to your computer
git clone git@github.com:your-github-account/aic-browser-extension.git

# Enter the folder that was created by the clone
cd browser-extension

# Start a feature branch
git flow start feature yourinitials-good-description-issuenumberifapplicable

# ... make some changes, commit your code

# Push your branch to GitHub
git push origin yourinitials-good-description-issuenumberifapplicable
```

Then on github.com, create a Pull Request to merge your changes into our
`develop` branch.

This project is released with a Contributor Code of Conduct. By participating in
this project you agree to abide by its [terms](CODE_OF_CONDUCT.md).

We also welcome bug reports and questions under GitHub's [Issues](issues).

If there's anything else a developer needs to know (e.g. the code style
guide), you should link it here. If there's a lot of things to take into
consideration, separate this section to its own file called `CONTRIBUTING.md`
and say that it exists here.

## Acknowledgements

Thanks to Tina, Abdur, Nikhil, Illya.

The following article was the starting point for this project:

[How to Create and Publish a Chrome Extension in 20 minutes](https://www.freecodecamp.org/news/how-to-create-and-publish-a-chrome-extension-in-20-minutes-6dc8395d7153/) from [freeCodeCamp.org](https://freeCodeCamp.org)

## Licensing

This project is licensed under the [GNU Affero General Public License
Version 3](LICENSE).

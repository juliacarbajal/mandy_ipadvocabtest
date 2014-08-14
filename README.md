# LSCP iDevXXI App

This app is designed to perform experiments about language learning in babies. It will be composed of several mini games. For now, it's only one game, called Word Comprehension.

This app communicates with a back-office that receives and safely stores the experimental data.

* **Client**: [LSCP](http://www.lscp.net)
* **Targeted platform**: iPad with iOS 7.1 or newer

![Mandy](http://idevxxi.acristia.org/assets/mandy-hello-b3c05f337045d53c2c709f49598bcf43.png) *Say hi to Mandy!*

## Dependencies

* Git
* Node and npm ([download](http://nodejs.org/download/))
* Bower `npm install -g bower`
* Gulp (will be installed by npm)

### Phonegap plugins

* [Device](https://build.phonegap.com/plugins/628)

## Local development setup

* clone the repository
* `npm install`
* `bower install`

Run `gulp watch` for in-browser development and test with livereload.

## Deploy

We do not package the app locally, but use [Phonegap Build](http://build.phonegap.com) instead.

Run `gulp` to prepare the app for release and create a zip archive, then upload it to Phonegap Build to package the app.
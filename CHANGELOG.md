## CHANGELOG

## v2.0.2 on 2023-04-20

* Remove prepublishOnly script. Moving files after tagging was causing uncommitted changes

## v2.0.1 on 2023-04-20

* Update README, update package name to include npm org

## v2.0.0 on 2023-04-19

* Switch to fetch due to errors when running axios on the server. Switch to dual-entry point configuration. One for browser, one for node. Update readme, documentation, migrate tests to jest.

## v1.5.3 on 2023-04-12

* Fix an issue with webpack config causing imports via require to throw an error

## v1.5.2 on 2022-08-23

* Fix issue where `-latest` was missing from link to map file

## v1.5.1 on 2022-08-23

* Deploy minified `.map` file as well

### v1.5.0 on 2022-07-14

* Add quality event reporting to analytics on level switch [#39]

### v1.4.1 on 2021-09-09

* Avoid DOMException in incognito browsers accessing localStorage

### v1.4.0 on 2021-04-15

* Support re-attaching analytics to a new broadcast #28
* Update JW Player example to use a playlist #28

### v1.3.9 on 2021-01-05

* Updated dependencies (webpack v5)

### v1.3.8 on 2020-04-30

* Do not attempt to present playlist if not reporting live or recorded [DS-453] [#20]

### v1.3.7 on 2019-12-30

* Fix buffering analytics for FireTV #18

### v1.3.6 on 2019-11-06

* Security updates for npm dependencies

### v1.3.5 on 2019-11-06

* Use a monotonic clock to accumulate playing/buffering time #11

### v1.3.4 on 2019-10-08

* Fix reported buffering calculation #10

### v1.3.3 on 2019-09-26

* Fix React Native crash caused by error serialization #9

### v1.3.2 on 2019-08-19

* Fix React Native crash caused by missing window.location.hostname #6

### v1.3.0 on 2019-06-26

* Add support for react-native-video analytics implementations #5

### v1.2.0 on 2019-03-08

* Support authenticated API queries using client credentials #4

### v1.1.0 on 2019-01-09

* Add support for video.js and ChromeCast analytics implementations #2

### v1.0.0 on 2018-11-12

* Initial release

gmap
====

google maps api test


Convert shp to geojson with no alteration
=========================================

Use ogr::

  ogr2ogr -f "GeoJSON" seattle_city_council_districts.json seattle_city_council_districts.shp seattle_city_council_districts

http://stackoverflow.com/questions/2223979/convert-a-shapefile-shp-to-xml-json

Make a geojson from shp with python
===================================

http://gis.stackexchange.com/a/41658


gh-pages
========

http://ryanfitzer.org/2011/11/easy-syncing-of-github-pages/

mirroring::

  git checkout gh-pages
  git merge master
  git push origin gh-pages
  git checkout master


http://lucasw.github.io/gmap/census.html

Non interactive district boundaries:
http://lucasw.github.io/gmap/index.html

Posts about these:
https://plus.google.com/103190342755104432973/posts/f1sYkZ51vVt
https://plus.google.com/103190342755104432973/posts/BE2BnSH7uW4

TODO
====

Make a district 2 and 3 parcel geojson

seattle_census_tracts_district_2.json
seattle_census_tracts_district_3.json

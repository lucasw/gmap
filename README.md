gmap
====

google maps api test


Convert shp to geojson with no alteration
=========================================

Use ogr::
  ogr2ogr -f "GeoJSON" seattle_city_council_districts.json seattle_city_council_districts.shp seattle_city_council_districts

http://stackoverflow.com/questions/2223979/convert-a-shapefile-shp-to-xml-json

Make a geojson from python
==========================

http://gis.stackexchange.com/a/41658


gh-pages
========

http://ryanfitzer.org/2011/11/easy-syncing-of-github-pages/

mirroring::
  git checkout gh-pages
  git merge master
  git push origin gh-pages
  git checkout master

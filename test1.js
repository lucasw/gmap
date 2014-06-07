var map;
function initialize() {
  var mapOptions = {
    center: new google.maps.LatLng(47.6043, -122.342),
        zoom: 8
  };
  map = new google.maps.Map(document.getElementById("map-canvas"),
      mapOptions);

  map.data.loadGeoJson("../gis/data//seattle_city_council_districts/seattle_city_council_districts.json");
}
google.maps.event.addDomListener(window, 'load', initialize);


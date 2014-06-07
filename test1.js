var map;
function initialize() {
  var mapOptions = {
    center: new google.maps.LatLng(47.6043, -122.342),
        zoom: 12
  };
  map = new google.maps.Map(document.getElementById("map-canvas"),
      mapOptions);

  map.data.loadGeoJson("data/seattle_city_council_districts.json");

  // Color Capital letters blue, and lower case letters red.
  // Capital letters are represented in ascii by values less than 91
  map.data.setStyle(function(feature) {
      var id = feature.getProperty('id');

      var h = Math.round( 360 * id/7 );
      var s = "90%";
      var l = "60%";
      var color = "hsl(" + h + "," + s + "," + l +")";
      console.log(id + " " + color);
      return {
        fillColor: color,
        fillOpacity: 0.2,
        strokeWeight: 1
      };
  });

}

google.maps.event.addDomListener(window, 'load', initialize);


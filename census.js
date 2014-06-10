var map;
function initialize() {
  var mapOptions = {
    center: new google.maps.LatLng(47.6043, -122.342),
        zoom: 12
  };
  map = new google.maps.Map(document.getElementById("map-canvas"),
      mapOptions);

  map.data.loadGeoJson("data/seattle_census_tracts.json");
  
  var infowindow = new google.maps.InfoWindow({
    content: str(density)
  });

  map.data.setStyle(function(feature) {
      var density = feature.getProperty('density');

      var h = Math.round( 360 * density/100.0);
      var s = "90%";
      var l = "60%";
      fill_opacity = 0.2;
      if (density == 0) {
        fill_opacity = 0.01;
        l = "100%";
      }
      var color = "hsl(" + h + "," + s + "," + l +")";
      var stroke_color = "hsl(" + h + ", 90%, 30%)";
      console.log(density + " " + color);
      return {
        fillColor: color,
        fillOpacity: fill_opacity,
        strokeColor: stroke_color, 
        strokeWeight: 1,
        strokeOpacity: 0.25
      };

      // this is probably the wrong time to do this?
      google.maps.event.addListener(feature, 'click', function() {
        infowindow.open(map, feature); 
      });

      // how to put a label at the center of the feature?
      // Probably ought to save the centroid into the json properties?
      // Better tools in python than javascript
  });
}

google.maps.event.addDomListener(window, 'load', initialize);


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
  });

  /*
  map.data.forEach(function(feature) {
    var density = feature.getProperty('density');
    var area = feature.getProperty('area');
    
    feature.content = '<div id="content">' +
        '<p>feature' +
        '<p>' + density + ' people per acre' +
        '<p>' + area + ' acres' +
        '</div>'; 

    console.log(density);
  });
*/

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
      //console.log(density + " " + color);
      // this is probably the wrong time to do this?

      // how to put a label at the center of the feature?
      // Probably ought to save the centroid into the json properties?
      // Better tools in python than javascript
      return {
        fillColor: color,
        fillOpacity: fill_opacity,
        strokeColor: stroke_color, 
        strokeWeight: 1,
        strokeOpacity: 0.4
      };

  });

  // this marker will flash on screen at this location when a new
  // feature is clicked
  var homeLatLng = new google.maps.LatLng(47.0043, -122.342);
  var marker_tract = new MarkerWithLabel({
    position: homeLatLng,
    draggable: false,
    raiseOnDrag: false,
    map: map,
    labelContent: "",
    labelAnchor: new google.maps.Point(0, 0),
    labelClass: "labels", // the CSS class for the label
    labelStyle: {opacity: 0.75},
    icon: {}
  });

  map.data.addListener('click', function(event) {
    var density = event.feature.getProperty('density');
    var area = event.feature.getProperty('area');
    
    var content = '<div id="content">'; // +
        //'<br>Census Tract'; // +
        //'<br>' + density.toFixed(2) + ' people per acre' +
        //'<br>' + area.toFixed(2) + ' acres' +

    event.feature.forEachProperty(function(value, property) {
        if (property == 'density') value = value.toFixed(2) + ' persons/acre';
        if (property == 'area') value = value.toFixed(2) + ' acres';
        content +=  property + ' : ' + value + '<br>';
        });

    content += '</div>'; 
    //console.log(content);
    infowindow.setContent(content);
    //infowindow.open(this.getMap(), this);
    marker_tract.position = event.latLng;  // anything like feature.getPosition(); //TBD
    infowindow.open(map, marker_tract);

    map.data.revertStyle();
    map.data.overrideStyle(event.feature, 
      {strokeOpacity: 0.9, strokeWeight: 3, strokeColor: 'black'} );
  });
 
}

google.maps.event.addDomListener(window, 'load', initialize);


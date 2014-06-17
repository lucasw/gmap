var map;
var selected_tractce = -1;
var zoom_level = 14;

function initialize() {
  var mapOptions = {
    center: new google.maps.LatLng(47.6043, -122.342),
        zoom: zoom_level // 12 covers most of Seattle
  };
  map = new google.maps.Map(document.getElementById("map-canvas"),
      mapOptions);

  //map.data.loadGeoJson("data/seattle_census_tracts.json");
  map.data.loadGeoJson("data/seattle_census_tracts_district_7.json"); 
  
  var infowindow = new google.maps.InfoWindow({
  });

  google.maps.event.addListener(map, 'zoom_changed', function() {
      
      zoom_level = map.getZoom();
      console.log("zoom " + zoom_level);
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
      var stroke_opacity = 0.4;

      //console.log(tractce + " " + selected_tractce);
      

      //console.log(density + " " + color);
      // this is probably the wrong time to do this?

      // how to put a label at the center of the feature?
      // Probably ought to save the centroid into the json properties?
      // Better tools in python than javascript
      return {
        fillColor: color,
        fillOpacity: fill_opacity,
        zIndex: 5,
        strokeColor: stroke_color, 
        strokeWeight: 1,
        strokeOpacity: stroke_opacity
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

  // click for infowindow
  map.data.addListener('click', function(event) {
    map.data.revertStyle();
    var density = event.feature.getProperty('density');
    var area = event.feature.getProperty('area');
    
    var content = '<div class="info" id="content">'; // +

    event.feature.forEachProperty(function(value, property) {
        if (property == 'BLOCKID10') {
          return;
        }
        if (property == 'TRACTCE10') {
          selected_tractce = value;
          //console.log(selected_tractce);
        }
        if (property == 'density') value = value.toFixed(2) + ' persons/acre';
        if (property == 'area') value = value.toFixed(2) + ' acres';
        content +=  property + ' : ' + value + '<br>';
        });

    console.log("cur tract " + selected_tractce);


    map.data.forEach(function(feature) {
      var tractce = feature.getProperty('TRACTCE10');
      if (tractce == selected_tractce) {
        var blockce = feature.getProperty('BLOCKCE');
        //console.log("cur block " + blockce + "," + feature);
        map.data.overrideStyle(feature, 
        {
          zIndex: 6,
          strokeOpacity: 0.7, 
          strokeWeight: zoom_level/7.0 + 1, 
          strokeColor: 'red'
          } );
      }
    });
    
    content += '</div>'; 
    //console.log(content);
    infowindow.setContent(content);
    //marker_tract.position = event.latLng; 
    marker_tract.position =new google.maps.LatLng(event.latLng.lat(), event.latLng.lng() + 0.015); 
    infowindow.open(map, marker_tract);
    //infowindow.setPosition(event.latLng);

    map.data.overrideStyle(event.feature, 
      {
        zIndex: 7,
        strokeOpacity: 0.9, 
        strokeWeight: 4, 
        strokeColor: 'black'
        } );
  }); // click for info window
 
}

google.maps.event.addDomListener(window, 'load', initialize);


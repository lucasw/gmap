var map;
var infos = {};
function initialize() {
  var mapOptions = {
    center: new google.maps.LatLng(47.6043, -122.342),
        zoom: 12
  };
  map = new google.maps.Map(document.getElementById("map-canvas"),
      mapOptions);

  map.data.loadGeoJson("data/seattle_city_council_districts.json");
  
  var infowindow = new google.maps.InfoWindow({});

  // Color Capital letters blue, and lower case letters red.
  // Capital letters are represented in ascii by values less than 91
  map.data.setStyle(function(feature) {
      var id = feature.getProperty('id');

      var h = Math.round( 360 * id/7 );
      var s = "90%";
      var l = "60%";
      var color = "hsl(" + h + "," + s + "," + l +")";
      var stroke_color = "hsl(" + h + ", 90%, 30%)";
     
      // is this the right place to define this?
      feature.content = '<div id="content">' +
        '<p>feature' +
        '<p>' + feature.getProperty('id') +
        '</div>'; //h + " " + id;
      // TBD
      //http://stackoverflow.com/questions/24144782/example-of-using-feature-foreachproperty-in-google-maps-javascript-v3
      //feature.forEachPropert(
      console.log(feature.content);

      return {
        fillColor: color,
        fillOpacity: 0.0,
        strokeColor: stroke_color, 
        strokeWeight: 5
      };

  });

  var homeLatLng = new google.maps.LatLng(47.6043, -122.342);
  var marker_tract = new MarkerWithLabel({
    position: homeLatLng,
    draggable: true,
    raiseOnDrag: false,
    map: map,
    labelContent: "Seattle Council Districts",
    labelAnchor: new google.maps.Point(100, 0),
    labelClass: "labels", // the CSS class for the label
    labelStyle: {opacity: 0.75},
    icon: {}

  });

  //google.maps.event
  map.data.addListener('click', function(event) {
      console.log(event.feature.content);
      infowindow.setContent(event.feature.content);
      //infowindow.open(this.getMap(), this);
      marker_tract.position = event.latLng;  // anything like feature.getPosition(); //TBD
      infowindow.open(map, marker_tract); 
  });

  var latLng0 = new google.maps.LatLng(47.609635,-122.456019);
  var marker0 = new MarkerWithLabel({
    position: latLng0,
    draggable: true,
    raiseOnDrag: false,
    map: map,
    labelContent: "Seattle Council Districts",
    labelAnchor: new google.maps.Point(100, 0),
    labelClass: "labels", // the CSS class for the label
    labelStyle: {opacity: 0.75},
    icon: {}

  });


  // TBD replace these with locations that are population 
  // centroids, compute them in python 
  var distLatLngs = [
      new google.maps.LatLng(47.568419,-122.375336),
      new google.maps.LatLng(47.567724,-122.298775),
      new google.maps.LatLng(47.614033,-122.309418),
      new google.maps.LatLng(47.662844,-122.298088),
      new google.maps.LatLng(47.707913,-122.327957),
      new google.maps.LatLng(47.668624,-122.374992),
      new google.maps.LatLng(47.627917,-122.357826),
      ];
  // java scoping problem is only ever keeping the last 
  // infowindow around
  //  http://stackoverflow.com/questions/3576488/google-maps-infowindow-only-loading-last-record-on-markers
  //var markers = {};
  for (var i = 0; i < distLatLngs.length; i++) {
    var marker = new MarkerWithLabel({
      position: distLatLngs[i],
      draggable: false,
      raiseOnDrag: false,
      map: map,
      labelContent: (i+1),
      labelAnchor: new google.maps.Point(20, 20),
      labelClass: "dist_labels", // the CSS class for the label
      labelStyle: {opacity: 0.75},
      icon: {}
    });
    marker.content = "District " + (i+1)

  }


} // initialize

google.maps.event.addDomListener(window, 'load', initialize);


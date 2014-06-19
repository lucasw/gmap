var map;
var info;
var selected_tractce = [];
var zoom_level = 14;

var multiple_selection = false;

function addToSelection() {
  multiple_selection = true; 
  makeButtons();
}

function switchToSingleSelection() {
  multiple_selection = false; 
  makeButtons();
}

function clearSelection() {
  selected_tractce = []; 
}

// TBD box selection

function makeButtons() {
  buttons = document.getElementById("buttons");
  buttons.innerHTML = '<br>';
  if (!multiple_selection) { 
    //console.log("multiple selection");
    buttons.innerHTML += '<button onclick="addToSelection()">Add to selection</button>';
  } else {
    //console.log("starting new selection");
    buttons.innerHTML += '<button onclick="switchToSingleSelection()">Switch To Single Selection</button>';
  }
  buttons.innerHTML += '<button onclick="clearSelection()">Clear Selection</button>';
  buttons.innerHTML += '<br>';
}

function initialize() {
  var mapOptions = {
    center: new google.maps.LatLng(47.6043, -122.342),
        zoom: zoom_level // 12 covers most of Seattle
  };
  map = new google.maps.Map(document.getElementById("map-canvas"),
      mapOptions);
  
  info = document.getElementById("info");
  info.innerHTML = "Select a block to get information"; 

  makeButtons();

  //map.data.loadGeoJson("data/seattle_census_tracts.json");
  map.data.loadGeoJson("data/seattle_census_tracts_district_7.json"); 

  google.maps.event.addListener(map, 'zoom_changed', function() {
      
      zoom_level = map.getZoom();
      console.log("zoom " + zoom_level);
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

  // click to update info
  map.data.addListener('click', function(event) {
  map.data.revertStyle();
    
    var content = "";

    event.feature.forEachProperty(function(value, property) {
        if (property == 'BLOCKID10') {
          return;
        }
        if (property == 'TRACTCE10') {
          if (multiple_selection) {
            // only add if not
            if (selected_tractce.indexOf(value) < 0) {
              selected_tractce[selected_tractce.length] = value;
            }
          } else {
            selected_tractce = [value];

          }
          //console.log(selected_tractce);
        }
        if (property == 'density') value = value.toFixed(2) + ' persons/acre';
        if (property == 'area') value = value.toFixed(2) + ' acres';
        content +=  property + ' : ' + value + '<br>';
        });

    console.log("cur tract " + selected_tractce);

    
    total_population = 0;
    total_area = 0;
    map.data.forEach(function(feature) {
      var tractce = feature.getProperty('TRACTCE10');
      for (var i = 0; i < selected_tractce.length; i++) {
        if (tractce == selected_tractce[i]) {
          
          total_area += feature.getProperty('area');
          total_population += feature.getProperty('POP10');
          
          //var blockce = feature.getProperty('BLOCKCE');
          //console.log("cur block " + blockce + "," + feature);
          map.data.overrideStyle(feature, 
          {
            zIndex: 6,
            strokeOpacity: 0.7, 
            strokeWeight: zoom_level/7.0 + 1, 
            strokeColor: 'red'
            } );
        }
      } // for each selected
    });
   
    content += '<br><br>';
    content += 'total population :' + total_population.toFixed(2) + '<br>';
    content += 'total area :' + total_area.toFixed(2) + '<br>';
    content += 'total density :' + (total_population/total_area).toFixed(2) + '<br>';

    content += '<br><br><br>'; 
    //console.log(content);
    info.innerHTML = content; 

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


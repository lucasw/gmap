var map;
var info;
var selected_tractce = [];
var selected_blocks = [];
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
  selected_blocks = []; 
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

    var tractce = event.feature.getProperty('TRACTCE10');
    selected_tractce = [tractce];
    var block = event.feature.getProperty('BLOCKCE');
   
    var new_block = {
        'tract':tractce,
        'block':block
    };
                                    
    if (multiple_selection) {
      // only add if not in list already TBD indexOf like this doesn't work
      var not_a_dupe = true;

      for (var i = 0; i < selected_blocks.length; i++) {
        // TBD the block numbers aren't unique
        if ((block == selected_blocks[i].block) && 
            (tractce == selected_blocks[i].tract)) {
          not_a_dupe = false;
          break;
        }
      }

      if (not_a_dupe) {
        selected_blocks[selected_blocks.length] = new_block;
      }
    } else {
      selected_blocks = [new_block];
    }

    event.feature.forEachProperty(function(value, property) {
        if (property == 'BLOCKID10') {
          return;
        }
          
        if (property == 'density') value = value.toFixed(2) + ' persons/acre';
        if (property == 'area') value = value.toFixed(2) + ' acres';
        content +=  property + ' : ' + value + '<br>';
    });

    console.log("cur tract " + selected_tractce[0]);

    total_population = 0;
    total_area = 0;
    map.data.forEach(function(feature) {
      
      // for each selected block highlight if in same tract as selected
      if (false) { //for (var i = 0; i < selected_tractce.length; i++) {
        if (tractce == selected_tractce[i]) {
          map.data.overrideStyle(feature, 
          {
            zIndex: 6,
            strokeOpacity: 0.7, 
            strokeWeight: zoom_level/10.0 + 1, 
            strokeColor: 'red'
            } );
        }
      }  
      
      var cur_block = feature.getProperty('BLOCKCE');
      var cur_tract = feature.getProperty('TRACTCE10');
      // aggregate stats over whole selection of blocks
      for (var i = 0; i < selected_blocks.length; i++) {
        // the block numbers aren't unique
        if ((cur_block == selected_blocks[i].block) && 
            (cur_tract == selected_blocks[i].tract)) {
          //console.log(selected_blocks[i]);
          total_area += feature.getProperty('area');
          total_population += feature.getProperty('POP10');
          map.data.overrideStyle(feature, 
            {
              zIndex: 7,
              strokeOpacity: 0.7, 
              strokeWeight: 3, 
              strokeColor: 'black'
            } );
        }
      } // for each selected block highlight 
    });  // for each feature
   
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


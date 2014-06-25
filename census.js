var map;
var info;
var square_select_one = false;
var square_select_two = false;
var sq_latlng1 = null;
var sq_latlng2 = null;
var selected_rect = null;

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
  square_select_one = false;
  square_select_two = false;
  sq_latlng1 = null;
  sq_latlng2 = null;
}

function selectSquareCorner() {
  if (!square_select_one || (sq_latlng1 == null)) {
    console.log("select first corner");
    square_select_one = true;
    sq_latlng1 = null;
    sq_latlng2 = null;
  } /*else {
    console.log("select second corner");
    square_select_two = true;
    sq_latlng2 = null;
  }*/
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
  buttons.innerHTML += '<br>';
  if (square_select_one || square_select_two) {
    buttons.innerHTML += '<button onclick="selectSquareCorner()">Reset square select corner</button>';
  } else {
    buttons.innerHTML += '<button onclick="selectSquareCorner()">Square select corner</button>';
  }
  buttons.innerHTML += '<br>';
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
  /*
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
  */

  selected_rect = new google.maps.Rectangle({
    strokeColor: "hsl(50%, 80%, 30%)",
    srokeOpacity: 0.9,
    strokeWeight: 2,
    fillColor: "hsl(55%, 80%, 30%)",
    fillOpacity: 0.5,
    zIndex: 4,
    map: map,
    bounds: new google.maps.LatLngBounds(
      new google.maps.LatLng(0,0),
      new google.maps.LatLng(0,0)
    )
  });

  /* // Try to respond to click anywhere, but not working
  google.maps.event.addListener('click', function(event) {
    
    console.log("click " +  event.latLng);
    var content = "";
 

  });
  */

  // click to update info
  map.data.addListener('click', function(event) {
    map.data.revertStyle();
   
    var content = "";

    geom = event.feature.getGeometry()
    content += event.feature.getGeometry().getBounds().lat() + '<br>';

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
        // the block numbers aren't unique
        // TBD click to unselect?
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
     
      var cur_tract = feature.getProperty('TRACTCE10');
      // for each selected block highlight if in same tract as selected
      for (var i = 0; i < selected_tractce.length; i++) {
        if (cur_tract == selected_tractce[i]) {
          map.data.overrideStyle(feature, 
          {
            zIndex: 6,
            strokeOpacity: 0.4, 
            strokeWeight: zoom_level/10.0 + 1, 
            strokeColor: 'red'
            } );
        }
      }  
      
      var cur_block = feature.getProperty('BLOCKCE');
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
              fillColor: 'black',
              fillOpacity: 0.3,
              strokeOpacity: 0.54, 
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

  if (square_select_one) {
    sq_latlng1 = event.latLng;
    square_select_one = false;
    square_select_two = true;
  } else if (square_select_two) {
    sq_latlng2 = event.latLng;
    square_select_two = false;
    // TBD keep selecting?
    // square_select_one = true;

    // TBD add all blocks that intersect the bounds to be added to the 
    // selected_blocks
    // use LatLngBounds.intersects( )
  }
  
  if ((sq_latlng1 != null) && (sq_latlng2 != null)) {
    content += "draw square";

    rect_options = {
      strokeColor: "hsl(50%, 80%, 10%)",
      srokeOpacity: 0.9,
      strokeWeight: 2,
      fillColor: "hsl(55%, 80%, 30%)",
      fillOpacity: 0.2,
      zIndex: 4,
      map: map,
      bounds: new google.maps.LatLngBounds(
        sq_latlng1,
        sq_latlng2
      // new google.maps.LatLng(47.6043, -122.342),
      // new google.maps.LatLng(47.6243, -122.322)
      )
    };
    selected_rect.setOptions(rect_options);
  }
  if (sq_latlng1 != null) {
    content += 'first corner ' + sq_latlng1.lat().toFixed(4) + ', ' + 
        sq_latlng1.lng().toFixed(4) + '<br>';
  }
  if (sq_latlng2 != null) {
    content += 'second corner ' + sq_latlng2.lat().toFixed(4) + ', ' + 
        sq_latlng2.lng().toFixed(4) + '<br>';
  }
    //console.log(content);
    info.innerHTML = content; 

    map.data.overrideStyle(event.feature, 
      {
        zIndex: 7,
        fillColor: 'black',
        fillOpacity: 0.5,
        strokeOpacity: 0.9, 
        strokeWeight: 4, 
        strokeColor: 'black'
        } );
  }); // click for info window
 
}

google.maps.event.addDomListener(window, 'load', initialize);


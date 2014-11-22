var map;
var info;
var square_select_one = false;
var square_select_two = false;
var sq_latlng1 = null;
var sq_latlng2 = null;
var selected_rect = null;
var selected_square_bounds = null;

var selected_tractce = [];
var selected_blocks = [];
var zoom_level = 14;

var multiple_selection = false;
var subtract_from_selection = false;

function enableAddToSelection() {
  console.log("enabling adding to selection");
  multiple_selection = true;
  subtract_from_selection = false;
  makeButtons();
}

function enableSubtractFromSelection() {
  console.log("now subtracting from selection");
  subtract_from_selection = true;
}

function switchToSingleSelection() {
  multiple_selection = false; 
  makeButtons();
}

function highlightSelectedFeatures() {
    map.data.revertStyle();
    map.data.forEach(function(feature) {
      var cur_tract = feature.getProperty('TRACTCE10');
      var cur_block = feature.getProperty('BLOCKCE');
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
      
      // aggregate stats over whole selection of blocks
      for (var i = 0; i < selected_blocks.length; i++) {
        // the block numbers aren't unique
        if ((cur_block == selected_blocks[i].block) && 
            (cur_tract == selected_blocks[i].tract)) {
          //console.log(selected_blocks[i]);
          total_area += feature.getProperty('area');
          total_population += feature.getProperty('POP10');
          color = 'black';
          map.data.overrideStyle(feature, 
            {
              zIndex: 7,
              fillColor: color,
              fillOpacity: 0.3,
              strokeOpacity: 0.54, 
              strokeWeight: 3, 
              strokeColor: 'black'
            } );
        }
      } // for each selected block highlight 
    
    });  // for each feature
}

function clearSelection() {
  selected_blocks = [];
  square_select_one = false;
  square_select_two = false;
  sq_latlng1 = null;
  sq_latlng2 = null;

  // TBD put in selected square
  selected_square_bounds = new google.maps.LatLngBounds()
  selected_square_bounds.extend( new google.maps.LatLng(0,0) );
  selected_square_bounds.extend( new google.maps.LatLng(0,0) );

  highlightSelectedFeatures();
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
    buttons.innerHTML += '<button onclick="enableAddToSelection()">Add to selection</button>';
  } else {
    //console.log("starting new selection");
    buttons.innerHTML += '<button onclick="switchToSingleSelection()">Switch To Single Selection</button>';
  }
  buttons.innerHTML += '<button onclick="enableSubtractFromSelection()">Subtract from selection</button>';
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

function addSelectedBlock(new_block) {

  // only add if not in list already TBD indexOf like this doesn't work
  var not_a_dupe = true;

  for (var i = 0; i < selected_blocks.length; i++) {
    // the block numbers aren't unique
    // TBD click to unselect?
    if ((new_block.block == selected_blocks[i].block) && 
        (new_block.tract == selected_blocks[i].tract)) {
      not_a_dupe = false;
      //console.log("is a dupe", new_block.block, new_block.tractce);
      break;
    }
  }

  if (not_a_dupe) {
    selected_blocks[selected_blocks.length] = new_block;
  }
}

function subtractSelectedBlock(new_block) {
  
  var index = -1;
  for (var i = 0; i < selected_blocks.length; i++) {
    // the block numbers aren't unique
    if ((new_block.block == selected_blocks[i].block) && 
        (new_block.tract == selected_blocks[i].tract)) {
            
       index = i;
       break;
    }
  }

  if (index >= 0) {
     // remove index at 
     selected_blocks.splice(index, 1);
  }
}

/////////////////////////
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

  // TBD these were likely generated in a lucasw/gis project, but which one?
  map.data.loadGeoJson("data/seattle_census_tracts.json");
  //map.data.loadGeoJson("data/seattle_census_tracts_district_7.json"); 

  // http://stackoverflow.com/questions/24401240/how-to-get-latlngbounds-of-feature-polygon-geometry-in-google-maps-v3
  // loadGeoJson runs asnchronously, listen to the addfeature-event
  google.maps.event.addListener(map.data, 'addfeature', function(e) {

    // check for a polygon
    if (e.feature.getGeometry().getType() === 'Polygon') {

      // initialize the bounds
      var bounds = new google.maps.LatLngBounds();

      // iterate over the paths
      e.feature.getGeometry().getArray().forEach(function(path) {
        // iterate over the points in the path
        path.getArray().forEach(function(latLng) {
          // extend the bounds
          bounds.extend(latLng);
        });
      });

      // now use the bounds
      //console.log(bounds.getNorthEast());
      e.feature.setProperty('bounds', bounds);
    }
  });

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

  selected_square_bounds = new google.maps.LatLngBounds()
  selected_square_bounds.extend( new google.maps.LatLng(0,0) );
  selected_square_bounds.extend( new google.maps.LatLng(0,0) );

  selected_rect = new google.maps.Rectangle({
    strokeColor: "hsl(50%, 80%, 30%)",
    srokeOpacity: 0.9,
    strokeWeight: 2,
    fillColor: "hsl(55%, 80%, 30%)",
    fillOpacity: 0.5,
    zIndex: 4,
    map: map,
    bounds: selected_square_bounds
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
  
    var add_selected_square = false;
    
    if (square_select_one) {
      sq_latlng1 = event.latLng;
      square_select_one = false;
      square_select_two = true;
    } else if (square_select_two) {
      sq_latlng2 = event.latLng;
      selected_square_bounds = new google.maps.LatLngBounds();
      selected_square_bounds.extend(sq_latlng1);
      selected_square_bounds.extend(sq_latlng2);
      
      square_select_two = false;
      // TBD keep selecting?
      // square_select_one = true;

      // TBD add all blocks that intersect the bounds to be added to the 
      // selected_blocks
      add_selected_square = true;
    }

    geom = event.feature.getGeometry()
    //content += event.feature.getGeometry().getBounds().lat() + '<br>';

    var tractce = event.feature.getProperty('TRACTCE10');
    selected_tractce = [tractce];
    var block = event.feature.getProperty('BLOCKCE');
   
    var new_block = {
        'tract':tractce,
        'block':block
    };
                                    
    if (multiple_selection) {
        content += "Multiple selection mode<br>";
      if (!subtract_from_selection) {
        content += "Subtraction mode<br>";
        addSelectedBlock(new_block);
      } else {
        subtractSelectedBlock(new_block);
      }
    } else {
      selected_blocks = [new_block];
    }
    content += "<br>";
 
    ////////////////////////////////////////////////////////
    // loop through all features to determine if they are in new
    // selections
    if (add_selected_square) {  
      map.data.forEach(function(feature) {
        var cur_tract = feature.getProperty('TRACTCE10');
        var cur_block = feature.getProperty('BLOCKCE');
      
        // see if current block is in the selected square, then add it to 
        // selected blocks
        var cur_bounds = feature.getProperty('bounds');
        if (cur_bounds !== null) {
          var does_intersect = cur_bounds.intersects(selected_square_bounds);
          //var does_intersect = selected_square_bounds.contains(cur_bounds.getNorthEast());
          //console.log(does_intersect); // + " " + cur_bounds.getNorthEast());
          //console.log(does_intersect + " " +
          //    selected_square_bounds.getSouthWest() + " " +
          //    selected_square_bounds.getNorthEast());
          if (does_intersect) {
            var cur_block = {
                'tract':cur_tract,
                'block':cur_block
            };

            addSelectedBlock(cur_block);
          }
        }
      });
    } // add square selection

    //console.log("cur tract " + selected_tractce[0]);

    total_population = 0;
    total_area = 0;

    // this also updates the total population and area
    highlightSelectedFeatures();

    //content += '<br>';
    content += 'total population :' + total_population.toFixed(2) + '<br>';
    content += 'total area :' + total_area.toFixed(2) + '<br>';
    content += 'total density :' + (total_population/total_area).toFixed(2) + '<br>';
    content += '<br>'

    // list selected blocks
    content += "Selected blocks<br>";
    for (var i = 0; i < selected_blocks.length; i++) {
      // the block numbers aren't unique
      content += selected_blocks[i].tract + ", " + 
          selected_blocks[i].block + '<br>';
    }
    content += '<br>'

    // show all properties of selected block
    event.feature.forEachProperty(function(value, property) {
      if (property == 'BLOCKID10') {
        return;
      }
          
      if (property == 'density') value = value.toFixed(2) + ' persons/acre';
      if (property == 'area') value = value.toFixed(2) + ' acres';
      content +=  property + ' : ' + value + '<br>';
    });

    content += '<br><br>'; 
  
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
      bounds: selected_square_bounds
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

    // highlight the current selection
    color = 'black';
    if (subtract_from_selection) {
      color = 'blue';
    }
    map.data.overrideStyle(event.feature, 
      {
        zIndex: 7,
        fillColor: color,
        fillOpacity: 0.5,
        strokeOpacity: 0.9, 
        strokeWeight: 4, 
        strokeColor: color
        } );

  }); // click for info window
 
}

google.maps.event.addDomListener(window, 'load', initialize);


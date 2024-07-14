var map, geojson;
var selected, features, layer_name, layerControl;
var content;
var L;
var popup = L.popup();

//map extent

map = L.map('map', {
    center: [23.00, 82.00],
    zoom: 5,
    zoomControl: false
   
});


// Define basemaps

var OpenTopoMap = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
	maxZoom: 17,
	attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
});

var osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
}).addTo(map);

var Stadia_AlidadeSmooth = L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.{ext}', {
	minZoom: 0,
	maxZoom: 20,
	attribution: '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
	ext: 'png'
});

var Esri_WorldImagery = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
	attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
});

// Create layer groups

var overlays = L.layerGroup();
var base = L.layerGroup();

base.addLayer(Stadia_AlidadeSmooth, 'b_w');
base.addLayer(OpenTopoMap, 'TOPO');
base.addLayer(osm, 'OpenStreetMap');
base.addLayer(Esri_WorldImagery,'world_Imagery')

// Create a layer control

var layerControl = L.control.layers().addTo(map);

// Add basemaps to the layer control

layerControl.addBaseLayer(Stadia_AlidadeSmooth, 'b_w');
layerControl.addBaseLayer(OpenTopoMap, 'TOPO');
layerControl.addBaseLayer(osm, 'OpenStreetMap');
layerControl.addBaseLayer(Esri_WorldImagery,'world_Imagery')

// Zoom bar

var zoom_bar = new L.Control.ZoomBar({
    position: 'topleft'
}).addTo(map);

// map.addControl(new L.Control.Zoomslider());

//scale

L.control.scale({
    position: 'bottomleft'
}).addTo(map);

//geocoder

L.Control.geocoder({
    position: 'topright'
}).addTo(map);

//area measure

var measureControl = new L.Control.Measure({
    position: 'topleft',
    primaryLengthUnit: 'meters', 
    secondaryLengthUnit: 'kilometers' ,
    primaryAreaUnit: 'acres', 
    secondaryAreaUnit: 'sqmeters',
    activeColor: '#131c31',
    completedColor: '#f4141c',
	
});
measureControl.addTo(map);

//search

var geoserverLayer = L.tileLayer.wms('http://localhost:8082/geoserver/ne/wms', {
    layers: 'ne:Block-05-A1-Plot',
    format: 'image/png',
    transparent: true
  }).addTo(map);

// Add an empty layer group for search results

var searchLayer = L.layerGroup().addTo(map);


// Initialize Leaflet Search control and specify the GeoServer layer to search

var searchControl = new L.Control.Search({
    layer: searchLayer,
    propertyName: 'UID', // Replace 'UID' with the property in your GeoServer layer that holds the search value
    marker: false, // Set to true if your layer consists of markers
    moveToLocation: function(latlng, title, map) {
      // Function to zoom and pan to the found feature's location
      var zoomLevel = 14; // Adjust the zoom level as needed
      map.setView(latlng, zoomLevel);
    }
  });

  searchControl.addTo(map);

  function goToShortPage() {
    window.location.href = "/short";  // Redirect to the short page route
}


  function legend() {
    $('#legend').empty();
    
    var head = document.createElement("h8");
    var txt = document.createTextNode("Legend");
    head.appendChild(txt);
    
    var element = document.getElementById("legend");
    element.appendChild(head);

    overlays.eachLayer(function (layer) {
        var legendItem = document.createElement("div");
        legendItem.className = "legend-item";

        var layerName = document.createElement("p");
        var layerNameText = document.createTextNode(layer.options.layers);
        layerName.appendChild(layerNameText);
        legendItem.appendChild(layerName);

        var legendImg = new Image();
        legendImg.src = "http://localhost:8082/geoserver/wms?REQUEST=GetLegendGraphic&VERSION=1.0.0&FORMAT=image/png&WIDTH=20&HEIGHT=20&LAYER=" + layer.options.layers;
        legendItem.appendChild(legendImg);

        element.appendChild(legendItem);
    });
}

legend();



//legend

// function legend() {

//     $('#legend').empty();
//     var layers = overlays.getLayers();
//     // console.log(no_layers[0].options.layers);
//     // console.log(no_layers);
//     // var no_layers = overlays.getLayers().get('length');

//     var head = document.createElement("h8");

//     var txt = document.createTextNode("Legend");

//     head.appendChild(txt);
//     var element = document.getElementById("legend");
//     element.appendChild(head);
// 	overlays.eachLayer(function (layer) {
	
// 	var head = document.createElement("p");

//         var txt = document.createTextNode(layer.options.layers);
//         //alert(txt[i]);
//         head.appendChild(txt);
//         var element = document.getElementById("legend");
//         element.appendChild(head);
// 	 var img = new Image();
// 	  img.src = "http://localhost:8082/geoserver/wms?REQUEST=GetLegendGraphic&VERSION=1.0.0&FORMAT=image/png&WIDTH=20&HEIGHT=20&LAYER=" +layer.options.layers;
// 	  var src = document.getElementById("legend");
//         src.appendChild(img);
    
// });
	
   
// }

// legend();

//latitude and longitude

map.on('mousemove', function (e) {
    var roundedLat = e.latlng.lat.toFixed(2);
    var roundedLng = e.latlng.lng.toFixed(2);
    $('.coordinate').html(`Latitude : ${roundedLat} Longitude : ${roundedLng}`);
});



// layer dropdown query

$(document).ready(function() {
    $.ajax({
        type: "GET",
        url: "http://localhost:8082/geoserver/wfs?request=getCapabilities",
        dataType: "xml",
        success: function(xml) {
            var select = $('#layer');
            $(xml).find('FeatureType').each(function() {
                //var title = $(this).find('ows:Operation').attr('name');
                //alert(title);
                var name = $(this).find('Name').text();
                //select.append("<option/><option class='ddheader' value='"+ name +"'>"+title+"</option>");
                $(this).find('Name').each(function() {
                    var value = $(this).text();
                    select.append("<option class='ddindent' value='" + value + "'>" + value + "</option>");
                });
            });
            //select.children(":first").text("please make a selection").attr("selected",true);
        }
    });
});


// attribute dropdown

$(function() {
    $("#layer").change(function() {

        var attributes = document.getElementById("attributes");
        var length = attributes.options.length;
        for (i = length - 1; i >= 0; i--) {
            attributes.options[i] = null;
        }

        var value_layer = $(this).val();


        attributes.options[0] = new Option('Select attributes', "");
        //  alert(url);

        $(document).ready(function() {
            $.ajax({
                type: "GET",
                url: "http://localhost:8082/geoserver/wfs?service=WFS&request=DescribeFeatureType&version=1.1.0&typeName=" + value_layer,
                dataType: "xml",
                success: function(xml) {

                    var select = $('#attributes');
                    //var title = $(xml).find('xsd\\:complexType').attr('name');
                    //	alert(title);
                    $(xml).find('xsd\\:sequence').each(function() {

                        $(this).find('xsd\\:element').each(function() {
                            var value = $(this).attr('name');
                            //alert(value);
                            var type = $(this).attr('type');
                            //alert(type);
                            if (value != 'geom' && value != 'the_geom') {
                                select.append("<option class='ddindent' value='" + type + "'>" + value + "</option>");
                            }
                        });

                    });
                }
            });
        });


    });
});

// operator combo

$(function() {
    $("#attributes").change(function() {

        var operator = document.getElementById("operator");
        var length = operator.options.length;
        for (i = length - 1; i >= 0; i--) {
            operator.options[i] = null;
        }

        var value_type = $(this).val();
        // alert(value_type);
        var value_attribute = $('#attributes option:selected').text();
        operator.options[0] = new Option('Select operator', "");

        if (value_type == 'xsd:short' || value_type == 'xsd:int' || value_type == 'xsd:double' || value_type == 'xsd:long') {
            var operator1 = document.getElementById("operator");
            operator1.options[1] = new Option('Greater than', '>');
            operator1.options[2] = new Option('Less than', '<');
            operator1.options[3] = new Option('Equal to', '=');
			 operator1.options[4] = new Option('Between', 'BETWEEN');
        } else if (value_type == 'xsd:string') {
            var operator1 = document.getElementById("operator");
            operator1.options[1] = new Option('Like', 'ILike');

        }

    });
});


// layer dropdown draw query

$(document).ready(function() {
    $.ajax({
        type: "GET",
        url: "http://localhost:8082/geoserver/wfs?request=getCapabilities",
        dataType: "xml",
        success: function(xml) {
            var select = $('#layer1');
            $(xml).find('FeatureType').each(function() {
                //var title = $(this).find('ows:Operation').attr('name');
                //alert(title);
                var name = $(this).find('Name').text();
                //select.append("<option/><option class='ddheader' value='"+ name +"'>"+title+"</option>");
                $(this).find('Name').each(function() {
                    var value = $(this).text();
                    select.append("<option class='ddindent' value='" + value + "'>" + value + "</option>");
                });
            });
            //select.children(":first").text("please make a selection").attr("selected",true);
        }
    });
});


// function for finding row in the table when feature selected on map

function findRowNumber(cn1, v1) {

    var table = document.querySelector('#table');
    var rows = table.querySelectorAll("tr");
    var msg = "No such row exist"
    for (i = 1; i < rows.length; i++) {
        var tableData = rows[i].querySelectorAll("td");
        if (tableData[cn1 - 1].textContent == v1) {
            msg = i;
            break;
        }
    }
    return msg;
}

// function for loading query

function query() {

    $('#table').empty();
    if (geojson) {
        map.removeLayer(geojson);

    }


    //alert('jsbchdb');	
    var layer = document.getElementById("layer");
    var value_layer = layer.options[layer.selectedIndex].value;
    //alert(value_layer);

    var attribute = document.getElementById("attributes");
    var value_attribute = attribute.options[attribute.selectedIndex].text;
    //alert(value_attribute);

    var operator = document.getElementById("operator");
    var value_operator = operator.options[operator.selectedIndex].value;
    //alert(value_operator);

    var txt = document.getElementById("value");
    var value_txt = txt.value;

    if (value_operator == 'ILike') {
        value_txt = "'" + value_txt + "%25'";
        //alert(value_txt);
        //value_attribute = 'strToLowerCase('+value_attribute+')';
    } else {
        value_txt = value_txt;
        //value_attribute = value_attribute;
    }
    //alert(value_txt);




    var url = "http://localhost:8082/geoserver/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=" + value_layer + "&CQL_FILTER=" + value_attribute + "%20" + value_operator + "%20" + value_txt + "&outputFormat=application/json"
    //console.log(url);
    $.getJSON(url, function(data) {

        geojson = L.geoJson(data, {
            onEachFeature: onEachFeature
        });
        geojson.addTo(map);
        map.fitBounds(geojson.getBounds());

        var col = [];
        col.push('id');
        for (var i = 0; i < data.features.length; i++) {

            for (var key in data.features[i].properties) {

                if (col.indexOf(key) === -1) {
                    col.push(key);
                }
            }
        }



        var table = document.createElement("table");


        //table.setAttribute("class", "table table-bordered");
        table.setAttribute("class", "table table-hover table-striped");
        table.setAttribute("id", "table");
		
		var caption = document.createElement("caption");
        caption.setAttribute("id", "caption");
caption.style.captionSide = 'top';
caption.innerHTML = value_layer+" (Number of Features : "+data.features.length+" )";
table.appendChild(caption);
        // CREATE HTML TABLE HEADER ROW USING THE EXTRACTED HEADERS ABOVE.

        var tr = table.insertRow(-1); // TABLE ROW.

        for (var i = 0; i < col.length; i++) {
            var th = document.createElement("th"); // TABLE HEADER.
            th.innerHTML = col[i];
            tr.appendChild(th);
        }

        // ADD JSON DATA TO THE TABLE AS ROWS.
        for (var i = 0; i < data.features.length; i++) {

            tr = table.insertRow(-1);

            for (var j = 0; j < col.length; j++) {
                var tabCell = tr.insertCell(-1);
                if (j == 0) {
                    tabCell.innerHTML = data.features[i]['id'];
                } else {
                    //alert(data.features[i]['id']);
                    tabCell.innerHTML = data.features[i].properties[col[j]];
                    //alert(tabCell.innerHTML);
                }
            }
        }



        // FINALLY ADD THE NEWLY CREATED TABLE WITH JSON DATA TO A CONTAINER.
        var divContainer = document.getElementById("table_data");
        divContainer.innerHTML = "";
        divContainer.appendChild(table);

        addRowHandlers();

        document.getElementById('map').style.height = '71%';
        document.getElementById('table_data').style.height = '29%';
        map.invalidateSize();




    });


}

// highlight the feature on map and table on map click
function onEachFeature(feature, layer) {

    layer.on('click', function(e) {
        // e = event

        // Reset selected to default style
        if (selected) {
            // Reset selected to default style
            geojson.resetStyle(selected);
        }

        selected = e.target;

        selected.setStyle({
            'color': 'red'
        });

        if (feature) {

            console.log(feature);
            $(function() {
                $("#table td").each(function() {
                    $(this).parent("tr").css("background-color", "white");
                });
            });


        }

        var table = document.getElementById('table');
        var cells = table.getElementsByTagName('td');
        var rows = document.getElementById("table").rows;
        var heads = table.getElementsByTagName('th');
        var col_no;
        for (var i = 0; i < heads.length; i++) {
            // Take each cell
            var head = heads[i];
            //alert(head.innerHTML);
            if (head.innerHTML == 'id') {
                col_no = i + 1;
                //alert(col_no);
            }

        }
        var row_no = findRowNumber(col_no, feature.id);
        //alert(row_no);

        var rows = document.querySelectorAll('#table tr');

        rows[row_no].scrollIntoView({
            behavior: 'smooth',
            block: 'center'
        });

        $(document).ready(function() {
            $("#table td:nth-child(" + col_no + ")").each(function() {

                if ($(this).text() == feature.id) {
                    $(this).parent("tr").css("background-color", "grey");

                }
            });
        });
    });




};

// highlight the feature on map and table on row select in table
function addRowHandlers() {
    var rows = document.getElementById("table").rows;
    var heads = table.getElementsByTagName('th');
    var col_no;
    for (var i = 0; i < heads.length; i++) {
        // Take each cell
        var head = heads[i];
        //alert(head.innerHTML);
        if (head.innerHTML == 'id') {
            col_no = i + 1;
            //alert(col_no);
        }

    }
    for (i = 0; i < rows.length; i++) {



        rows[i].onclick = function() {
            return function() {
                featureOverlay.getSource().clear();
                if (geojson) {
                    geojson.resetStyle();
                }
                $(function() {
                    $("#table td").each(function() {
                        $(this).parent("tr").css("background-color", "white");
                    });
                });
                var cell = this.cells[col_no - 1];
                var id = cell.innerHTML;


                $(document).ready(function() {
                    $("#table td:nth-child(" + col_no + ")").each(function() {
                        if ($(this).text() == id) {
                            $(this).parent("tr").css("background-color", "grey");
                        }
                    });
                });

                features = geojson.getLayers();

                for (i = 0; i < features.length; i++) {



                    if (features[i].feature.id == id) {
                        //alert(features[i].feature.id);
                        //featureOverlay.getSource().addFeature(features[i]);
                        selected = features[i];
                        selected.setStyle({
                            'color': 'red'
                        });
                        map.fitBounds(selected.getBounds());
                        console.log(selected.getBounds());
                    }
                }

                //alert("id:" + id);
            };
        }(rows[i]);
    }
}
// Add event listener to the export button
document.getElementById("exportButton").addEventListener("click", function() {
    // Convert table to Excel worksheet
    var sheet = XLSX.utils.table_to_sheet(table);
  
    // Create workbook and add the worksheet
    var wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, sheet, "Sheet 1");
  
    // Convert workbook to Excel binary format
    var wbout = XLSX.write(wb, { bookType: "xlsx", type: "binary" });
  
    // Save the workbook as a file
    saveAs(new Blob([s2ab(wbout)], { type: "application/octet-stream" }), "data.xlsx");
  });
  
  // Function to convert string to ArrayBuffer
  function s2ab(s) {
    var buf = new ArrayBuffer(s.length);
    var view = new Uint8Array(buf);
    for (var i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xff;
    return buf;
  }

//list of wms_layers_ in window on click of button

function wms_layers() {

   
     
  $("#wms_layers_window").modal({backdrop: false});
  //$("#wms_layers_window").draggable();
  $("#wms_layers_window").modal('show');
 
    

    $(document).ready(function() {
        $.ajax({
            type: "GET",
            url: "http://localhost:8082/geoserver/wms?request=getCapabilities",
            dataType: "xml",
            success: function(xml) {
                $('#table_wms_layers').empty();
                // console.log("here");
                $('<tr></tr>').html('<th>Name</th><th>Title</th><th>Abstract</th>').appendTo('#table_wms_layers');
                $(xml).find('Layer').find('Layer').each(function() {
                    var name = $(this).children('Name').text();
                    // alert(name);
                    //var name1 = name.find('Name').text();
                    //alert(name);
                    var title = $(this).children('Title').text();

                    var abst = $(this).children('Abstract').text();
                    //   alert(abst);


                    //   alert('test');
                    $('<tr></tr>').html('<td>' + name + '</td><td>' + title + '</td><td>' + abst + '</td>').appendTo('#table_wms_layers');
                    //document.getElementById("table_wms_layers").setAttribute("class", "table-success");

                });
                addRowHandlers1();
            }
        });
    });




    function addRowHandlers1() {
        //alert('knd');
        var rows = document.getElementById("table_wms_layers").rows;
        var table = document.getElementById('table_wms_layers');
        var heads = table.getElementsByTagName('th');
        var col_no;
        for (var i = 0; i < heads.length; i++) {
            // Take each cell
            var head = heads[i];
            //alert(head.innerHTML);
            if (head.innerHTML == 'Name') {
                col_no = i + 1;
                //alert(col_no);
            }

        }
        for (i = 0; i < rows.length; i++) {

            rows[i].onclick = function() {
                return function() {

                    $(function() {
                        $("#table_wms_layers td").each(function() {
                            $(this).parent("tr").css("background-color", "white");
                        });
                    });
                    var cell = this.cells[col_no - 1];
                    layer_name = cell.innerHTML;
                    // alert(layer_name);

                    $(document).ready(function() {
                        $("#table_wms_layers td:nth-child(" + col_no + ")").each(function() {
                            if ($(this).text() == layer_name) {
                                $(this).parent("tr").css("background-color", "grey");



                            }
                        });
                    });

                    //alert("id:" + id);
                };
            }(rows[i]);
        }

    }

}
// add wms layer to map on click of button


function add_layer() {


    var name = layer_name.split(":");
    //alert(layer_name);
    var layer_wms = L.tileLayer.wms('http://localhost:8082/geoserver/wms?', {
        layers: layer_name,
        transparent: 'true',
        format: 'image/png'
		
    }).addTo(map);

    layerControl.addOverlay(layer_wms, layer_name);
    overlays.addLayer(layer_wms, layer_name);


    $(document).ready(function() {
        $.ajax({
            type: "GET",
            url: "http://localhost:8082/geoserver/wms?request=getCapabilities",
            dataType: "xml",
            success: function(xml) {


                $(xml).find('Layer').find('Layer').each(function() {
                    var name = $(this).children('Name').text();
                    // alert(name);
                    if (name == layer_name) {
                        // use this for getting the lat long of the extent
                        var bbox1 = $(this).children('EX_GeographicBoundingBox').children('southBoundLatitude').text();
                        var bbox2 = $(this).children('EX_GeographicBoundingBox').children('westBoundLongitude').text();
                        var bbox3 = $(this).children('EX_GeographicBoundingBox').children('northBoundLatitude').text();
                        var bbox4 = $(this).children('EX_GeographicBoundingBox').children('eastBoundLongitude').text();
                        var southWest = L.latLng(bbox1, bbox2);
                        var northEast = L.latLng(bbox3, bbox4);
                        var bounds = L.latLngBounds(southWest, northEast);
                        map.fitBounds(bounds);
                      if (bounds != undefined){alert(layer_name+" added to the map");}
                    }



                });

            }
        });
    });


    legend();

}

function close_wms_window(){
layer_name = undefined;
}

// function on click of getinfo
function info() {
    if (document.getElementById("info_btn").innerHTML == "☰ Activate GetInfo") {

        document.getElementById("info_btn").innerHTML = "☰ De-Activate GetInfo";
        document.getElementById("info_btn").setAttribute("class", "btn btn-danger btn-sm");
        map.on('click', getinfo);
    } else {

        map.off('click', getinfo);
        document.getElementById("info_btn").innerHTML = "☰ Activate GetInfo";
        document.getElementById("info_btn").setAttribute("class", "btn btn-success btn-sm");

    }
}

// getinfo function
function getinfo(e) {

    var point = map.latLngToContainerPoint(e.latlng, map.getZoom());
    
    var bbox = map.getBounds().toBBoxString();
    var size = map.getSize();
    var height = size.y;
    var width = size.x;
    var x = point.x;
    var y = point.y;
    

   
   
    if (content) {
        content = '';
    }
	
	overlays.eachLayer(function (layer) {
	   var url = 'http://localhost:8082/geoserver/wms?SERVICE=WMS&VERSION=1.1.1&REQUEST=GetFeatureInfo&FORMAT=image%2Fpng&TRANSPARENT=true&QUERY_LAYERS=' + layer.options.layers + '&LAYERS=' + layer.options.layers + '&INFO_FORMAT=text%2Fhtml&X=' + x + '&Y=' + y + '&CRS=EPSG%3A4326&STYLES=&WIDTH=' + width + '&HEIGHT=' + height + '&BBOX=' + bbox;
console.log(url);   
	   $.get(url, function(data) {
            //content.push(data);

            content += data;
            //console.log(content);

            popup.setContent(content);
            popup.setLatLng(e.latlng);
            map.openPopup(popup);


        });
	});
	
    

}


// clear function
function clear_all() {
    document.getElementById('map').style.height = '100%';
    document.getElementById('table_data').style.height = '0%';
    map.invalidateSize();
    $('#table').empty();
	 $('#legend').empty();
    //$('#table1').empty();
    if (geojson) {
        map.removeLayer(geojson);
    }
    map.flyTo([23.00, 82.00], 4);

    document.getElementById("query_panel_btn").innerHTML = "☰ Open Query Panel";
	document.getElementById("query_panel_btn").setAttribute("class", "btn btn-success btn-sm");

    document.getElementById("query_tab").style.width = "0%";
    document.getElementById("map").style.width = "100%";
    document.getElementById("map").style.left = "0%";
    document.getElementById("query_tab").style.visibility = "hidden";
    document.getElementById('table_data').style.left = '0%';

    document.getElementById("legend_btn").innerHTML = "☰ Show Legend";
    document.getElementById("legend").style.width = "0%";
    document.getElementById("legend").style.visibility = "hidden";
    document.getElementById('legend').style.height = '0%';

    map.off('click', getinfo);
    document.getElementById("info_btn").innerHTML = "☰ Activate GetInfo";
    document.getElementById("info_btn").setAttribute("class", "btn btn-success btn-sm");
	
	overlays.eachLayer(function (layer) {
	map.removeLayer(layer);
	layerControl.removeLayer(layer);
	overlays.removeLayer(layer);
	
	});
	overlays.clearLayers();
	
		
    map.invalidateSize();

}

function show_hide_querypanel() {

    if (document.getElementById("query_tab").style.visibility == "hidden") {

	document.getElementById("query_panel_btn").innerHTML = "☰ Hide Query Panel";
        document.getElementById("query_panel_btn").setAttribute("class", "btn btn-danger btn-sm");
		document.getElementById("query_tab").style.visibility = "visible";
        document.getElementById("query_tab").style.width = "20%";
        document.getElementById("map").style.width = "80%";
        document.getElementById("map").style.left = "20%";
        
        document.getElementById('table_data').style.left = '20%';
        map.invalidateSize();
    } else {
        document.getElementById("query_panel_btn").innerHTML = "☰ Open Query Panel";
        document.getElementById("query_panel_btn").setAttribute("class", "btn btn-success btn-sm");
        document.getElementById("query_tab").style.width = "0%";
        document.getElementById("map").style.width = "100%";
        document.getElementById("map").style.left = "0%";
        document.getElementById("query_tab").style.visibility = "hidden";
        document.getElementById('table_data').style.left = '0%';

        map.invalidateSize();
    }
}

function show_hide_legend() {

    if (document.getElementById("legend").style.visibility == "hidden") {

        document.getElementById("legend_btn").innerHTML = "☰ Hide Legend";
		 document.getElementById("legend").style.visibility = "visible";
        document.getElementById("legend").style.width = "15%";
       
        document.getElementById('legend').style.height = '38%';
        map.invalidateSize();
    } else {
        document.getElementById("legend_btn").innerHTML = "☰ Show Legend";
        document.getElementById("legend").style.width = "0%";
        document.getElementById("legend").style.visibility = "hidden";
        document.getElementById('legend').style.height = '0%';

        map.invalidateSize();
    }
}

L.control.browserPrint({position: 'topleft',padding:'2px'}).addTo(map);
L.BrowserPrint.Mode.Landscape();
L.BrowserPrint.Mode.Portrait();
L.BrowserPrint.Mode.Auto();
L.BrowserPrint.Mode.Custom()


    


// leaflet draw
var drawControl = new L.Control.Draw()

//leaflet draw

var drawnFeatures=new L.FeatureGroup();
map.addLayer(drawnFeatures);

function exportDrawnData() {
    var geojson = drawnFeatures.toGeoJSON();
    var data = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(geojson));

    var a = document.createElement('a');
    a.href = data;
    a.download = 'drawn_data.geojson';
    a.click();
}


map.on("draw:created", function(e){
    var type = e.layerType;
    var layer = e.layer;
    drawnFeatures.addLayer(layer)});

//     var drawControl = new L.Control.Draw({
//         position: 'topright',
//         draw: {},
//         edit: {
//           featureGroup: drawnItems,
//           remove: true,
//           buffer: {
//             replacePolylines: true,
//             separateBuffer: true,
//           },
//         },
//       });


var drawControl=new L.Control.Draw({
    position: "topright",
    edit: {
        featureGroup: drawnFeatures,
        remove: true
    },
    draw: {
        polygon: {
         shapeOptions: {
          color: 'red'
         },
         allowIntersection: false,
         drawError: {
          color: 'orange',
          timeout: 1000
         },
        },
        polyline: {
         shapeOptions: {
          color: 'red'
         },
        },
        rect: {
         shapeOptions: {
          color: 'red'
         },
        },
        circle: {
         shapeOptions: {
          color: 'red'
         },
        },
       },
    //    edit: {
    //     featureGroup: drawnItems,
    //     remove: true,
    //     buffer: {
    //       replacePolylines: false,
    //       separateBuffer: false,
    //     },
    //   },
    });



map.addControl(drawControl);


//Full screen map view

var mapId = document.getElementById('map');
function fullScreenView() {
    {position: 'topleft'}
    if (document.fullscreenElement) {
        document.exitFullscreen()
    } else {
        mapId.requestFullscreen();
    }
}



var routingControl;

function openRoutingWindow() {
    document.getElementById('routingWindow').style.display = 'block';
}

function closeRoutingWindow() {
    document.getElementById('routingWindow').style.display = 'none';
}

function initiateRouting() {
    var startLat = parseFloat(document.getElementById('startLat').value);
    var startLng = parseFloat(document.getElementById('startLng').value);
    var destLat = parseFloat(document.getElementById('destLat').value);
    var destLng = parseFloat(document.getElementById('destLng').value);

    // Clear existing routing if any
    if (routingControl) {
        map.removeControl(routingControl);
    }

    routingControl = L.Routing.control({
        waypoints: [
            L.latLng(startLat, startLng),
            L.latLng(destLat, destLng)
        ]
    }).addTo(map);

    // Close the routing window
    document.getElementById('routingWindow').style.display = 'none';
}

function removeRouting() {
    // Clear existing routing if any
    if (routingControl) {
        map.removeControl(routingControl);
    }

    // Close the routing window
    document.getElementById('routingWindow').style.display = 'none';
}

function startDrag(e) {
    // Allow dragging only when not clicking inside an input field
    if (e.target.tagName.toLowerCase() !== 'input') {
        e.preventDefault();
        var offsetX = e.clientX - parseFloat(getComputedStyle(document.getElementById('routingWindow')).left);
        var offsetY = e.clientY - parseFloat(getComputedStyle(document.getElementById('routingWindow')).top);

        function dragMove(e) {
            document.getElementById('routingWindow').style.left = (e.clientX - offsetX) + 'px';
            document.getElementById('routingWindow').style.top = (e.clientY - offsetY) + 'px';
        }

        function dragEnd() {
            document.removeEventListener('mousemove', dragMove);
            document.removeEventListener('mouseup', dragEnd);
        }

        document.addEventListener('mousemove', dragMove);
        document.addEventListener('mouseup', dragEnd);
    }
}



document.addEventListener('DOMContentLoaded', function () {
  
    // Add event listener to the button
    var routeButton = document.getElementById('routeButton');
    if (routeButton) {
        routeButton.addEventListener('click', initiateRouting);
    }
});

function redirectToDestination() {
    // Redirect to the query HTML page
    window.location.href = "/query.html";
}
  

function SwipeFunction() {
    // Redirect to swipe HTML file
    window.location.href = '/swipe.html';
}


var geojsonLayer;

function loadFileOnMap() {
    var fileInput = document.getElementById('fileInput');
    var file = fileInput.files[0];

    if (file) {
        var reader = new FileReader();

        reader.onload = function (e) {
            try {
                var geojsonData = JSON.parse(e.target.result);
                addLayerToMap(geojsonData);
            } catch (error) {
                console.error('Error parsing GeoJSON:', error);
                alert('Error parsing GeoJSON. Please check the file format.');
            }
        };

        reader.readAsText(file);
    }
}

function addLayerToMap(geojson) {
    if (geojsonLayer) {
        map.removeLayer(geojsonLayer);
    }

    geojsonLayer = L.geoJSON(geojson, {
        onEachFeature: function (feature, layer) {
            layer.on('click', function (e) {
                var popupContent = "<pre>" + JSON.stringify(feature.properties, null, 2) + "</pre>";
                layer.bindPopup(popupContent).openPopup();
            });
        }
    }).addTo(map);

    map.fitBounds(geojsonLayer.getBounds());
}

function removeGeoJSON() {
    if (geojsonLayer) {
        map.removeLayer(geojsonLayer);
        geojsonLayer = null;
    }
}

// var appearanceControl = L.control.appearance(  overlays, 
//     {opacity:true,
//     remove:true,
//     color:true,
//     // removeIcon:"./leaflet_app/assets/img/download.png"
// });
// appearanceControl.addTo(map);


// var markers = []; // Array to store markers

// document.getElementById('csvFileInput').addEventListener('change', handleFileSelect);

// function handleFileSelect(event) {
//     var file = event.target.files[0];

//     if (!file) {
//         return;
//     }

//     Papa.parse(file, {
//         header: true,
//         dynamicTyping: true,
//         skipEmptyLines: true,
//         complete: function (result) {
//             clearMarkers(); // Clear existing markers before adding new ones
//             displayDataOnMap(result.data);
//         }
//     });
// }

// function displayDataOnMap(data) {
//     data.forEach(function (row) {
//         var lat = parseFloat(row.latitude);
//         var lon = parseFloat(row.longitude);

//         if (!isNaN(lat) && !isNaN(lon)) {
//             var marker = L.marker([lat, lon]).addTo(map);
//             markers.push(marker); // Store the marker in the array
//         }
//     });
//     fitMapToMarkers(); 
// }

// function removeData() {
//     clearMarkers();
// }

// function clearMarkers() {
//     markers.forEach(function (marker) {
//         map.removeLayer(marker);
//     });
//     markers = [];
//     fitMapToMarkers(); // Clear the array
// }

// function fitMapToMarkers() {
//     if (markers.length > 0) {
//         var group = new L.featureGroup(markers);
//         map.fitBounds(group.getBounds());
//     }
// }




// var markers = []; // Array to store markers

// document.getElementById('csvFileInput').addEventListener('change', handleFileSelect);

// function handleFileSelect(event) {
//     var file = event.target.files[0];

//     if (!file) {
//         return;
//     }

//     Papa.parse(file, {
//         header: true,
//         dynamicTyping: true,
//         skipEmptyLines: true,
//         complete: function (result) {
//             clearMarkers(); // Clear existing markers before adding new ones
//             displayDataOnMap(result.data);
//         }
//     });
// }

// function displayDataOnMap(data) {
//     data.forEach(function (row) {
//         var lat = parseFloat(row.latitude);
//         var lon = parseFloat(row.longitude);

//         if (!isNaN(lat) && !isNaN(lon)) {
//             var marker = L.marker([lat, lon]).addTo(map);
//             markers.push(marker); // Store the marker in the array
//         }
//     });
//     fitMapToMarkers(); 
// }

// function removeData() {
//     clearMarkers();
// }

// function clearMarkers() {
//     markers.forEach(function (marker) {
//         map.removeLayer(marker);
//     });
//     markers = [];
//     fitMapToMarkers(); // Clear the array
// }

// function fitMapToMarkers() {
//     if (markers.length > 0) {
//         var group = new L.featureGroup(markers);
//         map.fitBounds(group.getBounds());
//     }
// }


// var map = L.map('map').setView([51.505, -0.09], 13);
//         L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
//             attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
//         }).addTo(map);

        var markers = []; // Array to store markers

        document.getElementById('loadDataButton').addEventListener('click', function() {
            loadDataOnMap();
        });

        function loadDataOnMap() {
            var fileInput = document.getElementById('csvFileInput');
            var file = fileInput.files[0];

            if (!file) {
                alert("Please select a file.");
                return;
            }

            Papa.parse(file, {
                header: true,
                dynamicTyping: true,
                skipEmptyLines: true,
                complete: function (result) {
                    clearMarkers(); // Clear existing markers before adding new ones
                    displayDataOnMap(result.data);
                },
                error: function(error, file) {
                    console.error("Error occurred while parsing CSV:", error, file);
                    alert("Error occurred while parsing CSV. Please check the file format.");
                }
            });
        }

        function displayDataOnMap(data) {
            data.forEach(function (row) {
                var lat = parseFloat(row.Lat_DD);
                var lon = parseFloat(row.Long_DD);

                if (!isNaN(lat) && !isNaN(lon)) {
                    var marker = L.marker([lat, lon]).addTo(map);
                    markers.push(marker); // Store the marker in the array
                }
            });
            fitMapToMarkers(); 
        }

        function removeData() {
            clearMarkers();
        }

        function clearMarkers() {
            markers.forEach(function (marker) {
                map.removeLayer(marker);
            });
            markers = [];
        }

        function fitMapToMarkers() {
            if (markers.length > 0) {
                var group = new L.featureGroup(markers);
                map.fitBounds(group.getBounds());
            }
        }

// var markers = []; // Array to store markers

//         function loadDataOnMap() {
//             var fileInput = document.getElementById('csvFileInput');
//             var file = fileInput.files[0];

//             if (!file) {
//                 return;
//             }

//             Papa.parse(file, {
//                 header: true,
//                 dynamicTyping: true,
//                 skipEmptyLines: true,
//                 complete: function (result) {
//                     clearMarkers(); // Clear existing markers before adding new ones
//                     displayDataOnMap(result.data);
//                 }
//             });
//         }

//         function displayDataOnMap(data) {
//             data.forEach(function (row) {
//                 var lat = parseFloat(row.latitude);
//                 var lon = parseFloat(row.longitude);

//                 if (!isNaN(lat) && !isNaN(lon)) {
//                     var marker = L.marker([lat, lon]).addTo(map);
//                     markers.push(marker); // Store the marker in the array
//                 }
//             });
//             fitMapToMarkers(); 
//         }

//         function removeData() {
//             clearMarkers();
//         }

//         function clearMarkers() {
//             markers.forEach(function (marker) {
//                 map.removeLayer(marker);
//             });
//             markers = [];
//             fitMapToMarkers(); // Clear the array
//         }

//         function fitMapToMarkers() {
//             if (markers.length > 0) {
//                 var group = new L.featureGroup(markers);
//                 map.fitBounds(group.getBounds());
//             }
//         }


function redirectToDashboard() {
    // Replace 'dashboard.html' with the actual file name or URL of your dashboard interface
    window.location.href = '/dashboard.html';
}

// function redirectTobuffer(){

//     window.location.href = 'templates/buffer.html';

// }

// $(document).ready(function() {
//     $("#bufferQueryButton").click(function() {
//         $.ajax({
//             url: "buffer.html",
//             cache: false,
//             success: function(html){
//                 $("#bufferContent").html(html);
//             }
//         });
//     });
// });

// function executeScript() {
//     $.ajax({
//         type: 'POST',
//         url: '/execute',
//         success: function(response) {
//             alert(response);
//         }
//     });
// }

$(document).ready(function() {
    // Function to handle buffer query button click
    $("#bufferQueryButton").click(function() {
        // Execute container element
        $('#draggableContainer').css('display', 'block');

        // Execute buffer.py
        $.ajax({
            type: "GET",
            url: "/run_buffer_py",
            success: function(response) {
                alert(response);
            },
            error: function(xhr, status, error) {
                console.error(xhr.responseText);
            }
        });
    });
});

// Assuming your map instance is in a variable called map
var hash = new L.Hash(map);
      // click event to add marker in map
      map.on("click", function (e) {
        var coord = e.latlng;
        var lat = coord.lat;
        var lng = coord.lng;

        // zoom map to new location
        map.flyTo(new L.LatLng(lat, lng));

        L.marker([lat, lng])
          .addTo(map)
          .bindPopup(
            "<h3> Your Location </h3>" +
              "Latitude: " +
              lat +
              "<br> Longitude:  " +
              lng +
              '<br><a href="https://www.google.com/maps/search/?api=1&query=' +
              lat +
              "," +
              lng +
              '" target="_blank">Open in Google Maps</a>'
          )
          .openPopup();
      });

      L.control.locate().addTo(map);

      // var lc = L.control
//   .locate({
//     position: "topleft",
//     padding:"20px",
//   })
//   .addTo(map);
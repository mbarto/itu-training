var RootServer = ""; // Change this to the actual v-dir (i.e., contoso1), NO FINAL SLASH

function handleOnload(baseWmsUrl) {
    var map = idwm_map('map', RootServer + '/content/data/idwm_precision2.json', baseWmsUrl);
	addHighlightStyle(map);
    map.updateSize();
    return map;
}

/*
	target: The element in the html document which will contain the displayed map
	idwm_url: The url to the file idwm.json
 */
function idwm_map(target, idwm_url, baseWmsUrl) {
	
	var mousePositionControl = new ol.control.MousePosition({
		coordinateFormat: ol.coordinate.createStringXY(4),
		projection: 'EPSG:4326',
		// comment the following two lines to have the mouse position
		// be placed within the map.
		//className: 'custom-mouse-position',
		//target: document.getElementById('mouse-position'),
		undefinedHTML: '&nbsp;'
	});
	
	// Create IDWM layer
	// *****************
	var idwm = new ol.layer.Vector({
		name: 'idwm',
		source: new ol.source.Vector({
			url: idwm_url,
			format: new ol.format.GeoJSON({
				defaultDataProjection: 'EPSG:4326',
				projection: 'EPSG:3857'
			})
		}),
		style: function (feature, resolution) {
		    var zoom = map.getView().getZoom();
		    return new ol.style.Style({
		        stroke: new ol.style.Stroke({
		            color: 'black' // Countries border color
		        }),
		        fill: new ol.style.Fill({
		            color: 'rgb(255,255,200,' + (zoom < 5 ? 0.5 : 0.0) + ')' // Countries brush color
		        })
		    })
		}
	});
	
	var target_elem = document.getElementById(target);
	target_elem.style.backgroundColor = '#bcc8ff';
	target_elem.style.borderWidth = '1px';
	target_elem.style.borderColor = 'olive';
	
	var wms = new ol.layer.Tile({
	    source: new ol.source.TileWMS({
	        url: baseWmsUrl,
	        params: { 'LAYERS': 'osm:osm', 'TILED': true },
	        serverType: 'geoserver'
	    })
	});

	// Create the map
	//****************
	var map = new ol.Map({
		target: target,
		layers: [
            wms,
			idwm
			//new ol.layer.Tile({source: new ol.source.OSM() })
		],
		view: new ol.View({
			center: ol.proj.fromLonLat([0, 0]),
			zoom: 3
		}),
		controls: ol.control.defaults({
			attributionOptions: /** @type {olx.control.AttributionOptions} */ ({
				collapsible: false
			})
		}).extend([mousePositionControl]),
	});
	
	return map;
}

function addHighlightStyle(map) {
	
	var my_collection = new ol.Collection();
	var my_highlightStyleCache = {};
	var featureOverlay = new ol.layer.Vector({
		map: map,
		source: new ol.source.Vector({
			features: my_collection,
			useSpatialIndex: false // optional, might improve performance
		}),
		// style: overlayStyle,
		updateWhileAnimating: true, // optional, for instant visual feedback
		updateWhileInteracting: true, // optional, for instant visual feedback
		style: function (feature, resolution) {
			var text = resolution < 5000 ? feature.get('Name') : '';
			if (!my_highlightStyleCache[text]) {
				my_highlightStyleCache[text] = [new ol.style.Style({
						stroke: new ol.style.Stroke({
							color: '#f00',
							width: 1
						}),
						fill: new ol.style.Fill({
							color: 'rgba(255,0,0,0.1)'
						})/*,
						text: new ol.style.Text({
							font: '12px Calibri,sans-serif',
							text: text,
							fill: new ol.style.Fill({
								color: '#000'
							}),
							stroke: new ol.style.Stroke({
								color: '#f00',
								width: 3
							})
						})*/
					})];
			}
			return my_highlightStyleCache[text];
		}
	});
	
	map.on('pointermove', function (evt) {
		if (evt.dragging) {
			return;
		}
		var pixel = map.getEventPixel(evt.originalEvent);
		displayFeatureInfo(pixel);
	});
	
	featureOverlay.my_highlight = null;
	var displayFeatureInfo = function (pixel) {
		
		var feature = map.forEachFeatureAtPixel(pixel, function (feature, layer) {
			if(layer && layer.get('name')=='idwm')
				return feature;
			return null;
		});
		
		var info = document.getElementById('map_log');
		if(info)
		{
			if (feature) {
				info.innerHTML = /*feature.getId() + ': ' +*/ feature.get('Name');
			} else {
				info.innerHTML = '&nbsp;';
			}
		}
		if (feature !== featureOverlay.my_highlight) {
			if (featureOverlay.my_highlight) {
				featureOverlay.getSource().removeFeature(featureOverlay.my_highlight);
			}
			if (feature) {
				featureOverlay.getSource().addFeature(feature);
			}
			featureOverlay.my_highlight = feature;
		}
	};
}

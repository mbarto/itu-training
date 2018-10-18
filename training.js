function firstMap() {
    new ol.Map({
        layers: [
            new ol.layer.Tile({
                source: new ol.source.OSM()
            })
        ],
        target: 'map',
        view: new ol.View({
            center: [0, 0],
            zoom: 2
        })
    });
}

function WMSMap() {
    /*var projExtent = ol.proj.get('EPSG:3857').getExtent();
    var startResolution = ol.extent.getWidth(projExtent) / 256;
    var resolutions = new Array(22);
    for (var i = 0, ii = resolutions.length; i < ii; ++i) {
        resolutions[i] = startResolution / Math.pow(2, i);
    }
    var tileGrid = new ol.tilegrid.TileGrid({
        extent: projExtent,
        resolutions: resolutions,
        tileSize: [512, 512]
    });*/


    new ol.Map({
        layers: [
            /*new ol.layer.Image({
                source: new ol.source.ImageWMS({
                    url: 'https://maps.geo-solutions.it/geoserver/wms',
                    params: { 'LAYERS': 'osm:osm'},
                    serverType: 'geoserver'
                })
            })*/
            new ol.layer.Tile({
                source: new ol.source.TileWMS({
                    url: 'https://maps.geo-solutions.it/geoserver/wms',
                    params: { 'LAYERS': 'osm:osm', 'TILED': true },
                    serverType: 'geoserver'
                })
            })
            /*new ol.layer.Tile({
                source: new ol.source.TileWMS({
                    url: 'https://maps.geo-solutions.it/geoserver/wms',
                    params: { 'LAYERS': 'osm:osm', 'TILED': true },
                    serverType: 'geoserver',
                    tileGrid: tileGrid
                })
            })*/
        ],
        target: 'map',
        view: new ol.View({
            center: [0, 0],
            zoom: 2
        })
    });
}

function queryTool() {
    var queryEnabled = false;
    var wmsSource = new ol.source.TileWMS({
        url: 'https://demo.geo-solutions.it/geoserver/wms',
        params: { 'LAYERS': 'unesco:Unesco_point', 'TILED': true },
        serverType: 'geoserver'
    });
    var map = new ol.Map({
        layers: [
            new ol.layer.Tile({
                source: new ol.source.TileWMS({
                    url: 'https://maps.geo-solutions.it/geoserver/wms',
                    params: { 'LAYERS': 'osm:osm', 'TILED': true },
                    serverType: 'geoserver'
                })
            }),
            new ol.layer.Tile({
                source: wmsSource
            })
        ],
        target: 'map',
        view: new ol.View({
            center: [1400000, 5300000],
            zoom: 5
        })
    });

    function renderFeature(feature) {
        return Object.keys(feature.properties).map(function(property) {
            return '<li><b>' + property + '</b>: ' + feature.properties[property] + '</li>';
        }).join('');
    }

    map.on('singleclick', function(evt) {
        if (queryEnabled) {
            var viewResolution = map.getView().getResolution();
            var url = wmsSource.getGetFeatureInfoUrl(
                evt.coordinate, viewResolution, 'EPSG:3857',
                // { 'INFO_FORMAT': 'text/html' });
                { 'INFO_FORMAT': 'application/json' });
            if (url) {
                axios.get(url).then(function(response) {
                    /*document.getElementById('info').innerHTML =
                        response.data;*/
                    document.getElementById('info').innerHTML = '<ul>' +
                        (response.data.features || []).map(renderFeature).join('<br/>') +
                        '</ul>'
                }).catch(function(e) {
                    console.log(e.message);
                });
                
            }
        } else {
            document.getElementById('info').innerHTML = '';
        }
    });
    document.getElementById('query-button').addEventListener('click', function (evt) {
        queryEnabled = !queryEnabled;
        document.getElementById('query-button').className = queryEnabled ? 'enabled' : '';
        document.getElementById('query-button').innerHTML = queryEnabled ? 'Disable Query' : 'Enable Query';
    });
    map.on('pointermove', function(evt) {
        if (evt.dragging) {
            return;
        }
        map.getTargetElement().style.cursor = queryEnabled ? 'pointer' : 'auto';
    });
}

function highlightTool() {
    var wmsSource = new ol.source.TileWMS({
        url: 'https://demo.geo-solutions.it/geoserver/wms',
        params: { 'LAYERS': 'topp:states', 'TILED': true },
        serverType: 'geoserver'
    });
    var highlightSource = new ol.source.Vector({
        features: []
    });
    var highlight = new ol.layer.Vector({
        source: highlightSource,
        style: new ol.style.Style({
            fill: new ol.style.Fill({
                color: 'rgba(255,0,255,0.7)'
            }),
            stroke: new ol.style.Stroke({
                color: '#ffff00',
                width: 3
            })
        })
    });
    var map = new ol.Map({
        layers: [
            new ol.layer.Tile({
                source: new ol.source.TileWMS({
                    url: 'https://maps.geo-solutions.it/geoserver/wms',
                    params: { 'LAYERS': 'osm:osm', 'TILED': true },
                    serverType: 'geoserver'
                })
            }),
            new ol.layer.Tile({
                source: wmsSource
            }),
            highlight
        ],
        target: 'map',
        view: new ol.View({
            center: [-11000000, 4700000],
            zoom: 5
        })
    });

    function highlightFeature(evt) {
        var viewResolution = map.getView().getResolution();
        var url = wmsSource.getGetFeatureInfoUrl(
            evt.coordinate, viewResolution, 'EPSG:3857',
            { 'INFO_FORMAT': 'application/json' });
        if (url) {
            axios.get(url).then(function(response) {
                highlightSource.clear();
                highlightSource.addFeatures((new ol.format.GeoJSON()).readFeatures(response.data));
            }).catch(function(e) {
                console.log(e.message);
            });

        }
    }

    map.on('pointermove', _.debounce(highlightFeature, 500, {leading: true}));
}

function Projections() {
    proj4.defs('EPSG:21781',
        '+proj=somerc +lat_0=46.95240555555556 +lon_0=7.439583333333333 +k_0=1 ' +
        '+x_0=600000 +y_0=200000 +ellps=bessel ' +
        '+towgs84=660.077,13.551,369.344,2.484,1.783,2.939,5.66 +units=m +no_defs');
    var swissProjection = new ol.proj.Projection({
        code: 'EPSG:21781',
        extent: [485071.54, 75346.36, 828515.78, 299941.84],
        units: 'm'
    });
    ol.proj.addProjection(swissProjection);
     
    new ol.Map({
        layers: [
            new ol.layer.Tile({
                source: new ol.source.TileWMS({
                    url: 'https://maps.geo-solutions.it/geoserver/wms',
                    params: { 'LAYERS': 'osm:osm', 'TILED': true },
                    serverType: 'geoserver'
                })
            })
        ],
        target: 'map1',
        view: new ol.View({
            center: [660013.50, 185172.04],
            zoom: 2,
            projection: 'EPSG:21781'
        })
        /*
        view: new ol.View({
            center: [0, 0],
            zoom: 2,
            projection: 'EPSG:4326'
        })
        */
    });

    new ol.Map({
        layers: [
            new ol.layer.Tile({
                source: new ol.source.TileWMS({
                    url: 'https://maps.geo-solutions.it/geoserver/wms',
                    params: { 'LAYERS': 'osm:osm', 'TILED': true },
                    serverType: 'geoserver'
                })
            })
        ],
        target: 'map2',
        view: new ol.View({
            center: [0, 0],
            zoom: 2,
            projection: 'EPSG:3857'
        })
    });
}

/*function Measure() {   
    var measureSource = new ol.source.Vector();

    var drawArea = new ol.interaction.Draw({
        source: measureSource,
        type: 'Polygon',
        style: new ol.style.Style({
            fill: new ol.style.Fill({
                color: 'rgba(255, 255, 255, 0.2)'
            }),
            stroke: new ol.style.Stroke({
                color: 'rgba(0, 0, 0, 0.5)',
                lineDash: [10, 10],
                width: 2
            }),
            image: new ol.style.Circle({
                radius: 5,
                stroke: new ol.style.Stroke({
                    color: 'rgba(0, 0, 0, 0.7)'
                }),
                fill: new ol.style.Fill({
                    color: 'rgba(255, 255, 255, 0.2)'
                })
            })
        })
    });

    var measureLayer = new ol.layer.Vector({
        source: measureSource,
        style: new ol.style.Style({
            fill: new ol.style.Fill({
                color: 'rgba(0, 255, 0, 0.5)'
            }),
            stroke: new ol.style.Stroke({
                color: '#ffcc33',
                width: 2
            }),
            image: new ol.style.Circle({
                radius: 7,
                fill: new ol.style.Fill({
                    color: '#ffcc33'
                })
            })
        })
    });

    var map = new ol.Map({
        layers: [
            new ol.layer.Tile({
                source: new ol.source.TileWMS({
                    url: 'https://maps.geo-solutions.it/geoserver/wms',
                    params: { 'LAYERS': 'osm:osm', 'TILED': true },
                    serverType: 'geoserver'
                })
            }),
            measureLayer
        ],
        target: 'map',
        view: new ol.View({
            center: [1400000, 5300000],
            zoom: 5
        })
    });

    function formatArea(polygon) {
        var area = ol.sphere.getArea(polygon);
        var output;
        if (area > 10000) {
            output = (Math.round(area / 1000000 * 100) / 100) +
                ' ' + 'km<sup>2</sup>';
        } else {
            output = (Math.round(area * 100) / 100) +
                ' ' + 'm<sup>2</sup>';
        }
        return output;
    };

    drawArea.on('drawstart',
        function(evt) {
            measureSource.clear();
        }
    );

    drawArea.on('drawend',
        function(evt) {
            var geom = evt.feature.getGeometry();
            var output = formatArea(geom);
            document.getElementById('measure').innerHTML = output;
        }
    );

    function setMeasureType(type) {
        switch(type) {
            case 'none': {
                map.removeInteraction(drawArea);
                break;
            }
            case 'area': {
                map.addInteraction(drawArea);
                break;
            }
            default: {

            }
        }
    }


    [].forEach.call(document.querySelectorAll("input[type='radio']"), function(input) {
        input.addEventListener('change', function(evt) {
            if (evt.target.checked) {
                setMeasureType(evt.target.value);
            }
        });
    });
}*/

function Measure() {
    var measureSource = new ol.source.Vector();
    var measures = {
        area: new ol.interaction.Draw({
            source: measureSource,
            type: 'Polygon',
            style: new ol.style.Style({
                fill: new ol.style.Fill({
                    color: 'rgba(255, 255, 255, 0.2)'
                }),
                stroke: new ol.style.Stroke({
                    color: 'rgba(0, 0, 0, 0.5)',
                    lineDash: [10, 10],
                    width: 2
                }),
                image: new ol.style.Circle({
                    radius: 5,
                    stroke: new ol.style.Stroke({
                        color: 'rgba(0, 0, 0, 0.7)'
                    }),
                    fill: new ol.style.Fill({
                        color: 'rgba(255, 255, 255, 0.2)'
                    })
                })
            })
        }),
        length: new ol.interaction.Draw({
            source: measureSource,
            type: 'LineString',
            style: new ol.style.Style({
                fill: new ol.style.Fill({
                    color: 'rgba(255, 255, 255, 0.2)'
                }),
                stroke: new ol.style.Stroke({
                    color: 'rgba(0, 0, 0, 0.5)',
                    lineDash: [10, 10],
                    width: 2
                }),
                image: new ol.style.Circle({
                    radius: 5,
                    stroke: new ol.style.Stroke({
                        color: 'rgba(0, 0, 0, 0.7)'
                    }),
                    fill: new ol.style.Fill({
                        color: 'rgba(255, 255, 255, 0.2)'
                    })
                })
            })
        })
    }
    
    var measureLayer = new ol.layer.Vector({
        source: measureSource,
        style: new ol.style.Style({
            fill: new ol.style.Fill({
                color: 'rgba(0, 255, 0, 0.5)'
            }),
            stroke: new ol.style.Stroke({
                color: '#ffcc33',
                width: 2
            }),
            image: new ol.style.Circle({
                radius: 7,
                fill: new ol.style.Fill({
                    color: '#ffcc33'
                })
            })
        })
    });

    var map = new ol.Map({
        layers: [
            new ol.layer.Tile({
                source: new ol.source.TileWMS({
                    url: 'https://maps.geo-solutions.it/geoserver/wms',
                    params: { 'LAYERS': 'osm:osm', 'TILED': true },
                    serverType: 'geoserver'
                })
            }),
            measureLayer
        ],
        target: 'map',
        view: new ol.View({
            center: [1400000, 5300000],
            zoom: 5
        })
    });

     function formatLength(line) {
        var length = ol.sphere.getLength(line);
        var output;
        if (length > 100) {
            output = (Math.round(length / 1000 * 100) / 100) +
                ' ' + 'km';
        } else {
            output = (Math.round(length * 100) / 100) +
                ' ' + 'm';
        }
        return output;
    }

    function formatArea(polygon) {
        var area = ol.sphere.getArea(polygon);
        var output;
        if (area > 10000) {
            output = (Math.round(area / 1000000 * 100) / 100) +
                ' ' + 'km<sup>2</sup>';
        } else {
            output = (Math.round(area * 100) / 100) +
                ' ' + 'm<sup>2</sup>';
        }
        return output;
    }

    function removeAllInteractions() {
        Object.keys(measures).forEach(function(m) {
            map.removeInteraction(measures[m]);
        });
    }

    function setMeasureType(type) {
        removeAllInteractions();
        if (measures[type]) {
            map.addInteraction(measures[type]);
        }
    }

    Object.keys(measures).forEach(function(m) {
        measures[m].on('drawstart',
            function(evt) {
                measureSource.clear();
            }
        );
        measures[m].on('drawend',
            function(evt) {
                var geom = evt.feature.getGeometry();
                var output;
                if (geom.getType() === 'Polygon') {
                    output = formatArea(geom);
                } else {
                    output = formatLength(geom);
                }
                document.getElementById('measure').innerHTML = output;
            }
        );
    });

    [].forEach.call(document.querySelectorAll("input[type='radio']"), function(input) {
        input.addEventListener('change', function(evt) {
            if (evt.target.checked) {
                setMeasureType(evt.target.value);
            }
        });
    });
}

function Interactions() {
    new ol.Map({
        layers: [
            new ol.layer.Tile({
                source: new ol.source.TileWMS({
                    url: 'https://maps.geo-solutions.it/geoserver/wms',
                    params: { 'LAYERS': 'osm:osm', 'TILED': true },
                    serverType: 'geoserver'
                })
            })
        ],
        interactions: ol.interaction.defaults().extend([
            new ol.interaction.DragRotateAndZoom()
        ]),
        target: 'map',
        view: new ol.View({
            center: [0, 0],
            zoom: 2
        })
    });
}

function Controls() {
    var backgrounds = {
        osm: new ol.layer.Tile({
            source: new ol.source.TileWMS({
                url: 'https://maps.geo-solutions.it/geoserver/wms',
                params: { 'LAYERS': 'osm:osm', 'TILED': true },
                serverType: 'geoserver'
            })
        }),
        s2cloudless: new ol.layer.Tile({
            source: new ol.source.TileWMS({
                url: 'https://maps.geo-solutions.it/geoserver/wms',
                params: { 'LAYERS': 's2cloudless:s2cloudless', 'TILED': true },
                serverType: 'geoserver'
            }),
            visible: false
        })
    };
    var overlays = {
        unesco: new ol.layer.Tile({
            source: new ol.source.TileWMS({
                url: 'https://demo.geo-solutions.it/geoserver/wms',
                params: { 'LAYERS': 'unesco:Unesco_point', 'TILED': true },
                serverType: 'geoserver'
            }),
            visible: false
        })
    }
    new ol.Map({
        layers: [
            backgrounds.osm,
            backgrounds.s2cloudless,
            overlays.unesco
        ],
        controls: ol.control.defaults().extend([
            new ol.control.ZoomSlider()
        ]),
        target: 'map',
        view: new ol.View({
            center: [0, 0],
            zoom: 2
        })
    });
    function switchBackground(layer) {
        Object.keys(backgrounds).forEach(function(l) {
            backgrounds[l].setVisible(l === layer);
        });
    }
    function toggleOverlay(layer, visible) {
        overlays[layer].setVisible(visible);
    }
    [].forEach.call(document.querySelectorAll("input[type='radio']"), function(input) {
        input.addEventListener('change', function(evt) {
            if (evt.target.checked) {
                switchBackground(evt.target.value);
            }
        });
    });
    [].forEach.call(document.querySelectorAll("input[type='checkbox']"), function(input) {
        input.addEventListener('change', function(evt) {
            toggleOverlay(evt.target.value, evt.target.checked);
        });
    });
}

function VectorStyling() {
    var wmsSource = new ol.source.TileWMS({
        url: 'https://demo.geo-solutions.it/geoserver/wms',
        params: { 'LAYERS': 'topp:states', 'TILED': true },
        serverType: 'geoserver'
    });
    
    var vectorSource = new ol.source.Vector({
        features: (new ol.format.GeoJSON()).readFeatures(geojsonObject)
    });
    var style1 = new ol.style.Style({
        image: new ol.style.Circle({
            radius: 10,
            fill: null,
            stroke: new ol.style.Stroke({ color: 'red', width: 1 })
        }),
        fill: new ol.style.Fill({
            color: 'rgba(255,0,255,0.7)'
        }),
        stroke: new ol.style.Stroke({
            color: '#ffff00',
            width: 3
        })
    });
    var style2 = new ol.style.Style({
        image: new ol.style.Circle({
            radius: 5,
            fill: new ol.style.Fill({
                color: 'rgba(255,255,255)'
            }),
            stroke: null
        })
    });

    var styleLabel = new ol.style.Style({
        text: new ol.style.Text({
            textAlign: 'center',
            font: 'Arial',
            text: 'mytext',
            fill: new ol.style.Fill({ color: '#000000' }),
            stroke: new ol.style.Stroke({ color: '#ffffff', width: 2 }),
            offsetX: 0,
            offsetY: 0,
            rotation: 0
        })
    });

    var image = new ol.style.Circle({
        radius: 5,
        fill: null,
        stroke: new ol.style.Stroke({ color: 'red', width: 1 })
    });

    var styles = {
        'Point': new ol.style.Style({
            image: image,
        }),
        'LineString': new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: 'green',
                width: 1
            })
        }),
        'MultiLineString': new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: 'green',
                width: 1
            })
        }),
        'MultiPoint': new ol.style.Style({
            image: image
        }),
        'MultiPolygon': new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: 'yellow',
                width: 1
            }),
            fill: new ol.style.Fill({
                color: 'rgba(255, 255, 0, 0.1)'
            })
        }),
        'Polygon': new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: 'blue',
                lineDash: [4],
                width: 3
            }),
            fill: new ol.style.Fill({
                color: 'rgba(0, 0, 255, 0.1)'
            })
        }),
        'GeometryCollection': new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: 'magenta',
                width: 2
            }),
            fill: new ol.style.Fill({
                color: 'magenta'
            }),
            image: new ol.style.Circle({
                radius: 10,
                fill: null,
                stroke: new ol.style.Stroke({
                    color: 'magenta'
                })
            })
        }),
        'Circle': new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: 'red',
                width: 2
            }),
            fill: new ol.style.Fill({
                color: 'rgba(255,0,0,0.2)'
            })
        })
    };
    var styleFun = function(feature, resolution) {
        var style = styles[feature.getGeometry().getType()];
        /*style.setText(new ol.style.Text({
            textAlign: 'center',
            font: 'Arial',
            text: feature.get('label'),
            fill: new ol.style.Fill({ color: '#000000' }),
            stroke: new ol.style.Stroke({ color: '#ffffff', width: 2 }),
            offsetX: 0,
            offsetY: 0,
            overflow: true,
            rotation: 0
        }));*/
        return style;
    }
    var vectorLayer = new ol.layer.Vector({
        source: vectorSource,
        style: styleFun
    });
    var map = new ol.Map({
        layers: [
            new ol.layer.Tile({
                source: new ol.source.TileWMS({
                    url: 'https://maps.geo-solutions.it/geoserver/wms',
                    params: { 'LAYERS': 'osm:osm', 'TILED': true },
                    serverType: 'geoserver'
                })
            }),
            new ol.layer.Tile({
                source: wmsSource
            }),
            vectorLayer
        ],
        target: 'map',
        view: new ol.View({
            center: [0, 0],
            zoom: 2
        })
    });
}

function VectorClustering() {
    var wmsSource = new ol.source.TileWMS({
        url: 'https://demo.geo-solutions.it/geoserver/wms',
        params: { 'LAYERS': 'topp:states', 'TILED': true },
        serverType: 'geoserver'
    });

    var vectorSource = new ol.source.Vector({
        features: (new ol.format.GeoJSON()).readFeatures(samplePoints)
    });

    var clusterSource = new ol.source.Cluster({
        distance: 30,
        source: vectorSource
    });
    
    var styleFun = function(feature, resolution) {
        var zoom = map.getView().getZoomForResolution(resolution);
        var size = feature.get('features').length;
        if (size === 1 && zoom > 5) {
            return new ol.style.Style({
                image: new ol.style.Circle({
                    radius: 5,
                    stroke: new ol.style.Stroke({
                        color: '#fff'
                    }),
                    fill: new ol.style.Fill({
                        color: '#ff00ff'
                    })
                })
            });
        }
        return new ol.style.Style({
            image: new ol.style.Circle({
                radius: 10,
                stroke: new ol.style.Stroke({
                    color: '#fff'
                }),
                fill: new ol.style.Fill({
                    color: '#3399CC'
                })
            }),
            text: new ol.style.Text({
                text: size.toString(),
                fill: new ol.style.Fill({
                    color: '#fff'
                })
            })
        });
    }
    var vectorLayer = new ol.layer.Vector({
        source: clusterSource,
        style: styleFun
    });

    var heatmapLayer = new ol.layer.Heatmap({
        source: vectorSource,
        blur: 10,
        radius: 10
    });
    
    var map = new ol.Map({
        layers: [
            new ol.layer.Tile({
                source: new ol.source.TileWMS({
                    url: 'https://maps.geo-solutions.it/geoserver/wms',
                    params: { 'LAYERS': 'osm:osm', 'TILED': true },
                    serverType: 'geoserver'
                })
            }),
            new ol.layer.Tile({
                source: wmsSource
            }),
            // heatmapLayer,
            vectorLayer
        ],
        target: 'map',
        view: new ol.View({
            center: [0, 0],
            zoom: 2
        })
    });
}

function Animations() {
    var wmsSource = new ol.source.TileWMS({
        url: 'https://demo.geo-solutions.it/geoserver/wms',
        params: { 'LAYERS': 'topp:states', 'TILED': true },
        serverType: 'geoserver'
    });

    var vectorSource = new ol.source.Vector({
        features: (new ol.format.GeoJSON()).readFeatures(samplePoints)
    });

    var vectorLayer = new ol.layer.Vector({
        source: vectorSource
    });
    
    var map = new ol.Map({
        layers: [
            new ol.layer.Tile({
                source: new ol.source.TileWMS({
                    url: 'https://maps.geo-solutions.it/geoserver/wms',
                    params: { 'LAYERS': 'osm:osm', 'TILED': true },
                    serverType: 'geoserver'
                })
            }),
            new ol.layer.Tile({
                source: wmsSource
            }),
            vectorLayer
        ],
        target: 'map',
        view: new ol.View({
            center: [0, 0],
            zoom: 2
        })
    });
    var duration = 3000;
    vectorSource.forEachFeature(function(feature) {
        var start = new Date().getTime();
        var listener;

        function animate(event) {
            var vectorContext = event.vectorContext;
            var frameState = event.frameState;
            var flashGeom = feature.getGeometry().clone();
            var elapsed = frameState.time - start;
            var elapsedRatio = elapsed / duration;
            // radius will be 5 at start and 30 at end.
            var radius = ol.easing.easeOut(elapsedRatio) * 25 + 5;
            var opacity = ol.easing.easeOut(1 - elapsedRatio);

            var style = new ol.style.Style({
                image: new ol.style.Circle({
                    radius: radius,
                    snapToPixel: false,
                    stroke: new ol.style.Stroke({
                        color: 'rgba(255, 0, 0, ' + opacity + ')',
                        width: 0.25 + opacity
                    })
                })
            });

            vectorContext.setStyle(style);
            vectorContext.drawGeometry(flashGeom);
            if (elapsed > duration) {
                ol.Observable.unByKey(listenerKey);
                return;
            }
            map.render();
        }

        listener = map.on('postcompose', animate);
    });
}

function VectorTiles() {
    var key = 'pk.eyJ1IjoibWJhcnRvIiwiYSI6ImNqbjRmZWwyMDBrM2YzcG85b2gwdGk3YzIifQ.e6TlrZidsIkbyVyUvPD7iw';

    // Calculation of resolutions that match zoom levels 1, 3, 5, 7, 9, 11, 13, 15.
    var resolutions = [];
    for (var i = 0; i <= 8; ++i) {
        resolutions.push(156543.03392804097 / Math.pow(2, i * 2));
    }
    // Calculation of tile urls for zoom levels 1, 3, 5, 7, 9, 11, 13, 15.
    function tileUrlFunction(tileCoord) {
        return ('https://{a-d}.tiles.mapbox.com/v4/mapbox.mapbox-streets-v6/' +
            '{z}/{x}/{y}.vector.pbf?access_token=' + key)
            .replace('{z}', String(tileCoord[0] * 2 - 1))
            .replace('{x}', String(tileCoord[1]))
            .replace('{y}', String(-tileCoord[2] - 1))
            .replace('{a-d}', 'abcd'.substr(
                ((tileCoord[1] << tileCoord[0]) + tileCoord[2]) % 4, 1));
    }

    var map = new ol.Map({
        layers: [
            new ol.layer.Tile({
                source: new ol.source.OSM()
            }),
            new ol.layer.VectorTile({
                declutter: true,
                source: new ol.source.VectorTile({
                    attributions: '© <a href="https://www.mapbox.com/map-feedback/">Mapbox</a> ' +
                        '© <a href="https://www.openstreetmap.org/copyright">' +
                        'OpenStreetMap contributors</a>',
                    format: new ol.format.MVT(),
                    /*url: 'https://{a-d}.tiles.mapbox.com/v4/mapbox.mapbox-streets-v6/' +
                        '{z}/{x}/{y}.vector.pbf?access_token=' + key*/
                    url: 'https://maps.geo-solutions.it/geoserver/gwc/service/tms/1.0.0/osm:ne_10m_admin_0_sovereignty@EPSG%3A900913@pbf/{z}/{x}/{-y}.pbf'
                    /*
                    ,
                    tileGrid: new ol.tilegrid.TileGrid({
                        extent: ol.proj.get('EPSG:3857').getExtent(),
                        resolutions: resolutions,
                        tileSize: 512
                    }),
                    tileUrlFunction: tileUrlFunction*/
                }),
                style: new ol.style.Style({
                    fill: new ol.style.Fill({
                        color: '#dddddd'
                    }),
                    stroke: new ol.style.Stroke({
                        color: '#333333',
                        width: 0.5
                    }),
                    image: new ol.style.Circle({
                        radius: 4,
                        fill: new ol.style.Fill({
                            color: '#000000'
                        })
                    })
                })
                // style: createMapboxStreetsV6Style(ol.style.Style, ol.style.Fill, ol.style.Stroke, ol.style.Icon, ol.style.Text)
            })
        ],
        target: 'map',
        view: new ol.View({
            center: [0, 0],
            zoom: 2
        })
    });
}
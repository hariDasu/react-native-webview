
(function() {
  var re = /[a-zA-Z]+\d\d+_/g
  window.addEventListener('message', function (e) {
    var floorPlanData = JSON.parse(e.data);
    if ( floorPlanData.addItem ){
        if (floorPlanData.platform === 'android') {
           document.getElementsByClassName('leaflet-draw-draw-'+ floorPlanData.itemType)[0].dispatchEvent(new Event('click'));
           } else {
          var leafletEvents = $('.leaflet-draw-draw-'+ floorPlanData.itemType)[0]._leaflet_events
          var addItemKey = Object.keys(leafletEvents)
                          .filter(key => key.startsWith(key.match(re)))[0]
          var addItemFunc = leafletEvents[addItemKey]
          addItemFunc()
       }
        $('.leaflet-draw-actions').addClass('marker-draw-action');
        $('#placeItem').show();
        $('#placeItem').fadeOut(4000)
        L.bounds = floorPlanData.bounds;
    } else if (floorPlanData.rerenderItems){
        $('#mapid').remove();
        $( "#placeholder" ).after( '<div id="mapid"></div>' );
        createMap(floorPlanData);
        $('.marker-draw-action li a').click();
    } else if(floorPlanData.syncText) {
        $('#syncText').show();
        $('#syncText').fadeOut(6000);
    } else if(floorPlanData.offlineText) {
        $('#offlineText').show();
        $('#offlineText').fadeOut(6000);
    } else if (floorPlanData.floorZoom){
        $('#mapid').remove();
        $( "#placeholder" ).after( '<div id="mapid"></div>' );
    createMap(floorPlanData);
    } else {
    //createMap(floorPlanData)
        if (floorPlanData.initial === true) {
        createMap(floorPlanData);
        }
     }
    });
  
  function createMap(floorPlanData){
  
  var imgWidth   = parseInt(floorPlanData.image_width);
  var imgHeight  = parseInt(floorPlanData.image_height);
  var maxMapZoom = 3;
  var minMapZoom = 0;
  var map = L.map('mapid', {
                  maxZoom: 8,
                  minZoom: minMapZoom,
                  crs: L.CRS.Simple,
                  attributionControl: false,
                  zoomSnap:0,
                  zoomControl:false
                  });
  
  var mapCenter = map.unproject([imgWidth/2, imgHeight/2], maxMapZoom);
  if(floorPlanData.center != undefined && floorPlanData.zoom != undefined) {
  map.setView(floorPlanData.center, floorPlanData.zoom)
  } else {
  map.setView(mapCenter, map.getMinZoom());
  }
  var mapSouthWest = map.unproject([0, imgHeight], maxMapZoom),
  mapNorthEast = map.unproject([imgWidth, 0], maxMapZoom),
  mapBounds = new L.LatLngBounds(mapSouthWest, mapNorthEast);
  var canvasSouthWest = map.unproject([-500, imgHeight+500], maxMapZoom),
  canvasNorthEast = map.unproject([imgWidth+500, -500], maxMapZoom),
  canvasBounds = new L.LatLngBounds(canvasSouthWest, canvasNorthEast);
  //map.setMaxBounds(canvasBounds);
  
  L.tileLayer(floorPlanData.url + '/{z}/tile_{x}_{y}.png', {
              attribution: 'Map data &copy; ???',
              bounds: mapBounds,
              noWrap: true,
              continuousWorld: true,
              maxZoom: 8,
              maxNativeZoom: maxMapZoom,
              tileSize: 256,
              }).addTo(map);
  
  // Add home button
  L.easyButton({
               states: [{
                        title: 'Go Home',
                        icon: 'fa-home',
                        onClick: function(btn, map) {
                        map.setView(mapCenter, map.getMinZoom());
                        }
                        }]
               }).addTo(map);
  
  
  
  // Add custom marker button
  L.easyButton({
               states: [{
                        title: 'Add Item',
                        icon: 'fa-plus fa-lg',
                        onClick: function(btn, map) {
                            var data = {};
                            data.action = "show item types";
                            data.bounds = map.getBounds();
                            data.center = map.getCenter();
                            data.zoom = map.getZoom();
                            window.ReactNativeWebView.postMessage(JSON.stringify(data));
                        
                            }
                        }]
               }).addTo(map);
  
  // Add custom marker button
  L.easyButton({
               states: [{
                        title: 'Item Legend',
                        icon: 'fa-info fa-lg',
                        onClick: function(btn, map) {
                            var data = {};
                            data.action = "show item legend";
                            data.bounds = map.getBounds();
                            data.center = map.getCenter();
                            data.zoom = map.getZoom();
                            window.ReactNativeWebView.postMessage(JSON.stringify(data));
                        
                            }
                        }]
               }).addTo(map);
  
  
  
  // Add report button
  L.easyButton({
               states: [{
                        title: 'Export',
                        icon: 'fa-cloud-download',
                        onClick: function(btn, map) {
                        var data = {};
                        data.action = "report";
                        data.bounds = map.getBounds();
                        data.zoom = map.getZoom();
                        window.ReactNativeWebView.postMessage(JSON.stringify(data));
                        }
                        }],
               position: 'topright'
               }).addTo(map);
  
  L.easyButton({
               states: [{
                        title: 'Sync',
                        icon: 'fa-refresh',
                        onClick: function(btn, map) {
                        var data = {};
                        data.action = "sync items";
                        data.bounds = map.getBounds();
                        data.zoom = map.getZoom();
                        window.ReactNativeWebView.postMessage(JSON.stringify(data));
                        }
                        }],
               position: 'topright'
               }).addTo(map);
  
  var editableLayers = new L.FeatureGroup();
  map.addLayer(editableLayers);
  
  editableLayers.on("click", function(event){
                    var data = {};
                    data.action = "show item details";
                    data.bounds = map.getBounds();
                    data.center = map.getCenter();
                    data.zoom = map.getZoom();
                    data.itemData = event.layer.options.itemData;
                    window.ReactNativeWebView.postMessage(JSON.stringify(data));
                    });
  
  var iconUrls = {
  penetrations: {
  blue: 'stamps/penetration-blue-xl.png',
  red: 'stamps/penetration-red-xl.png',
  green: 'stamps/penetration-green-xl.png'
  },
  joints: {
  blue: 'stamps/joint-blue-xl.png',
  red: 'stamps/joint-red-xl.png',
  green: 'stamps/joint-green-xl.png'
  },
  doors: {
  blue: 'stamps/door-blue-xl.png',
  red: 'stamps/door-red-xl.png',
  green: 'stamps/door-green-xl.png'
  },
  dampers: {
  blue: 'stamps/damper-blue-xl.png',
  red: 'stamps/damper-red-xl.png',
  green: 'stamps/damper-green-xl.png'
  },
  barriers: {
  blue: 'stamps/barrier-blue-xl.png',
  red: 'stamps/barrier-red-xl.png',
  green: 'stamps/barrier-green-xl.png'
  },
  extinguishers: {
  blue: 'stamps/extinguisher-blue-xl.png',
  red: 'stamps/extinguisher-red-xl.png',
  green: 'stamps/extinguisher-green-md.png'
  }
  }
  
  var opts = {
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  popupAnchor: [0, -5]
  };
  // Define the penetration icons
  opts.type = {id : 1, description: 'Penetration', type: 'stamp', letter_code: 'P', is_standard: true};
  opts.item_type_id = 1;
  opts.iconUrl = iconUrls.penetrations.blue;
  penetrationBlueIcon = L.icon(opts);
  opts.iconUrl = iconUrls.penetrations.red;
  penetrationRedIcon = L.icon(opts);
  opts.iconUrl = iconUrls.penetrations.green;
  penetrationGreenIcon = L.icon(opts);
  
  // Define the joint stamp
  opts.type = {id : 2, description: 'Joint', type: 'stamp', letter_code: 'J', is_standard: true};
  opts.item_type_id = 2;
  opts.iconUrl = iconUrls.joints.blue;
  jointBlueIcon = L.icon(opts);
  opts.iconUrl = iconUrls.joints.red;
  jointRedIcon = L.icon(opts);
  opts.iconUrl = iconUrls.joints.green;
  jointGreenIcon = L.icon(opts);
  
  // Define the door stamp
  opts.type = {id : 3, description: 'Door', type: 'stamp', letter_code: 'DO', is_standard: true};
  opts.item_type_id = 3;
  opts.iconUrl = iconUrls.doors.blue;
  doorBlueIcon = L.icon(opts);
  opts.iconUrl = iconUrls.doors.red;
  doorRedIcon = L.icon(opts);
  opts.iconUrl = iconUrls.doors.green;
  doorGreenIcon = L.icon(opts);
  
  // Define the damper stamp
  opts.type = {id : 4, description: 'Damper', type: 'stamp', letter_code: 'DA', is_standard: true};
  opts.item_type_id = 4;
  opts.iconUrl = iconUrls.dampers.blue;
  damperBlueIcon = L.icon(opts);
  opts.iconUrl = iconUrls.dampers.red;
  damperRedIcon = L.icon(opts);
  opts.iconUrl = iconUrls.dampers.green;
  damperGreenIcon = L.icon(opts);
  
  // Define the barrier stamp
  opts.type = {id : 5, description: 'Barrier', type: 'stamp', letter_code: 'B', is_standard: true};
  opts.item_type_id = 5;
  opts.iconUrl = iconUrls.barriers.blue;
  barrierBlueIcon = L.icon(opts);
  opts.iconUrl = iconUrls.barriers.red;
  barrierRedIcon = L.icon(opts);
  opts.iconUrl = iconUrls.barriers.green;
  barrierGreenIcon = L.icon(opts);
  
  // Define the extinguisher stamp
  opts.type = {id : 6, description: 'Extinguisher', type: 'stamp', letter_code: 'E', is_standard: true};
  opts.item_type_id = 6;
  opts.iconUrl = iconUrls.extinguishers.blue;
  extinguisherBlueIcon = L.icon(opts);
  opts.iconUrl = iconUrls.extinguishers.red;
  extinguisherRedIcon = L.icon(opts);
  opts.iconUrl = iconUrls.extinguishers.green;
  extinguisherGreenIcon = L.icon(opts);
  
  // Extend the marker class for our custom markers
  L.Draw.Penetration = L.Draw.Marker.extend({
                                            statics: {
                                            TYPE: 'penetration'
                                            },
                                            options: {
                                            icon: penetrationBlueIcon,
                                            repeatMode : false,
                                            zIndexOffset : 1000
                                            },
                                            initialize: function(map, options) {
                                            // Save the type so super can fire, need to do this as cannot do this.TYPE :(
                                            this.type = L.Draw.Penetration.TYPE;
                                            L.Draw.Feature.prototype.initialize.call(this, map, options);
                                            }
                                            });
  L.Draw.Joint = L.Draw.Marker.extend({
                                      statics: {
                                      TYPE: 'joint'
                                      },
                                      options: {
                                      icon: jointBlueIcon,
                                      repeatMode : false,
                                      zIndexOffset : 1000
                                      },
                                      initialize: function(map, options) {
                                      // Save the type so super can fire, need to do this as cannot do this.TYPE :(
                                      this.type = L.Draw.Joint.TYPE;
                                      L.Draw.Feature.prototype.initialize.call(this, map, options);
                                      }
                                      });
  L.Draw.Door = L.Draw.Marker.extend({
                                     statics: {
                                     TYPE: 'door'
                                     },
                                     options: {
                                     icon: doorBlueIcon,
                                     repeatMode : false,
                                     zIndexOffset : 1000
                                     },
                                     initialize: function(map, options) {
                                     // Save the type so super can fire, need to do this as cannot do this.TYPE :(
                                     this.type = L.Draw.Door.TYPE;
                                     L.Draw.Feature.prototype.initialize.call(this, map, options);
                                     }
                                     });
  L.Draw.Damper = L.Draw.Marker.extend({
                                       statics: {
                                       TYPE: 'damper'
                                       },
                                       options: {
                                       icon: damperBlueIcon,
                                       repeatMode : false,
                                       zIndexOffset : 1000
                                       },
                                       initialize: function(map, options) {
                                       // Save the type so super can fire, need to do this as cannot do this.TYPE :(
                                       this.type = L.Draw.Damper.TYPE;
                                       L.Draw.Feature.prototype.initialize.call(this, map, options);
                                       }
                                       });
  L.Draw.Barrier = L.Draw.Marker.extend({
                                        statics: {
                                        TYPE: 'barrier'
                                        },
                                        options: {
                                        icon: barrierBlueIcon,
                                        repeatMode : false,
                                        zIndexOffset : 1000
                                        },
                                        initialize: function(map, options) {
                                        // Save the type so super can fire, need to do this as cannot do this.TYPE :(
                                        this.type = L.Draw.Barrier.TYPE;
                                        L.Draw.Feature.prototype.initialize.call(this, map, options);
                                        }
                                        });
  L.Draw.Extinguisher = L.Draw.Marker.extend({
                                             statics: {
                                             TYPE: 'extinguisher'
                                             },
                                             options: {
                                             icon: extinguisherBlueIcon,
                                             repeatMode : false,
                                             zIndexOffset : 1000
                                             },
                                             initialize: function(map, options) {
                                             // Save the type so super can fire, need to do this as cannot do this.TYPE :(
                                             this.type = L.Draw.Extinguisher.TYPE;
                                             L.Draw.Feature.prototype.initialize.call(this, map, options);
                                             }
                                             });
  
  // Redefine draw elements
  L.DrawToolbar.prototype.getModeHandlers= function (map) {
  return [
          {
          enabled: this.options.polyline,
          handler: new L.Draw.Polyline(map, this.options.polyline),
          title: L.drawLocal.draw.toolbar.buttons.polyline
          },
          {
          enabled: this.options.polygon,
          handler: new L.Draw.Polygon(map, this.options.polygon),
          title: L.drawLocal.draw.toolbar.buttons.polygon
          },
          {
          enabled: this.options.rectangle,
          handler: new L.Draw.Rectangle(map, this.options.rectangle),
          title: L.drawLocal.draw.toolbar.buttons.rectangle
          },
          {
          enabled: this.options.circle,
          handler: new L.Draw.Circle(map, this.options.circle),
          title: L.drawLocal.draw.toolbar.buttons.circle
          },
          {
          enabled: this.options.penetration,
          handler: new L.Draw.Penetration(map, this.options.penetration),
          title: L.drawLocal.draw.toolbar.buttons.penetration
          },
          {
          enabled: this.options.joint,
          handler: new L.Draw.Joint(map, this.options.joint),
          title: L.drawLocal.draw.toolbar.buttons.joint
          },
          {
          enabled: this.options.door,
          handler: new L.Draw.Door(map, this.options.door),
          title: L.drawLocal.draw.toolbar.buttons.door
          },
          {
          enabled: this.options.damper,
          handler: new L.Draw.Damper(map, this.options.damper),
          title: L.drawLocal.draw.toolbar.buttons.damper
          },
          {
          enabled: this.options.barrier,
          handler: new L.Draw.Barrier(map, this.options.barrier),
          title: L.drawLocal.draw.toolbar.buttons.barrier
          },
          {
          enabled: this.options.extinguisher,
          handler: new L.Draw.Extinguisher(map, this.options.extinguisher),
          title: L.drawLocal.draw.toolbar.buttons.extinguisher
          }
          ];
  };
  
  L.EditToolbar.Delete.include({
                               removeAllLayers: false
                               });
  
  var options = {
    position: 'topleft',
      draw: {
      // polygon: {
      //  allowIntersection: false, // Restricts shapes to simple polygons
      //  drawError: {
      //    color: '#e1e100', // Color the shape will turn when intersects
      //    message: '<strong>Oh snap!<strong> you can\'t draw that!' // Message that will show when intersect
      //  },
      //  shapeOptions: {
      //    color: '#97009c'
      //  }
      // },
      // polyline: {
      //  shapeOptions: {
      //    color: '#f357a1',
      //    weight: 10
      //  }
      // },
      // disable toolbar item by setting it to false
      polygon: false,
      polyline: false,
      circle: false, // Turns off this drawing tool
      marker: false,
      rectangle: false,
      penetration: true,
      joint: true,
      door: true,
      damper: true,
      barrier: true,
      extinguisher: true,
      },
      edit: {
      featureGroup: editableLayers, //REQUIRED!!
      remove: true
      }
  };
  
  //Add pre-existing items
  for (var i = 0, len = floorPlanData.items.length; i < len; i++) {
  var latlngs;
  if(floorPlanData.items[i].hasOwnProperty("offlineItemId")){
  latlngs = floorPlanData.items[i].mapLats;
  } else {
  latlngs = JSON.parse(floorPlanData.items[i].latlngs);
  }
  var altText = floorPlanData.items[i].itemType + "-" + floorPlanData.items[i].item_id;
  var numInspections = floorPlanData.items[i].num_inspections;
  var status = floorPlanData.items[i].status;
  var statusId = floorPlanData.items[i].status_id;
  var itemTypeId = floorPlanData.items[i].item_type_id;
  var markerIcon;
  switch(itemTypeId) {
  case 1:
  if(numInspections > 0 && (status=="Passed" || statusId == 4)){
  markerIcon = penetrationGreenIcon;
  } else if (numInspections > 0 || (status=="Failed" || statusId == 5)) {
  markerIcon = penetrationRedIcon;
  } else {
  markerIcon = penetrationBlueIcon;
  }
  break;
  case 2:
  if(numInspections > 0 && (status=="Passed" || statusId == 4)){
  markerIcon = jointGreenIcon;
  } else if (numInspections > 0 || (status=="Failed" || statusId == 5)) {
  markerIcon = jointRedIcon;
  } else {
  markerIcon = jointBlueIcon;
  }
  break;
  case 3:
  if(numInspections > 0 && status=="Passed"){
  markerIcon = doorGreenIcon;
  } else if (numInspections > 0 || (status=="Failed" || statusId == 5)) {
  markerIcon = doorRedIcon;
  } else {
  markerIcon = doorBlueIcon;
  }
  break;
  case 4:
  if(numInspections > 0 && status=="Passed"){
  markerIcon = damperGreenIcon;
  } else if (numInspections > 0 || status=="Failed") {
  markerIcon = damperRedIcon;
  } else {
  markerIcon = damperBlueIcon;
  }
  break;
  case 5:
  if(numInspections > 0 && (status=="Passed" || statusId == 4)){
  markerIcon = barrierGreenIcon;
  } else if (numInspections > 0 || (status=="Failed" || statusId == 5)) {
  markerIcon = barrierRedIcon;
  } else {
  markerIcon = barrierBlueIcon;
  }
  break;
  case 6:
  if(numInspections > 0 && status=="Passed"){
  markerIcon = extinguisherGreenIcon;
  } else if (numInspections > 0 || status=="Failed") {
  markerIcon = extinguisherRedIcon;
  } else {
  markerIcon = extinguisherBlueIcon;
  }
  break;
  default:
  break;
  }
  
  
  L.marker([latlngs.lat, latlngs.lng],
           { icon: markerIcon,
           itemData: JSON.stringify(floorPlanData.items[i]),
           alt: altText})
  .addTo(editableLayers);
  }
  
  // Initialise the draw control and pass it the FeatureGroup of editable layers
  var drawControl = new L.Control.Draw(options);
  // var textControl = new L.Illustrate.Control();
  map.addControl(drawControl);
  // map.addControl(textControl);
  map.on('draw:created', function(e) {
         
         var type = e.layerType,
         layer = e.layer;
         
         editableLayers.addLayer(layer);
         });
  
  
  map.on('draw:created', function(e) {
         
         var type = e.layerType;
         
         if( type == "penetration" || type == "joint" || type == "door" || type == "damper" || type == "barrier" || type == "extinguisher"){
         var data = {};
         data.action = "add new item";
         data.itemData = {};
         data.itemData.item_type = e.layer.options.icon.options.type;
         data.itemData.latlng = e.layer._latlng;
         window.ReactNativeWebView.postMessage(JSON.stringify(data));
         }
         $('.leaflet-draw-actions').removeClass('marker-draw-action');
         });
  
  // Batch delete items
  map.on('draw:deleted', function(event) {
         var data = {};
         
         data.action = "delete items";
         var items = event.layers._layers, itemsToDelete = [];
         for (var i in items) {
         if (items[i].options.itemData != undefined) {
         itemsToDelete.push(JSON.parse(items[i].options.itemData));
         }
         }
         
         data.itemsToDelete = itemsToDelete;
         window.ReactNativeWebView.postMessage(JSON.stringify(data));
         });
  
  // Batch update item positions
  map.on('draw:edited', function(event) {
         var data = {};
         data.action = "update items";
         var items = event.layers._layers,
         itemsToUpdate = [];
         for (var i in items) {
         if (JSON.parse(items[i].options.itemData).item_id != undefined) {
         itemsToUpdate.push({
                            id: JSON.parse(items[i].options.itemData).item_id,
                            latlngs: items[i]._latlng
                            });
         } else if (items[i].options.itemData.offlineItemId != undefined) {
         itemsToUpdate.push({
                            offlineItemId: JSON.parse(items[i].options.itemData).offlineItemId,
                            latlngs: items[i]._latlng
                            });
         }
         }
         data.itemsToUpdate = itemsToUpdate;
         window.ReactNativeWebView.postMessage(JSON.stringify(data));
         });
  
  map.on('draw:drawstop', function() {
         $('.leaflet-draw-actions').removeClass('marker-draw-action');
         });
  
  map.on('draw:editstart draw:editstop', function() {
         $('.leaflet-marker-icon').addClass('transitions');
         setTimeout(function() {
                    $('.leaflet-marker-icon').removeClass('transitions');
                    }, 300);
         });
  
  $("button[title='Add Item']").css("padding-top","9px");
  $("button[title='Add Item']").css("padding-left","7px");
 
  $("button[title='Item Legend']").css("padding-top","10px");
  $("button[title='Item Legend']").css("padding-left","9px");
  
  $("button[title='Add Notes']").css("padding-top","6px");
  $("button[title='Add Notes']").css("padding-left","6px");
  
  $("button[title='Go Home']").css("padding-top","6px");
  $("button[title='Go Home']").css("padding-left","7px");
 
 $(".leaflet-draw-draw-penetration").css("padding-left","20px");
  
  if ( floorPlanData.floorZoom ) {
      $('.leaflet-marker-icon').addClass('transitions');
      map.fitBounds( [floorPlanData.latlngs] );
      }
  if (floorPlanData.itemZoom) {
      $('.leaflet-marker-icon').addClass('transitions');
      map.fitBounds([floorPlanData.latlngs]);
      map.setZoom(3);
      }
  }
  })();

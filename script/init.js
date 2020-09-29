let iconBase = 'http://maps.google.com/mapfiles/kml/pal2/';
const file = "json/listResto.json";
const restaurants = new Array;
const markers = new Array;

function initMap() {
  //initialisation de la map
  let map = new google.maps.Map(document.getElementById('map'), {
    center: new google.maps.LatLng(48.8566667, 2.3509871),
    zoom: 16,    
  });
  //recupération de la geolocalisation
  let infoWindow = new google.maps.InfoWindow;
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      var pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };        
      new google.maps.Marker({ 
        position: pos, 
        map: map,
        animation: google.maps.Animation.BOUNCE, 
        title: "Votre position" });  
      map.setCenter(pos);
    }, function() {
      handleLocationError(true, infoWindow, map.getCenter());
    });
  } else {
    // Browser doesn't support Geolocation
    handleLocationError(false, infoWindow, map.getCenter());
  }   
  getRestaurantByJSON(file)
  addRestaurantByMap(map) 
  filterByAverage(map)
  map.addListener('bounds_changed', function(){   
    addRestaurantByGoogle(map)
    filterByMap(map)
  })
};
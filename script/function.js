/**
 * Create a template html for the list of restaurants
 * @param {string} name Name restaurant
 * @param {number} average Average restaurant
 * @returns {string} Template html for list restaurant
 */
function transformDom(name, average){
  let templateHTML 
    =   "<div class='row textResto align-items-center'>"
    +     "<div class='star-ratings-sprite '>"
    +       `<span id='${name.toLowerCase().replace(/[^a-z]/g,'')}' style='width:${(Math.round((average) * 100) / 10*10)/5}%' class='star-ratings-sprite-rating'></span>`
    +     "</div>"
    +     `<p class='col'><b>${name}</b></p>`
    +     `<button class ='viewComment col-3' type='button' id='${name.toLowerCase().replace(/[^a-z]/g,'')}-viewComment'>Voir les commentaires</button>`
    +   "</div>"
    +   "<br>" 
  return templateHTML
};
/**
 * Format all comment of restaurant
 * @param {object} element Restaurant object
 * @returns {string} HTML comment template for one restaurant
 */
function showComments(element){
  $("#comment").html("");
  $("#restaurantName").html("");
  $("#restaurantName").append(element.name)
  $("#addComment").attr("class", `${element.name.toLowerCase().replace(/[^a-z]/g,'')}-addComment`)
  element.rating.forEach(ratings => {           
    $("#comment").append(
        "<div id='bg-comment'>"
      +    "<div class='star-ratings-sprite'>"
      +      `<span style='width:${(ratings.stars*100)/5}%' class='star-ratings-sprite-rating'></span>`
      +    "</div>"
      +    `<p>${ratings.comment}</p>`
      +  "</div>"
      +  "</br>"
    )
  });   
};
/**
 * Manage error of geolocation
 * @param {*} browserHasGeolocation 
 * @param {*} infoWindow 
 * @param {number} pos Geolocation coordinates
 * @returns {string} Alerte for geolocation
 */
function handleLocationError(browserHasGeolocation, infoWindow, pos) {
  infoWindow.setPosition(pos);
  infoWindow.setContent(browserHasGeolocation ?
    'Error: The Geolocation service failed.' :
    'Error: Your browser doesn\'t support geolocation.');
  infoWindow.open(map);
    alert ("Veuillez accepter la géolocalisation")
};
/**
 * Create a url for streetview
 * @param {number} restaurantLat Geolocation coordinates
 * @param {number} restaurantLong Geolocation coordinates
 * @returns {string} Format url for streetview
 */
function generateStreetView(restaurantLat, restaurantLong){
  let streetLocation = `${restaurantLat},${restaurantLong}`
  let startUrl = "https://maps.googleapis.com/maps/api/streetview?size=400x400&location="
  let endUrl = "&fov=80&heading=70&pitch=0&key=AIzaSyB5_0A8Y5QisEx9_uAPSPe2cq_DQ1ApEDg"
  return `${startUrl}${streetLocation}${endUrl}`
}
/**
 * Open comment of restaurant and add new comment
 * @returns New comment
 */
function newComment() {    
  for (let i = 0; i < markers.length; i++) {
    let idRestaurant = restaurants[i].name.toLowerCase().replace(/[^a-z]/g,'')
    //Affiche les commentaires au click des markers         
    markers[i].addListener('click', function() {
      showComments(restaurants[i])
      $("#streetView").attr("src", generateStreetView(restaurants[i].lat, restaurants[i].long))
      $("#myModal-viewComment").modal()
    });
    //Affiche les commentaire au click des bouton dans la liste
    $(`#${idRestaurant}-viewComment`).unbind()
    $(`#${idRestaurant}-viewComment`).on("click", function(){
      showComments(restaurants[i])
      $("#streetView").attr("src", generateStreetView(restaurants[i].lat, restaurants[i].long))
      $("#myModal-viewComment").modal()
    })
    //Ouvre la fenetre modal pour ajouter un commentaire
    $(`.${idRestaurant}-addComment`).unbind()  
      $(".modal-footer").on("click",`.${idRestaurant}-addComment`, function(){            
        $("#push").attr("class",`${idRestaurant}-pushComment` )
        $("#myModal-addComment").modal()
        //envoi un commentaire
        $(`.${idRestaurant}-pushComment`).unbind()    
        $(`.${idRestaurant}-pushComment`).on("click",function () {          
          if ($("#formAddComment")[0].checkValidity() == true){
            let comment = $('#addCommentTexte').val();
            let stars = $('#ratingAdd').val();
            let rating = new Object()
            rating.stars = parseInt(stars)
            rating.comment = comment                                  
            restaurants[i].addRating(rating.comment, rating.stars)
            $(`#${idRestaurant}`).attr("style", `width:${(Math.round((restaurants[i].calculAverage(restaurants[i])) * 100) / 10*10)/5}%`)
            transformDom(restaurants[i].name,restaurants[i].average)
            showComments(restaurants[i])
            $('#myModal-addComment').modal("hide")
            $("#myModal-viewComment").modal()
            $("#formAddComment")[0].reset();                   
          } else {                    
            alert ("Veuillez remplir tous les champs");
          }           
      })
    })        
  }
};
/**
 * Get the list of restaurants in the json file
 * @param {string} file Url file JSON
 * @returns {object} Push list restaurants in the json file in array restaurants
 */
function getRestaurantByJSON(file){
  $.getJSON(file, function (data) {   
    data.forEach(restaurant => {
      //Ajout d'un id
      let id = `${restaurant.lat}${restaurant.long}`
      restaurant.id = id.replace(/[^0-9]/g,'');
      //Récupération de la localisation du restaurant
      let restaurantLocation = { lat: restaurant.lat, lng: restaurant.long };
      //création marker du restaurant 
      let marker = new google.maps.Marker({ 
        position: restaurantLocation, 
        title: restaurant.restaurantName, 
        icon: `${iconBase}icon55.png`,       
      }); 
      //Récupération de la moyenne du restaurant
      let allStars = 0;
      restaurant.ratings.forEach( rating => {
        allStars += rating.stars;     
      })
      let average = allStars / restaurant.ratings.length;
      allStars = 0;
      restaurant.average = average
      //Envoie des data dans tableau
      const allRestaurant = new Restaurant(restaurant.id, restaurant.restaurantName, restaurant.address, restaurant.lat, restaurant.long, average)
      restaurant.ratings.forEach( rating => {
        allRestaurant.addRating(rating.comment, rating.stars)        
      })
      markers.push(marker)
      restaurants.push(allRestaurant)
    })
  });
}
/**
 * Add a restaurant to the click on the map
 * @param {object} map Is map of API google
 * @returns {object} Add a restaurant to the array restaurants
 */
function addRestaurantByMap(map){
  let restaurantLocation
  google.maps.event.addListener(map, 'click', function (event) {
    restaurantLocation = { lat: event.latLng.lat(), lng: event.latLng.lng() }
    $('#myModal-addRestaurant').modal()
    return restaurantLocation
  });
  $("#addRestaurant").on("click", function(){
    $("#myModal-pushRestaurant").modal()
  })
  $("#pushRestaurant").on("click", function(){
    let newRestaurant = new Object()
    let rating = new Object()
    let name = $("#addName").val()
    let address = $("#addAddress").val()
    let stars = parseInt($("#ratingStars").val())
    let comment = $("#commentText").val()
    let id = `${restaurantLocation.lat}${restaurantLocation.lng}`;
    if ($("#formAddRestaurants")[0].checkValidity() == true){
      rating.stars = stars;
      rating.comment = comment;
      newRestaurant.restaurantName = name;
      newRestaurant.average = stars;
      newRestaurant.id = id.replace(/[^0-9]/g,'')
      newRestaurant.address = address;
      newRestaurant.lat = restaurantLocation.lat;
      newRestaurant.long = restaurantLocation.lng;
      const allRestaurant = new Restaurant(newRestaurant.id, newRestaurant.restaurantName, newRestaurant.address, newRestaurant.lat, newRestaurant.long, newRestaurant.average)          
      restaurants.push(allRestaurant);
      allRestaurant.addRating(rating.comment, rating.stars)
      let marker = new google.maps.Marker({ 
        position: restaurantLocation, 
        title: name, 
        icon: `${iconBase}icon55.png`,
      });    
      if(screen.width > 768){
        marker.setAnimation(google.maps.Animation.DROP)
      }
      marker.setMap(map);               
      markers.push(marker)
      $("#listResto").append(transformDom(restaurants[restaurants.length-1].name,stars));
      newComment();
      $("#myModal-pushRestaurant").modal("hide")
      $("#formAddRestaurants")[0].reset()  
    } else {
      alert ("Veuillez remplir les champs: 'Nom de restaurant', 'Adresse'")       
    }          
  })
}
/**
 * Filter compared to the average restaurant
 * @param {object} map Is map of API google
 * @returns {object} Show restaurant included in the filter
 */
function filterByAverage(map){
  $( "#slider-range" ).slider({
    range: true,
    min: 0,
    max: 5,
    values: [ 0, 5 ],
    slide: function( event, ui ) {
      $("#averageMin").val(ui.values[ 0 ]);
      $("#averageMax").val(ui.values[ 1 ]);
      $("#listResto").html(""); 
      for (let i=0; i < markers.length; i++){ 
        let bounds = map.getBounds()            
        if (bounds.contains(markers[i].getPosition()) && restaurants[i].average >= ui.values[0] && restaurants[i].average <= ui.values[1]){          
          if(screen.width > 768){
          markers[i].setAnimation(google.maps.Animation.DROP)
          }
          $("#listResto").append(transformDom(restaurants[i].name,restaurants[i].average))
          markers[i].setMap(map);
        } else {
          markers[i].setMap(null)
        }
      };
      newComment();              
    }
  });
  $("#averageMin").val($("#slider-range").slider("values", 0 ));
  $("#averageMax").val($("#slider-range").slider("values", 1 ));
}
/**
 * Add restaurant by API Googleplaces
 * @param {object} map Is map of API google
 * @returns {object} Add a restaurant to the array restaurants
 */
function addRestaurantByGoogle(map){
  let bounds = map.getBounds()
  let request = {
    bounds: bounds,
    type: ['restaurant']
  };
  service = new google.maps.places.PlacesService(map);
  service.nearbySearch(request, function(results) {
    if(results != null) {      
      results.forEach(restaurant => {
        let option = {
          placeId: restaurant.place_id,
          fields: ['place_id','name','formatted_address','geometry','rating','reviews']
        }
        service.getDetails(option, function(data){
          if(data != null){
            let newRestaurant = new Object()
            let rating = new Object()
            newRestaurant.restaurantName = data.name;
            newRestaurant.average = data.rating;
            newRestaurant.id = data.place_id
            newRestaurant.address = data.formatted_address;
            newRestaurant.lat = data.geometry.location.lat();
            newRestaurant.long = data.geometry.location.lng();                                      
            let marker = new google.maps.Marker({ 
              position: {lat: data.geometry.location.lat(), lng: data.geometry.location.lng()}, 
              title: data.name, 
              icon: `${iconBase}icon55.png`,
            });
            if(screen.width > 768){
              marker.setAnimation(google.maps.Animation.DROP)
            }              
            marker.setMap(map);
            if (restaurants.findIndex(element => element.id === newRestaurant.id) === -1){  
              markers.push(marker)
              const allRestaurant = new Restaurant(newRestaurant.id, newRestaurant.restaurantName, newRestaurant.address, newRestaurant.lat, newRestaurant.long, newRestaurant.average)          
              restaurants.push(allRestaurant);
              if (data.reviews != undefined){
                data.reviews.forEach(comment => {                  
                  rating.stars = comment.rating
                  rating.comment = comment.text
                  allRestaurant.addRating(rating.comment, rating.stars)               
                })
              }
              $("#listResto").append(transformDom(restaurants[restaurants.length-1].name,restaurants[restaurants.length-1].average));
              newComment() 
            }                       
          }
        })
      });
    } 
  })
}
/**
 * Filter according to the visibility of the restaurants on the map
 * @param {object} map Is map of API google
 * @returns {object} Show resteraurant visible on the map
 */
function filterByMap(map){
  let bounds = map.getBounds()
  let averageMin = ($("#slider-range").slider("values", 0 ))
  let averageMax = ($("#slider-range").slider("values", 1 ))
  $("#listResto").html("");
  for (let i=0; i < markers.length; i++){        
    if (bounds.contains(markers[i].getPosition()) && restaurants[i].average >= averageMin && restaurants[i].average <= averageMax){          
        if(screen.width > 768){
        markers[i].setAnimation(google.maps.Animation.DROP)
        } 
        $("#listResto").append(transformDom(restaurants[i].name,restaurants[i].average))
        markers[i].setMap(map);
    } else {
        markers[i].setMap(null)
    }
  }
  newComment()
}


  
 



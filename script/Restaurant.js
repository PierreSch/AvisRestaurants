class Restaurant {
  constructor (id, name, address, lat, long, average) {
    this.id = id;
    this.name = name;
    this.address = address;
    this.lat = lat;
    this.long = long;
    this.average = average;
    this.rating = [];
  }
  addRating(comment, stars){
    this.rating.push(new Rating(comment, stars))
  }
  calculAverage(element){
    let allStars = 0;
    element.rating.forEach( star => {
      allStars += star.stars ;
    })
    let average = allStars / element.rating.length;
    allStars = 0;
    element.average = average
    return average
  };
}







declare var google: any;
import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';

/*
	Generated class for the GooglePlacesProvider provider.

	See https://angular.io/docs/ts/latest/guide/dependency-injection.html
	for more info on providers and Angular DI.
*/
@Injectable()
export class GooglePlacesProvider {

	service: any;

	constructor(public http: Http, private geolocation: Geolocation) {
	}

	getPlace(map, distance) {
		return new Promise(resolve => {
			var place;
			this.service;
			var location = map.getCenter();
			var request = {
				location: location,
				radius: distance * 1609.34, //only uses it as a bias not a restriction
				type: ['restaurant'],
				keyword: ["food"]
			}
			this.service = new google.maps.places.PlacesService(map);
			this.service.nearbySearch(request, (results, status) => {
				if(status == google.maps.places.PlacesServiceStatus.OK) {
					var places = new Array();
					for (var i = 0; i < results.length; i++) {
						//limit radius again
					  if (google.maps.geometry.spherical.computeDistanceBetween(results[i].geometry.location, location) < request.radius) {
						 places.push(results[i]);
					  }
					}
					place = places[Math.floor(Math.random()*places.length)];
					resolve(this.getPlaceDetails(place));
				}
			})
		})
	}

	getPlaceDetails(place){
		console.log(place);
		return new Promise(resolve => {
			this.service.getDetails({placeId: place.place_id}, (location, status) => {
				if(status === google.maps.places.PlacesServiceStatus.OK) {
					resolve(location);
				}
			})
		})
	}

}

import { Component, ViewChild, Renderer, trigger, state, style, transition, animate } from '@angular/core';
import { NavController, AlertController, Platform } from 'ionic-angular';
import { GooglePlacesProvider } from '../../providers/google-places/google-places';
import { Geolocation } from '@ionic-native/geolocation';

declare var google: any;

@Component({
	selector: 'page-home',
	templateUrl: 'home.html',
	animations: [
		trigger('flip', [
			state('flipped', style({
			  transform: 'rotate(180deg)',
			  backgroundColor: 'rgba(255,255,255, 0.5)',
			  opacity: 0
			})),
			transition('* => flipped', animate('500ms ease'))
		 ])
	]
})
export class HomePage {
	
	markers: any = new Array();
	photoCount: number = 0;
	place: any;
	map: any;
	infoWindow: any;
	showMap: boolean = true;
	distance: number = 25;
	flipState: String = 'notFlipped';
	fadeInOutState: String = 'out';
	@ViewChild('mapContainer') mapContainer;
	@ViewChild('foodImage') foodImage;
	@ViewChild('photo') photo;
	
	constructor(public platform: Platform, public navCtrl: NavController, 
		public alertCtrl: AlertController, 
		public googlePlacesProvider: GooglePlacesProvider,
		public renderer: Renderer,
		private geolocation: Geolocation) {
		
	}

	ngAfterViewInit(){
		this.initializeMap();
	}

	initializeMap(){
		this.map = new google.maps.Map(this.mapContainer.nativeElement, {
			center: {lat: -34.397, lng: 150.644},
			zoom: 13
		});
		this.geolocation.getCurrentPosition
		this.infoWindow = new google.maps.InfoWindow;
		if(this.platform.is('cordova')){
			this.geolocation.getCurrentPosition().then((resp) => {
				var pos = {
					lat: resp.coords.latitude,
					lng: resp.coords.longitude
				};
				this.map.setCenter(pos);
			   }).catch((error) => {
					let alert = this.alertCtrl.create({
						title: 'Error',
						subTitle: 'Geolocation failed: ' + error
					})
			   });
		}
		else if(navigator.geolocation){
			navigator.geolocation.getCurrentPosition((position) => {
				var pos = {
					lat: position.coords.latitude,
					lng: position.coords.longitude
				};
				// this.infoWindow.setPosition(pos);
				// this.infoWindow.setContent('Location found.');
				// this.infoWindow.open(this.map);
				this.map.setCenter(pos);
			}, (error) => {
				let alert = this.alertCtrl.create({
					title: 'Error',
					subTitle: 'Geolocation failed: ' + error
				});
				alert.present();
			})
		}
	}

	getPlace(){
		this.googlePlacesProvider.getPlace(this.map, this.distance)
			.then(data => {
				console.log(data);
				this.place = data;
				this.placeMarker(data);
			})
	}

	placeMarker(place){
		this.showMap = false;
		setTimeout(()=> {
			google.maps.event.trigger(this.map, 'resize');
			var marker = new google.maps.Marker({
				map: this.map,
				position: place.geometry.location
			});
			this.markers.push(marker);
			this.map.setCenter(place.geometry.location);
			var content = 
				"<div class=\"bold\">" + place.name + "</div><br>" + 
				place.adr_address + " <a href=\"" + place.url + "\" target=\"_blank\"><i class=\"fa fa-location-arrow\" aria-hidden=\"true\"></i></a>" +
				"<br><div>" + place.formatted_phone_number + "</div><br>" +
				"<div>Rating: " + place.rating + "</div><br>" +
				"<a href=\"" + place.website + "\" target='_blank'>" + place.website + "</a>";
			google.maps.event.addListener(marker, 'click', () => {
				this.infoWindow.setContent(content);
				this.infoWindow.setPosition(place.geometry.location);
				this.infoWindow.open(this.map);
			})
		}, 0)
	}

	toggleFlip(){
		this.flipState = (this.flipState == 'notFlipped') ? 'flipped' : 'notFlipped';
	}

	resetLocation(){
		// Clear previous markers
		for(var i = 0; i < this.markers.length; i++){
			this.markers[i].setMap(null);
		}
		this.markers.length = 0;
		if(this.platform.is('cordova')){
			this.geolocation.getCurrentPosition().then((resp) => {
				var pos = {
					lat: resp.coords.latitude,
					lng: resp.coords.longitude
				};
				this.map.setCenter(pos);
			   }).catch((error) => {
					let alert = this.alertCtrl.create({
						title: 'Error',
						subTitle: 'Geolocation failed: ' + error
					})
			   });
		}
		else if(navigator.geolocation){
			navigator.geolocation.getCurrentPosition((position) => {
				var pos = {
					lat: position.coords.latitude,
					lng: position.coords.longitude
				};
				// this.infoWindow.setPosition(pos);
				// this.infoWindow.setContent('Location found.');
				// this.infoWindow.open(this.map);
				this.map.setCenter(pos);
			}, () => {
				let alert = this.alertCtrl.create({
					title: 'Error',
					subTitle: 'Geolocation failed'
				})
				alert.present();
			})
		}
	}

	prevPhoto(){
		this.photoCount--;
		this.photo.nativeElement.src= this.place.photos[this.photoCount].getUrl({maxWidth: 250, maxHeight: 250});
	}

	nextPhoto(){
		this.photoCount++;
		this.photo.nativeElement.src= this.place.photos[this.photoCount].getUrl({maxWidth: 250, maxHeight: 250});
	}

}

import {GoogleMapsAPIWrapper} from '@agm/core/services/google-maps-api-wrapper';
import { Directive, Input, OnInit} from '@angular/core';
declare const google: any;

@Directive({selector: 'sebm-google-map-directions'})
export class RoutePlannerDirective implements OnInit {
  @Input('origin') origin: string;
  @Input('destination') destination: string;
  constructor (private gmapsApi: GoogleMapsAPIWrapper) {}
  ngOnInit() {
    this.gmapsApi.getNativeMap().then(map => {
      const directionsService = new google.maps.DirectionsService;
      const directionsDisplay = new google.maps.DirectionsRenderer;
      directionsDisplay.setMap(map);
      directionsService.route({
        origin: this.origin,
        destination: this.destination,
        waypoints: [],
        optimizeWaypoints: true,
        travelMode: 'DRIVING'
      }, function(response, status) {
        if (status === 'OK') {
          directionsDisplay.setDirections(response);
        } else {
          window.alert('Directions request failed due to ' + status);
        }
      });
    });
  }
}

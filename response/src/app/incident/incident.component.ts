import { Component, ViewChild, ChangeDetectorRef, OnInit } from '@angular/core';
import { DirectionsRenderer } from '@ngui/map';
import { AngularFirestore } from "angularfire2/firestore";
import { Observable } from 'rxjs/Observable';
import { ActivatedRoute } from "@angular/router";
import { AngularFireDatabase, AngularFireList } from "angularfire2/database";
import { Org } from "../org/org.component";
import { AuthService } from "../auth.service";
import { DrawingManager } from '@ngui/map';

@Component({
  selector: 'app-incident',
  templateUrl: './incident.component.html',
  styleUrls: ['./incident.component.css']
})
export class IncidentComponent implements OnInit {

  colors = {police: '#1E90FF',
            firedept: '#b30000',
            paramedics: '#999900',
            lifeguard: '#009900'};

  // Name and start point of the map
  title: string = 'My first AGM project';
  @ViewChild(DirectionsRenderer) directionsRendererDirective: DirectionsRenderer;
  autocomplete: any;
  address: any = {};
  center: any;
  d = false;
  directionsEnabled = false;
  directionsRenderer: google.maps.DirectionsRenderer;
  directionsResult: google.maps.DirectionsResult;
  direction: any = {
    origin: '',
    destination: '',
    travelMode: 'DRIVING'};

  mapOptions = {
    zoom: 14,
    mapTypeId: 'roadmap'
  };

  placeSearch;
  componentForm = {
    street_number: 'short_name',
    route: 'long_name',
    locality: 'long_name',
    administrative_area_level_1: 'short_name',
    country: 'long_name',
    postal_code: 'short_name'
  };

  mapInfo: any = {};
  currentPos: string;

  itemsRef: AngularFireList<any>;
  items: Observable<any[]>;
  id: any;
  incident: any;
  org: Observable<Org>;

  polygonsHandler: Observable<any>;
  circlesHandler: Observable<any>;
  squaresHandler: Observable<any>;
  selectedOverlay: any;
  @ViewChild(DrawingManager) drawingManager: DrawingManager;

  // DONT REALLY USE THESE NOT ASYNC SO NOT ALWAYS GOING TO GET THEM
  userInfo;
  orgInfo;

  markersHandler: Observable<any>;

  userPos: any = [];
  userID: any;
  userPicURL: any;

  myLocation: any;

  realTimePosition: any;

  markers;
  polygons;
  circles;
  currentPinText = '';
  currentTeamPin = {name:''};

  deletePoly;

  dco = {
  position: 2,
  drawingModes: ['marker', 'circle', 'polygon']
  };
  constructor(private route: ActivatedRoute, public db: AngularFireDatabase, private afs: AngularFirestore, public auth: AuthService,
              private cdr: ChangeDetectorRef) { }

  ngOnInit() {
    this.id = this.route.snapshot.paramMap.get('id'); // Use for specific keys later

    this.auth.user.subscribe(user => {
      this.userInfo = user;
      this.userID = user.uid;
      this.userPicURL = user.photoURL;
      console.log(user)
      this.myLocation = this.db.object('incidents/' + this.id + '/locations/' + user.uid);

    });

    setInterval(() => {
      this.getCurrentPos(); }, 1000);


    // let rtl = this.db.list('incidents/' + this.id + '/locations');
    // this.realTimePosition = rtl.valueChanges().subscribe(res => console.log(res));

    this.incident = this.db.object('incidents/' + this.id );
    this.incident.valueChanges().subscribe(doc => {
      this.org = this.afs.doc('org/' + doc.orgId).valueChanges();
      this.org.subscribe( res =>{ this.orgInfo = res;})
    });

    this.polygons = this.db.list('incidents/' + this.id + '/polygons');
    // this.polygonsHandler = polygons.valueChanges();
    this.polygonsHandler = this.polygons.snapshotChanges().map(changes => {
      return changes.map(c => ({ key: c.payload.key, ...c.payload.val() }));
    });
    this.polygonsHandler.subscribe( res => {console.log(res)});
    this.markers = this.db.list('incidents/' + this.id + '/markers');
    this.markersHandler = this.markers.snapshotChanges().map(changes => {
      return changes.map(c => ({ key: c.payload.key, ...c.payload.val() }));
    });

    this.circles = this.db.list('incidents/' + this.id + '/circles');
    this.circlesHandler = this.circles.snapshotChanges().map(changes => {
      return changes.map(c => ({ key: c.payload.key, ...c.payload.val() }));
    });

    const squares = this.db.list('incidents/' + this.id + '/squares');
    this.squaresHandler = squares.valueChanges();


    this.drawingManager['initialized$'].subscribe(dm => {
      google.maps.event.addListener(dm, 'overlaycomplete', event => {
        if (event.type === google.maps.drawing.OverlayType.POLYGON) {
          dm.setDrawingMode(null);
            this.selectedOverlay = event.overlay;
            this.selectedOverlay.setEditable(true);
            console.log(event.overlay.getPath().getArray());
            let points = [];
            event.overlay.getPath().getArray().forEach(point => {
              points.push({lat :  point.lat(), lng : point.lng()});
            });
            const newPoly = { points :points, color: this.colors[this.userInfo.OrgIds['nO2epGylHwK2A8CZK614']] };
            this.polygons.push(newPoly);
          this.selectedOverlay = event.overlay;
        }else if(event.type === google.maps.drawing.OverlayType.CIRCLE){
          dm.setDrawingMode(null);
            this.selectedOverlay = event.overlay;
            this.selectedOverlay.setEditable(true);
            console.log(event);

          let newCircle = {
            center: {lat: event.overlay.center.lat(), lng: event.overlay.center.lng()},
            radius: event.overlay.getRadius(),
            color: this.colors[this.userInfo.OrgIds['nO2epGylHwK2A8CZK614']]
          };
            this.circles.push(newCircle);
        }else if(event.type === google.maps.drawing.OverlayType.RECTANGLE) {
          dm.setDrawingMode(null);
            this.selectedOverlay = event.overlay;
            this.selectedOverlay.setEditable(true);
            console.log(event.overlay);
            let points = [];
            event.overlay.getPath().getArray().forEach(point => {
              points.push({lat :  point.lat(), lng : point.lng()});
            });
            let newPoly = { points :points, color: this.colors[this.userInfo.OrgIds['nO2epGylHwK2A8CZK614']] };
            this.polygons.push(newPoly);
        } else if (event.type === google.maps.drawing.OverlayType.MARKER) {
          dm.setDrawingMode(null);
              console.log(event);

          if(this.currentTeamPin.name == ''){
            this.currentTeamPin.name = 'paramedics'
          }
          if(this.currentPinText == ''){
            this.currentPinText = 'A person is seriously harmed';
          }
          let newPin = {description: this.currentPinText, team: this.currentTeamPin, pos:[event.overlay.position.lat(), event.overlay.position.lng()]};

          this.markers.push(newPin);
        }

        event.overlay.setMap(null);
        delete event.overlay;
      });
    });

      this.directionsRendererDirective['initialized$'].subscribe( directionsRenderer => {
        this.directionsRenderer = directionsRenderer;
      });
  }

  directionsChanged() {
    this.directionsResult = this.directionsRenderer.getDirections();
    this.cdr.detectChanges();
  }

  showDirection() {
    this.direction.origin = this.userPos[0].toString() + ", " + this.userPos[1].toString();
    console.log(this.direction);
    this.directionsRendererDirective['showDirections'](this.direction);
  }

  quickAddPin(team, quick) {
    this.currentPinText = quick;
    this.currentTeamPin = team;
  }

  initialized(autocomplete: any) {
    this.autocomplete = autocomplete;
  }
  placeChanged(place) {
    this.center = place.geometry.location;
    for (let i = 0; i < place.address_components.length; i++) {
      let addressType = place.address_components[i].types[0];
      this.address[addressType] = place.address_components[i].long_name;
    }
    this.cdr.detectChanges();
  }

  getCurrentPos() {
    // Try HTML5 geolocation.
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(position => {
        let pos = [
          position.coords.latitude,
          position.coords.longitude
        ];
        this.userPos = [
          position.coords.latitude,
          position.coords.longitude
        ];
        // this.myLocation.update({pos:pos,image:this.userPicURL});

        return pos;
      }, function() {
        console.log('dad is mad at mom');
      });
    } else {
      // Browser doesn't support Geolocation
      console.log('dad doesnt have internet');
    }
  }

  shape: number;

  setPolygon(poly) {
    this.deletePoly = poly;
    this.shape = 0;
  }

  setCircle(poly) {
    this.deletePoly = poly;
    this.shape = 1;
    console.log(poly);
  }

  setMarker(poly) {
    this.deletePoly = poly;
    this.shape = 2;
  }

  deletePolygon() {
    console.log(this.deletePoly);
    switch (this.shape) {
      case 0: {
        if(this.deletePoly.color != '#95a5a6'){
          this.polygons.update(this.deletePoly.key, { color: '#95a5a6' });
        }else{
          this.polygons.remove(this.deletePoly.key);
        }
        this.deletePoly = null;
        break;
      }
      case 1: {
        if(this.deletePoly.color != '#95a5a6'){
          this.circles.update(this.deletePoly.key, { color: '#95a5a6' });
        }else{
          this.circles.remove(this.deletePoly.key);
        }
        this.deletePoly = null;
        break;
      }
      case 2: {
        this.markers.remove(this.deletePoly.key);
        this.deletePoly = null;
        break;
      }
    }
  }

  clicked({target: marker}) {

    marker.nguiMapComponent.openInfoWindow('iw', marker);
  }

  clearDirection () {
    this.directionsRenderer.set('directions', null);
  }
}

// pin Interface
interface Marker {
  lat: any;
  lng: any;
  label?: string;
  draggable: boolean;
}

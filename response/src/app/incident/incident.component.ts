import { Component, ViewChild, ChangeDetectorRef, OnInit } from '@angular/core';
import { DirectionsRenderer } from '@ngui/map';
import {AngularFirestore} from "angularfire2/firestore";
import {Observable} from 'rxjs/Observable';
import {ActivatedRoute} from "@angular/router";
import {AngularFireDatabase, AngularFireList} from "angularfire2/database";
import {Org} from "../org/org.component";
import {AuthService} from "../auth.service";
import { DrawingManager } from '@ngui/map';

@Component({
  selector: 'app-incident',
  templateUrl: './incident.component.html',
  styleUrls: ['./incident.component.css']
})
export class IncidentComponent implements OnInit {
  // Name and start point of the map
  title: string = 'My first AGM project';
  @ViewChild(DirectionsRenderer) directionsRendererDirective: DirectionsRenderer;

  directionsEnabled = false;
  directionsRenderer: google.maps.DirectionsRenderer;
  directionsResult: google.maps.DirectionsResult;
  direction: any = {
    origin: 'penn station, new york, ny',
    destination: '260 Broadway New York NY 10007',
    travelMode: 'WALKING'};

  mapOptions = {
    zoom: 14,
    mapTypeId: 'roadmap'
  };

  mapInfo: any = {};

  currentPos: string;

  itemsRef: AngularFireList<any>;
  items: Observable<any[]>;

  id;

  incident;
  org: Observable<Org>;

  polygonsHandler: Observable<any>;
  markersHandler: Observable<any>;

  selectedOverlay: any;
  @ViewChild(DrawingManager) drawingManager: DrawingManager;

  constructor(private route: ActivatedRoute, public db: AngularFireDatabase, private afs: AngularFirestore, public auth: AuthService,
              private cdr: ChangeDetectorRef) { }

  ngOnInit() {
    this.id = this.route.snapshot.paramMap.get('id');
    this.itemsRef = this.db.list('incidents/' + this.id + '/markers');
    this.items = this.itemsRef.snapshotChanges().map(changes => {
      return changes.map(c => ({ key: c.payload.key, ...c.payload.val() }));
    });

    this.incident = this.db.object('incidents/' + this.id );
    this.incident.valueChanges().subscribe(doc => {
      this.org = this.afs.doc('org/' + doc.orgId).valueChanges();
    });

    let polygons = this.db.list('incidents/' + this.id + '/polygons');
    this.polygonsHandler = polygons.valueChanges();
    //   .map(changes => {
    //   return changes.map(c => (
    //     {points: [[c.payload.val().points]]})
    //   );
    // });
    // let markers = this.db.list('incidents/' + this.id + '/markers');
    // this.markersHandler = markers.valueChanges();

    this.polygonsHandler.subscribe(res =>
    {console.log(res)} );

    this.drawingManager['initialized$'].subscribe(dm => {
      google.maps.event.addListener(dm, 'overlaycomplete', event => {
        if (event.type !== google.maps.drawing.OverlayType.MARKER) {
          dm.setDrawingMode(null);
          google.maps.event.addListener(event.overlay, 'click', e => {
            this.selectedOverlay = event.overlay;
            this.selectedOverlay.setEditable(true);
            console.log(event.overlay.getPath().getArray());
            let points = [];
            event.overlay.getPath().getArray().forEach(point => {
              points.push({lat :  point.lat(), lng : point.lng()})
            });
            let newPoly = { points :points };
            polygons.push(newPoly);
          });
          this.selectedOverlay = event.overlay;
        } else if(event.type === google.maps.drawing.OverlayType.MARKER) {
          dm.setDrawingMode();
        }
      });
    });



    if (this.directionsEnabled) {
      this.directionsRendererDirective['initialized$'].subscribe( directionsRenderer => {
        this.directionsRenderer = directionsRenderer;
      });
    }
  }

  directionsChanged() {
    this.directionsResult = this.directionsRenderer.getDirections();
    this.cdr.detectChanges();
  }

  showDirection() {
    this.directionsRendererDirective['showDirections'](this.direction);
  }

  mapClicked($event: any) {
    this.addItem({lat: $event.coords.lat, lng: $event.coords.lng, draggable: true});
  }


  addItem(marker: Marker) {
    this.itemsRef.push({Marker: marker});
  }
}

// pin Interface
interface Marker {
  lat: any;
  lng: any;
  label?: string;
  draggable: boolean;
}

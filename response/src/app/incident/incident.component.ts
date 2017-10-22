import { Component, OnInit, Input, ViewChild } from '@angular/core';
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
  lat: number = 51.678418;
  lng: number = 7.809007;
  origin: string = '75 9th Ave, New York, NY';
  destination: string = '715 Wedgewood Dr. Marysville, OH';

  itemsRef: AngularFireList<any>;
  items: Observable<any[]>;

  id;

  incident;
  org: Observable<Org>;

  selectedOverlay: any;
  @ViewChild(DrawingManager) drawingManager: DrawingManager;

  constructor(private route: ActivatedRoute, public db: AngularFireDatabase, private afs: AngularFirestore, public auth: AuthService) { }

  ngOnInit() {
    this.id = this.route.snapshot.paramMap.get('id'); //Use for specific keys later
    this.itemsRef = this.db.list('incidents/' + this.id + '/markers');
    this.items = this.itemsRef.snapshotChanges().map(changes => {
      return changes.map(c => ({ key: c.payload.key, ...c.payload.val() }));
    });

    this.incident = this.db.object('incidents/' + this.id );
    this.incident.valueChanges().subscribe(doc => {
      this.org = this.afs.doc('org/' + doc.orgId).valueChanges();

    });

    let polygons = this.db.list('incidents/' + this.id + '/polygons');



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
              points.push([point.lat(), point.lng()])
            });
            let newPoly = { points : points};
            polygons.push(newPoly);
          });
          this.selectedOverlay = event.overlay;
        }
      });
    });
  }

  onMapClick($event) {
    console.log($event);
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

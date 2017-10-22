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

  colors = {police:'#1E90FF',
            firedept:'#b30000',
            paramedics:'#999900',
            lifeguard:'#009900'};

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

  polygonsHandler: Observable<any>;
  circlesHandler: Observable<any>;
  squaresHandler: Observable<any>;
  selectedOverlay: any;
  @ViewChild(DrawingManager) drawingManager: DrawingManager;

  //DONT REALLY USE THESE NOT ASYNC SO NOT ALWAYS GOING TO GET THEM
  userInfo;
  orgInfo;
  constructor(private route: ActivatedRoute, public db: AngularFireDatabase, private afs: AngularFirestore, public auth: AuthService) { }

  ngOnInit() {
    this.auth.user.subscribe(user => this.userInfo = user);

    this.id = this.route.snapshot.paramMap.get('id'); //Use for specific keys later
    this.itemsRef = this.db.list('incidents/' + this.id + '/markers');
    this.items = this.itemsRef.snapshotChanges().map(changes => {
      return changes.map(c => ({ key: c.payload.key, ...c.payload.val() }));
    });

    this.incident = this.db.object('incidents/' + this.id );
    this.incident.valueChanges().subscribe(doc => {
      this.org = this.afs.doc('org/' + doc.orgId).valueChanges();
      this.org.subscribe( res =>{ this.orgInfo = res;})
    });



    let polygons = this.db.list('incidents/' + this.id + '/polygons');
    this.polygonsHandler = polygons.valueChanges();
    this.polygonsHandler.subscribe(res =>
    {console.log(res)} );

    let circles = this.db.list('incidents/' + this.id + '/circles');
    this.circlesHandler = circles.valueChanges();

    let squares = this.db.list('incidents/' + this.id + '/squares');
    this.squaresHandler = squares.valueChanges();

    this.drawingManager['initialized$'].subscribe(dm => {
      google.maps.event.addListener(dm, 'overlaycomplete', event => {
        if (event.type == google.maps.drawing.OverlayType.POLYGON) {
          dm.setDrawingMode(null);
            this.selectedOverlay = event.overlay;
            this.selectedOverlay.setEditable(true);
            console.log(event.overlay.getPath().getArray());
            let points = [];
            event.overlay.getPath().getArray().forEach(point => {
              points.push({lat :  point.lat(), lng : point.lng()})
            });

            let newPoly = { points :points, color: this.colors[this.userInfo.OrgIds['nO2epGylHwK2A8CZK614']] };
            polygons.push(newPoly);
          this.selectedOverlay = event.overlay;
        }else if(event.type == google.maps.drawing.OverlayType.CIRCLE){
          dm.setDrawingMode(null);
            this.selectedOverlay = event.overlay;
            this.selectedOverlay.setEditable(true);
            console.log(event);

          let newCircle = {
            center: {lat: event.overlay.center.lat(), lng: event.overlay.center.lng()},
            radius: event.overlay.getRadius(),
            color: this.colors[this.userInfo.OrgIds['nO2epGylHwK2A8CZK614']]
          };
            circles.push(newCircle);
        }else if(event.type == google.maps.drawing.OverlayType.RECTANGLE){
          dm.setDrawingMode(null);
            this.selectedOverlay = event.overlay;
            this.selectedOverlay.setEditable(true);
            console.log(event.overlay.getPath().getArray());
            let points = [];
            event.overlay.getPath().getArray().forEach(point => {
              points.push({lat :  point.lat(), lng : point.lng()})
            });
            let newPoly = { points :points, color: this.colors[this.userInfo.OrgIds['nO2epGylHwK2A8CZK614']] };
            polygons.push(newPoly);
        }
      });
    });

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

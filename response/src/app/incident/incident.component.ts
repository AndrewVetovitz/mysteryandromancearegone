import { Component, OnInit, Input } from '@angular/core';
import { AngularFirestore } from "angularfire2/firestore";
import { Observable } from 'rxjs/Observable';
import { ActivatedRoute } from "@angular/router";
import { AngularFireDatabase, AngularFireList } from "angularfire2/database";
import { GoogleMapsAPIWrapper } from "@agm/core";

@Component({
  selector: 'app-incident',
  templateUrl: './incident.component.html',
  styleUrls: ['./incident.component.css']
})
export class IncidentComponent implements OnInit {
  // mode
  mode: number;
  paths: any;

  // Name and start point of the map
  title: string = 'My first AGM project';
  lat: number = 51.678418;
  lng: number = 7.809007;
  origin: string = '75 9th Ave, New York, NY';
  destination: string = '715 Wedgewood Dr. Marysville, OH';

  itemsRef: AngularFireList<any>;
  items: Observable<any[]>;

  map: any;
  drawingManager: any;

  id: any;

  constructor(private route: ActivatedRoute, public db: AngularFireDatabase, private afs: AngularFirestore, private gmapi: GoogleMapsAPIWrapper) {
    this.mode = 0;
  }

  ngOnInit() {
    this.id = this.route.snapshot.paramMap.get('id'); //Use for specific keys later
    this.itemsRef = this.db.list('incidents/' + this.id + '/markers');
    this.items = this.itemsRef.snapshotChanges().map(changes => {
      return changes.map(c => ({ key: c.payload.key, ...c.payload.val() }));
    });

    this.gmapi.getNativeMap().then(map => {
      this.drawingManager = new google.maps.drawing.DrawingManager({
        drawingMode: google.maps.drawing.OverlayType.POLYGON,
        drawingControl: true,
        drawingControlOptions: {
          position: google.maps.ControlPosition.TOP_CENTER,
          drawingModes: ['polygon']
        }
      });
    });

    this.drawingManager.setMap(this.map);
    google.maps.event.addListener(this.drawingManager, 'overlaycomplete', (event) => {
      // Polygon drawn
      if (event.type === google.maps.drawing.OverlayType.POLYGON) {
        //this is the coordinate, you can assign it to a variable or pass into another function.
        alert(event.overlay.getPath().getArray());
      }
    });
  }





  mapClicked($event: any) {
    let point = {lat: $event.coords.lat, lng: $event.coords.lng, draggable: true};

    switch(this.mode) {
      case 0: {
        this.addItem(point);
      }
      case 1: {
        if(this.paths[this.paths.length - 1].length === 0){
          this.paths[this.paths.length - 1].push(point);
          this.paths[this.paths.length - 1].push(point);
        } else {
          this.paths[this.paths.length - 1].splice(this.paths[this.paths.length - 1].length - 1, 0, point);
        }

        console.log(this.paths);
      }
    }
  }


  addItem(marker: Marker) {
    this.itemsRef.push({Marker: marker});
  }


  setPins(){
    this.mode = 0;
    console.log("pins");
  }

  setDraw(){
    this.mode = 1;
    console.log("draw");
    this.paths.push([]);
  }
}

// pin Interface
interface Marker {
  lat: any;
  lng: any;
  label?: string;
  draggable: boolean;
}

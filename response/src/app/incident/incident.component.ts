import { Component, OnInit, Input } from '@angular/core';
import { AngularFirestore } from "angularfire2/firestore";
import { Observable } from 'rxjs/Observable';
import { ActivatedRoute } from "@angular/router";
import { AngularFireDatabase, AngularFireList } from "angularfire2/database";

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

  constructor(private route: ActivatedRoute, public db: AngularFireDatabase, private afs: AngularFirestore) {
    this.mode = 0;
  }

  ngOnInit() {
    // let id = this.route.snapshot.paramMap.get('id'); Use for specific keys later
    this.itemsRef = this.db.list('incidents/markers');
    this.items = this.itemsRef.snapshotChanges().map(changes => {
      return changes.map(c => ({ key: c.payload.key, ...c.payload.val() }));
    });

    this.paths = [[
       { lat: 0,  lng: 10 },
       { lat: 0,  lng: 20 },
       { lat: 10, lng: 20 },
       { lat: 10, lng: 10 },
       { lat: 0,  lng: 10 }
      ]]
  }

  mapClicked($event: any) {
    switch(this.mode) {
      case 0: {
        this.addItem({lat: $event.coords.lat, lng: $event.coords.lng, draggable: true});
      }
      case 1: {
        this.paths[this.paths.length - 1].push({lat: $event.coords.lat, lng: $event.coords.lng});
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

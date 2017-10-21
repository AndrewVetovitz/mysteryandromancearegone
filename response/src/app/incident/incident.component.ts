import { Component, OnInit } from '@angular/core';
import {AngularFirestore} from "angularfire2/firestore";
import {Observable} from 'rxjs/Observable';
import {ActivatedRoute} from "@angular/router";
import {AngularFireDatabase, AngularFireList} from "angularfire2/database";

@Component({
  selector: 'app-incident',
  templateUrl: './incident.component.html',
  styleUrls: ['./incident.component.css']
})
export class IncidentComponent implements OnInit {
  title: string = 'My first AGM project';
  latitude: number = 51.673858;
  longitude: number = 7.815982;

  itemsRef: AngularFireList<any>;
  items: Observable<any[]>;

  constructor(private route: ActivatedRoute, public db: AngularFireDatabase, private afs: AngularFirestore) { }

  ngOnInit() {
    let id = this.route.snapshot.paramMap.get('id');
    this.itemsRef = this.db.list('incidents/markers');
    console.log(this.itemsRef);
    this.items = this.itemsRef.snapshotChanges().map(changes => {
      let test = changes.map(c => ({ key: c.payload.key, ...c.payload.val() }));
      console.log(test);
      return test;
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

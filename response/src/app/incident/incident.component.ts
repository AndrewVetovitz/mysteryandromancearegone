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
  constructor(private route: ActivatedRoute, public db: AngularFireDatabase, private afs: AngularFirestore) {}

  ngOnInit() {
    this.id = this.route.snapshot.paramMap.get('id'); //Use for specific keys later
    this.itemsRef = this.db.list('incidents/' + this.id + '/markers');
    this.items = this.itemsRef.snapshotChanges().map(changes => {
      return changes.map(c => ({key: c.payload.key, ...c.payload.val()}));
    });
  }
}

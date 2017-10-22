import { Component, OnInit, Input } from '@angular/core';
import {AngularFirestore} from "angularfire2/firestore";
import {Observable} from 'rxjs/Observable';
import {ActivatedRoute} from "@angular/router";
import {AngularFireDatabase, AngularFireList} from "angularfire2/database";
import {Org} from "../org/org.component";
import {AuthService} from "../auth.service";

@Component({
  selector: 'app-incident',
  templateUrl: './incident.component.html',
  styleUrls: ['./incident.component.css']
})
export class IncidentComponent implements OnInit {
  // Name and start point of the map
  title: string = 'My first AGM project';
  origin: string = '75 9th Ave, New York, NY';
  destination: string = '715 Wedgewood Dr. Marysville, OH';

  itemsRef: AngularFireList<any>;
  items: Observable<any[]>;

  markers: any = [];

  id;

  incident;
  org: Observable<Org>;

  constructor(private route: ActivatedRoute, public db: AngularFireDatabase, private afs: AngularFirestore, public auth: AuthService) { }

  ngOnInit() {
    this.id = this.route.snapshot.paramMap.get('id'); //Use for specific keys later
    this.itemsRef = this.db.list('incidents/' + this.id + '/markers');
    this.items = this.itemsRef.snapshotChanges().map(changes => {
      let t = changes.map(c => ({ key: c.payload.key, ...c.payload.val() }));
      this.markers.push([0,0]);
      this.markers.push([70,70]);
      return t;
    });



    // this.incident = this.db.object('incidents/' + this.id );
    // this.incident.valueChanges().subscribe(doc => {
    //   this.org = this.afs.doc('org/' + doc.orgId).valueChanges();
    // })
  }

  onClick($event) {
    this.addItem($event);
  }

  addItem($event: any) {
    this.itemsRef.push({latitude: $event.fa.x, longitude: $event.fa.y, draggable: true});
  }
}

// pin Interface
interface Marker {
  latitude: any;
  longitude: any;
  label?: string;
  draggable: boolean;
}

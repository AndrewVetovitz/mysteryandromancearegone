import {Component, OnInit} from '@angular/core';
import {AngularFirestore, AngularFirestoreDocument, AngularFirestoreCollection} from 'angularfire2/firestore';
import {Observable, BehaviorSubject} from 'rxjs';
import {AngularFireDatabase, AngularFireList, AngularFireAction} from 'angularfire2/database';
import {AuthService, User} from '../auth.service';
import {ActivatedRoute} from '@angular/router';
import * as firebase from 'firebase/app';

export interface Org {
  name: string;
  teams: Team[];
  users: any;
}

export interface Team {
  name: string;
  premadePins: string[];
}
@Component({
  selector: 'app-org',
  templateUrl: './org.component.html',
  styleUrls: ['./org.component.css']
})
export class OrgComponent implements OnInit {

  id;
  orgRef: AngularFirestoreDocument<Org>;
  org: Observable<Org>;
  users: Observable<any[]>;
  teams = <any>[];
  newMemberEmail = '';
  newTeamName = '';
  newPin = '';
  addPinIndex = -1;
  orgCopy;

  incidents;
  incidentsRef;
  newIncident = '';

  constructor(public auth: AuthService, private afs: AngularFirestore, private route: ActivatedRoute, public db: AngularFireDatabase) {
  }

  ngOnInit() {
    this.id = this.route.snapshot.paramMap.get('id');

    let size = new BehaviorSubject(null);

    this.incidents = size.switchMap(size =>
      this.db.list('/incidents',  ref => ref.orderByChild('orgId').equalTo(this.id)
      ).snapshotChanges()
    );

    this.orgRef = this.afs.doc<Org>('org/' + this.id);
    this.org = this.orgRef.valueChanges();
    this.org.subscribe(res => { console.log(res); this.orgCopy = res; this.teams = res.teams});
    let usersQ = this.afs.collection('users', ref => ref.where('OrgIds.' + this.id,'>=',''));
    this.users = usersQ.snapshotChanges().map(actions => {
      return actions.map(a => {
        const data = a.payload.doc.data();
        const id = a.payload.doc.id;
        console.log(data);
        return {id, data };
      });
    });

    this.incidentsRef = this.db.list('incidents');
    // let incidents = this.db.list('incidents', ref => ref.orderByChild('orgId').equalTo(this.id));
    // this.incidents = incidents.snapshotChanges();
  }


  addMember() {
    // let user = this.afs.collection('users', ref => ref.where('uid','==',this.newMemberEmail).limit(1));
    // user.update({OrgIds[this.org.uid] : true})
  }

  addTeam(name: string) {
    this.orgCopy.teams.push({name: name, premadePins: []});
    this.orgRef.update(this.orgCopy).then( r => {this.newTeamName = '';});
  }

  addPin(text: string, index: number) {
    this.orgCopy.teams[index].premadePins.push(text);
    this.orgRef.update(this.orgCopy);
  }

  addIncident() {
    this.incidentsRef.push({name: this.newIncident, orgId: this.id}).then((item) => {
      this.newIncident = '';
    })
  }

}

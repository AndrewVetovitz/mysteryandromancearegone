import {Component, OnInit} from '@angular/core';
import {AngularFirestore, AngularFirestoreDocument, AngularFirestoreCollection} from "angularfire2/firestore";
import {Observable} from "rxjs";
import {AngularFireDatabase, AngularFireList} from "angularfire2/database";
import {AuthService, User} from "../auth.service";
import {ActivatedRoute} from "@angular/router";

export interface Org {

}
@Component({
  selector: 'app-org',
  templateUrl: './org.component.html',
  styleUrls: ['./org.component.css']
})
export class OrgComponent implements OnInit {

  orgRef: AngularFirestoreDocument<Org>;
  org: Observable<Org>;
  users: Observable<any[]>;

  newMemberEmail = '';

  constructor(public auth: AuthService, private afs: AngularFirestore, private route: ActivatedRoute) {
  }

  ngOnInit() {
    let id = this.route.snapshot.paramMap.get('id');
    this.orgRef = this.afs.doc<Org>('org/' + id);
    this.org = this.orgRef.valueChanges();
    let usersQ = this.afs.collection('users', ref => ref.where('OrgIds.' + id,'==',true));
    this.users = usersQ.snapshotChanges().map(actions => {
      return actions.map(a => {
        const data = a.payload.doc.data();
        const id = a.payload.doc.id;
        console.log(data);
        return {id, data };
      });
    });
  }


  addMember(){
    let user = this.afs.collection('users', ref => ref.where('uid','==',this.newMemberEmail).limit(1));
    // user.update({OrgIds[this.org.uid] : true})
  }

}

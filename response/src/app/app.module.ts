import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { AngularFireModule } from 'angularfire2';
import { AngularFirestoreModule } from 'angularfire2/firestore';
import { AngularFireAuthModule } from 'angularfire2/auth';
import { AngularFireDatabaseModule } from 'angularfire2/database';
import { environment } from '../environments/environment';
import { AgmCoreModule } from '@agm/core';
import { AppComponent } from './app.component';
import { RouterModule, Routes } from '@angular/router';
import { OrgComponent } from './org/org.component';
import { ProfileComponent } from './profile/profile.component';
import { IncidentComponent } from './incident/incident.component';
import { AuthService } from './auth.service';

const routes: Routes = [
  {
    path: 'org/:id',
    component: OrgComponent,
  },
  {
    path: 'profile',
    component: ProfileComponent
  },
  {
    path: 'incident/:id',
    component: IncidentComponent
  },
  {
    path: '**',
    component: ProfileComponent
  }
];

// Angular Material Modules
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatSidenavModule, MatIconModule, MatButtonModule, MatListModule, MatInputModule, MatDialogModule, MatCardModule, MatSelectModule } from '@angular/material';

@NgModule({
  declarations: [
    AppComponent,
    OrgComponent,
    ProfileComponent,
    IncidentComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    RouterModule.forRoot(routes),
    AngularFireModule.initializeApp(environment.firebase), // imports firebase/app needed for everything
    AngularFirestoreModule, // imports firebase/firestore, only needed for database features
    AngularFireAuthModule, // imports firebase/auth, only needed for auth features
    AngularFireDatabaseModule,
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyCfR8zGUSeNFqXyjupxcLNAMJDXTmxZBq0'
    }),
    BrowserAnimationsModule,
    MatSidenavModule,
    MatIconModule,
    MatButtonModule,
    MatListModule,
    MatInputModule,
    MatDialogModule,
    MatCardModule,
    MatSelectModule
  ],
  providers: [AuthService],
  bootstrap: [AppComponent]
})
export class AppModule { }

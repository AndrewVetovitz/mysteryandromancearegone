import { Component } from '@angular/core';
import { AuthService } from './auth.service';
import { trigger, state, style, transition, animate } from '@angular/animations';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  animations: [
    trigger('myAwesomeAnimation', [
      state('default', style({ transform: 'rotate(0)' })),
      state('rotated', style({ transform: 'rotate(-180deg)' })),
      transition('rotated => default', animate('200ms ease-out')),
      transition('default => rotated', animate('200ms ease-in'))
    ]),
  ]
})
export class AppComponent {
  constructor(public auth: AuthService) { }

  state: string = 'default';

  rotate() {
    this.state = (this.state === 'default' ? 'rotated' : 'default');
  }

}



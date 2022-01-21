import { Component } from '@angular/core';

@Component({
  selector: 'demo-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title: string = 'demo';
  globeImage: string = 'https://www.solarsystemscope.com/textures/download/2k_earth_daymap.jpg';
  secondsPerRotation: string = '40s';
  withShadow: boolean = true;
}

import { Component, OnInit, Input, AfterViewInit } from '@angular/core';
import { trigger, state, style, animate, transition, keyframes } from '@angular/animations';

export const spinningGlobeAnimation = trigger('spin', [
  state('in', style({})),
  state('out', style({})),
  transition('in => out', animate('{{ time }}', keyframes([
    style({ backgroundPosition: '0 0', offset: 0.0 }),
    style({ backgroundPosition: '360px 0', offset: 1.0 })
  ]))),
  transition('out => in', animate('{{ time }}', keyframes([
    style({ backgroundPosition: '0 0', offset: 0.0 }),
    style({ backgroundPosition: '360px 0', offset: 1.0 })
  ])))
]);

@Component({
  selector: 'cc-turning-globe',
  templateUrl: './turning-globe.component.html',
  styleUrls: ['./turning-globe.component.scss'],
  animations: [
    spinningGlobeAnimation
   ]
})
export class ChiChiTurningGlobeComponent implements OnInit, AfterViewInit  {

  state: string = 'in';
  @Input() globeImage: string;
  @Input() height: string;
  @Input() width: string;
  @Input() withShadow: boolean = false;
  @Input() secondsPerRotation: string = '5s';

  constructor() { }

  ngOnInit() {
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.state = 'out';
    }, 0);
  }

  onEnd(event) {
    this.state = 'in';
    if (event.toState === 'in') {
      setTimeout(() => {
        this.state = 'out';
      }, 0);
    }
  }
}

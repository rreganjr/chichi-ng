import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'cc-turning-globe',
  templateUrl: './turning-globe.component.html',
  styleUrls: ['./turning-globe.component.css']
})
export class ChiChiTurningGlobeComponent implements OnInit {

  @Input() globeImage: string;
  @Input() height: string;
  @Input() width: string;

  constructor() { }

  ngOnInit() {
  }

}

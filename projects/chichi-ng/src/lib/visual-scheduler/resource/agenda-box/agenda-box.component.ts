import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'cc-agenda-box',
  templateUrl: './agenda-box.component.html',
  styleUrls: ['./agenda-box.component.scss']
})
export class AgendaBoxComponent implements OnInit {

  @Input() showLabels: boolean = false;
  @Input() channels: string[] = [];

  constructor() { }

  ngOnInit(): void {
  }

}

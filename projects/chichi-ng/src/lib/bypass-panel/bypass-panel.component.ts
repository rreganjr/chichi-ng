import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'cc-bypass-panel',
  templateUrl: './bypass-panel.component.html',
  styleUrls: ['./bypass-panel.component.scss']
})
export class ChiChiBypassPanelComponent implements OnInit {

  @Input() rightPanelActive: boolean;

  constructor() { }

  ngOnInit() {
  }
}

import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'cc-bypass-panel',
  templateUrl: './bypass-panel.component.html',
  styleUrls: ['./bypass-panel.component.scss']
})
export class BypassPanelComponent implements OnInit {

  @Input() rightPanelActive: boolean = true;

  constructor() { }

  ngOnInit(): void {
  }

}

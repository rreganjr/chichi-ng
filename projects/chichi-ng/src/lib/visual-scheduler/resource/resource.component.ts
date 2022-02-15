import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'cc-resource',
  templateUrl: './resource.component.html',
  styleUrls: ['./resource.component.scss']
})
export class ResourceComponent implements OnInit {

  @Input() label!: String;

  constructor() { }

  ngOnInit(): void {
  }

}

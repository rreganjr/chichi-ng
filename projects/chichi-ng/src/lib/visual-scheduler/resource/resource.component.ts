import { AfterContentInit, Component, ContentChild, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AgendaBoxComponent } from './agenda-box/agenda-box.component';

@Component({
  selector: 'cc-resource',
  templateUrl: './resource.component.html',
  styleUrls: ['./resource.component.scss']
})
export class ResourceComponent implements OnInit, AfterContentInit {
  
  public showHourLabel: boolean = false;

  constructor(private elementRef: ElementRef) { }

  ngOnInit(): void {
  }

  ngAfterContentInit(): void {
    if (this.elementRef.nativeElement.children.length === 1) {
      this.showHourLabel = true;
    }
  }
}

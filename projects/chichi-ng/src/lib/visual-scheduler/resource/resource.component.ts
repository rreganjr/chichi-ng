import { AfterContentInit, Component, ContentChild, ElementRef, Input, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'cc-resource',
  templateUrl: './resource.component.html',
  styleUrls: ['./resource.component.scss']
})
export class ResourceComponent implements OnInit, AfterContentInit {
  
  @Input() resourceName!: string;
  @Input() channels: string[] = [];

  private _showLabels: boolean = false;

  constructor(private elementRef: ElementRef) { }

  ngOnInit(): void {
  }

  ngAfterContentInit(): void {
    if (this.elementRef.nativeElement.children.length === 1) {
      this._showLabels = true;
    }
  }

  public get showLabels(): boolean {
    return this._showLabels;
  }
}

import { AfterContentInit, Component, ElementRef, Input, OnInit } from '@angular/core';

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
    // a resource should only have one element if it is the builtin resource that
    // holds the labeled timeline, this turns on the labels. 
    if (this.elementRef.nativeElement.children.length === 1) {
      this._showLabels = true;
    }
  }

  public get showLabels(): boolean {
    return this._showLabels;
  }
}

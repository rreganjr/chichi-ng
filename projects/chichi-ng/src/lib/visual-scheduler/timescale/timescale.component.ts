import { Component, Input, OnInit } from '@angular/core';
import { Timescale } from '../timescale.model';
import { VisualSchedulerService } from '../visual-scheduler.service';

@Component({
  selector: 'cc-timescale',
  templateUrl: './timescale.component.html',
  styleUrls: ['./timescale.component.scss'],
  providers: [VisualSchedulerService]
})
export class TimescaleComponent implements OnInit {

  public _timescale!: Timescale;

  constructor(
    private visualSchedulerService: VisualSchedulerService
    ) { 
      this.visualSchedulerService.getTimescale$().subscribe( (timescale: Timescale) => {
          this._timescale = timescale;
      });
    }

  ngOnInit(): void {
  }

  public zoomIn(): void {
    this.visualSchedulerService.setTimeScaleVisibleHours(this._timescale.visibleHours / 2); 
  }

  public zoomOut(): void {
    this.visualSchedulerService.setTimeScaleVisibleHours(this._timescale.visibleHours * 2);
  }

  public scanBack(): void {
    if (this._timescale.offsetHours > 0) {
        this.visualSchedulerService.setTimeScaleOffsetHours(this._timescale.offsetHours - this._timescale.visibleHours);
    }
  }

  public scanForward(): void {
    if (this._timescale.offsetHours < this._timescale.boundsInterval.end.hour) {
        this.visualSchedulerService.setTimeScaleOffsetHours(this._timescale.offsetHours + this._timescale.visibleHours);
    }
  }

  public get visibleHours(): number {
    return this._timescale.visibleHours;
  }
  
  public setVisibleHours(visibleHours: number): void {
    this.visualSchedulerService.setTimeScaleVisibleHours(visibleHours);
  }
}

import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Timescale } from '../timescale.model';
import { VisualSchedulerService } from '../visual-scheduler.service';

@Component({
  selector: 'cc-timescale',
  templateUrl: './timescale.component.html',
  styleUrls: ['./timescale.component.scss'],
})
export class TimescaleComponent implements OnInit, OnDestroy {

  private _timescaleSubscription?: Subscription;
  public _timescale!: Timescale;

  constructor(
    private visualSchedulerService: VisualSchedulerService
    ) {}

  ngOnInit(): void {
    this._timescaleSubscription = this.visualSchedulerService.getTimescale$().subscribe( (timescale: Timescale) => {
      console.log(`timescale changed`, timescale);
      this._timescale = timescale;
    });
  }

  ngOnDestroy(): void {
    if (this._timescaleSubscription) {
      this._timescaleSubscription.unsubscribe();
      this._timescaleSubscription = undefined;
    }
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

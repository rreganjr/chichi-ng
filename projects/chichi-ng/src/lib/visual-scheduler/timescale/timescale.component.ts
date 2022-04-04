import { Component, OnDestroy, OnInit } from '@angular/core';
import { Duration } from 'luxon';
import { Subscription } from 'rxjs';
import { Timescale } from '../timescale.model';
import { VisualSchedulerService } from '../visual-scheduler.service';

/**
 * View controls for the scheduler, zoom in and out and pan forward and backward in time
 * over the bounds.
 */
@Component({
  selector: 'cc-timescale',
  templateUrl: './timescale.component.html',
  styleUrls: ['./timescale.component.scss'],
})
export class TimescaleComponent implements OnInit, OnDestroy {

  public static readonly FOUR_DAYS_IN_HOURS: number = 4*24;
  public static readonly WEEK_IN_HOURS: number = 7*24;

  private _timescaleSubscription?: Subscription;
  public _timescale!: Timescale;

  constructor(
    private _visualSchedulerService: VisualSchedulerService
    ) {}

  ngOnInit(): void {
    this._timescaleSubscription = this._visualSchedulerService.getTimescale$().subscribe( (timescale: Timescale) => {
      console.log(`timescale changed: start=${timescale.boundsInterval.start} end=${timescale.boundsInterval.end} visible=${timescale.visibleDuration.as('hours')}-hours offset=${timescale.offsetDuration.as('hours')}-hours`, timescale);
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
    if (this._timescale.visibleDuration.hours === TimescaleComponent.WEEK_IN_HOURS) {
      this._visualSchedulerService.setTimeScaleVisibleHours(TimescaleComponent.FOUR_DAYS_IN_HOURS);
    } else {
      this._visualSchedulerService.setTimeScaleVisibleHours(this._timescale.visibleDuration.hours / 2); 
    }
  }

  public zoomOut(): void {
    if (this._timescale.visibleDuration.hours === TimescaleComponent.FOUR_DAYS_IN_HOURS) {
      this._visualSchedulerService.setTimeScaleVisibleHours(TimescaleComponent.WEEK_IN_HOURS);
    } else {
      this._visualSchedulerService.setTimeScaleVisibleHours(this._timescale.visibleDuration.hours * 2);
    }
  }

  public scanToStart(): void {
    this._visualSchedulerService.setTimeScaleOffsetHours(0);
  }

  public scanBack(): void {
    if (this._timescale.offsetDuration.hours > 0) {
      if (this._timescale.offsetDuration.minus(this._timescale.visibleDuration).hours > 0) {
        this._visualSchedulerService.setTimeScaleOffsetHours(this._timescale.offsetDuration.minus(this._timescale.visibleDuration).hours);
      } else {
        this.scanToStart();
      }
    }
  }

  public scanForward(): void {
    if (this._timescale.offsetDuration > (this._timescale.boundsInterval.toDuration("hours").minus(this._timescale.visibleDuration))) {
        this.scanToEnd();
    } else {
      this._visualSchedulerService.setTimeScaleOffsetHours(this._timescale.offsetDuration.hours + this._timescale.visibleDuration.hours);
    }
  }

  public scanToEnd(): void {
    this._visualSchedulerService.setTimeScaleOffsetHours(this._timescale.boundsInterval.toDuration("hours").hours - this._timescale.visibleDuration.hours);
  }

  public get visibleHours(): Duration {
    return this._timescale.visibleDuration;
  }
  
  public setVisibleHours(visibleHours: number): void {
    this._visualSchedulerService.setTimeScaleVisibleHours(visibleHours);
  }

  public get offsetHours(): Duration {
    return this._timescale.offsetDuration;
  }

  public setOffsetHours(offsetHours: number): void {
    this._visualSchedulerService.setTimeScaleOffsetHours(offsetHours);
  }
}

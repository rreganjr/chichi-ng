import { Component, OnDestroy, OnInit } from '@angular/core';
import { Duration } from 'luxon';
import { Subscription } from 'rxjs';
import { Timescale } from '../timescale.model';
import { VisualSchedulerService } from '../visual-scheduler.service';

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
    if (this._timescale.visibleDuration.hours === TimescaleComponent.WEEK_IN_HOURS) {
      this.visualSchedulerService.setTimeScaleVisibleHours(TimescaleComponent.FOUR_DAYS_IN_HOURS);
    } else {
      this.visualSchedulerService.setTimeScaleVisibleHours(this._timescale.visibleDuration.hours / 2); 
    }
  }

  public zoomOut(): void {
    if (this._timescale.visibleDuration.hours === TimescaleComponent.FOUR_DAYS_IN_HOURS) {
      this.visualSchedulerService.setTimeScaleVisibleHours(TimescaleComponent.WEEK_IN_HOURS);
    } else {
      this.visualSchedulerService.setTimeScaleVisibleHours(this._timescale.visibleDuration.hours * 2);
    }
  }

  public scanToStart(): void {
    console.log(`scanToStart: this._timescale.boundsInterval.toDuration("hours").hours = ${this._timescale.boundsInterval.toDuration("hours").hours}  this._timescale.visibleHours=${this._timescale.visibleDuration}`)
    this.visualSchedulerService.setTimeScaleOffsetHours(0);
  }

  public scanBack(): void {
    console.log(`scanBack: this._timescale.boundsInterval.toDuration("hours").hours = ${this._timescale.boundsInterval.toDuration("hours").hours}  this._timescale.visibleHours=${this._timescale.visibleDuration}`)
    if (this._timescale.offsetDuration.hours > 0) {
      if (this._timescale.offsetDuration.minus(this._timescale.visibleDuration).hours > 0) {
        this.visualSchedulerService.setTimeScaleOffsetHours(this._timescale.offsetDuration.minus(this._timescale.visibleDuration).hours);
      } else {
        this.scanToStart();
      }
    }
  }

  public scanForward(): void {
    console.log(`scanForward: this._timescale.boundsInterval.toDuration("hours").hours = ${this._timescale.boundsInterval.toDuration("hours").hours}  this._timescale.visibleHours=${this._timescale.visibleDuration}`)
    if (this._timescale.offsetDuration > (this._timescale.boundsInterval.toDuration("hours").minus(this._timescale.visibleDuration))) {
        this.scanToEnd();
    } else {
      this.visualSchedulerService.setTimeScaleOffsetHours(this._timescale.offsetDuration.hours + this._timescale.visibleDuration.hours);
    }
  }

  public scanToEnd(): void {
    console.log(`scanToEnd: this._timescale.boundsInterval.toDuration("hours").hours = ${this._timescale.boundsInterval.toDuration("hours").hours}  this._timescale.visibleHours=${this._timescale.visibleDuration}`)
    this.visualSchedulerService.setTimeScaleOffsetHours(this._timescale.boundsInterval.toDuration("hours").hours - this._timescale.visibleDuration.hours);
  }

  public get visibleHours(): Duration {
    return this._timescale.visibleDuration;
  }
  
  public setVisibleHours(visibleHours: number): void {
    this.visualSchedulerService.setTimeScaleVisibleHours(visibleHours);
  }

  public get offsetHours(): Duration {
    return this._timescale.offsetDuration;
  }

  public setOffsetHours(offsetHours: number): void {
    this.visualSchedulerService.setTimeScaleOffsetHours(offsetHours);
  }
}

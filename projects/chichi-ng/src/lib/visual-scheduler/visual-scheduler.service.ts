import { Injectable } from '@angular/core';
import { Observable, ReplaySubject } from 'rxjs';
import { Interval } from 'luxon';
import { Timescale } from './timescale.model';

@Injectable({
  providedIn: null
})
export class VisualSchedulerService {

  private _timescale = new Timescale(
    Interval.fromDateTimes(new Date(), new Date(new Date().getTime() + 24 * 60 * 60 * 1000)),
    12,
    0
  );

  private timescaleSubject: ReplaySubject<Timescale> = new ReplaySubject(1);

  constructor() {
    this.timescaleSubject.next(this._timescale);
  }

  public getTimescale$(): Observable<Timescale> {
    return this.timescaleSubject.asObservable();
  }

  /**
   * The min and max date/time of schedules
   * @param interval the start date and time to the end date and time
   */
  public setBoundsInterval(interval: Interval) {
    this._timescale = new Timescale(interval, this._timescale.visibleHours, this._timescale.offsetHours);
    this.timescaleSubject.next(this._timescale);
  }

  /**
   * Shift the viewport (visible hours) to the offset from the start time.
   * NOTE: this is the absolute position from the start, not adding to the current offset.
   * 
   * @param offsetHours - the hours from the bounds start time to the start of the visible hours
   */
  public setTimeScaleOffsetHours(offsetHours: number) {
    if (offsetHours >= 0) {
      offsetHours = Math.round(offsetHours);
      if (offsetHours > this._timescale.boundsInterval.end.hour - this._timescale.visibleHours) {
        offsetHours = this._timescale.boundsInterval.end.hour - this._timescale.visibleHours;
      }
      this._timescale = new Timescale(this._timescale.boundsInterval, this._timescale.visibleHours, offsetHours);
      this.timescaleSubject.next(this._timescale);  
    }
  }

  /**
   * Set the viewport of the schedule to the specificed number of hours
   * @param visibleHours - The size of what is visible in hours, minimum = 1 hour maximum = 7 days
   */
  public setTimeScaleVisibleHours(visibleHours: number) {
    visibleHours = Math.round(visibleHours);
    if (visibleHours > 0 && visibleHours <= 7 * 24) {
      this._timescale = new Timescale(this._timescale.boundsInterval, visibleHours, this._timescale.offsetHours);
      this.timescaleSubject.next(this._timescale);
    }
  }
}

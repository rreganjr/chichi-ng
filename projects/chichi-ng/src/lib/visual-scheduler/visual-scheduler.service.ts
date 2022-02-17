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

  public setBoundsInterval(interval: Interval) {
    this._timescale = new Timescale(interval, this._timescale.visibleHours, this._timescale.offsetHours);
    this.timescaleSubject.next(this._timescale);
  }

  public setTimeScaleOffsetHours(offsetHours: number) {
    offsetHours = Math.round(offsetHours);
    if (offsetHours >= 0 && offsetHours <= this._timescale.boundsInterval.end.hour - this._timescale.visibleHours) {
      this._timescale = new Timescale(this._timescale.boundsInterval, this._timescale.visibleHours, offsetHours);
      this.timescaleSubject.next(this._timescale);
    }
  }

  public setTimeScaleVisibleHours(visibleHours: number) {
    visibleHours = Math.round(visibleHours);
    if (visibleHours > 0 && visibleHours <= 7 * 24) {
      this._timescale = new Timescale(this._timescale.boundsInterval, visibleHours, this._timescale.offsetHours);
      this.timescaleSubject.next(this._timescale);
    }
  }
}

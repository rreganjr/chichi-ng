import { Injectable } from '@angular/core';
import { Observable, ReplaySubject } from 'rxjs';
import { Interval } from 'luxon';

@Injectable({
  providedIn: null
})
export class VisualSchedulerService {

  /**
   * The min and max date range in the visual scheduler
   */
  private boundsIntervalSubject: ReplaySubject<Interval> = new ReplaySubject(1);

  /**
   * The number of hours visible in the scheduler
   */
  private timeScaleVisibleHoursSubject: ReplaySubject<number> = new ReplaySubject(1);

  /**
   * The number of hours from the start of the bounds to what is visible, i.e. the point of time at the start of the visible hours
   */
  private timeScaleOffsetHoursSubject: ReplaySubject<number> = new ReplaySubject(1);

  constructor() { }

  public getBoundsInterval$(): Observable<Interval> {
    return this.boundsIntervalSubject.asObservable();
  }

  public setBoundsInterval(interval: Interval) {
    this.boundsIntervalSubject.next(interval);
  }

  public getTimeScaleOffsestHours$(): Observable<number> {
    return this.timeScaleOffsetHoursSubject.asObservable();
  }

  public setTimeScaleOffsetHours(offsetHours: number) {
    if (offsetHours > 0) {
      this.timeScaleOffsetHoursSubject.next(offsetHours);
    }
  }

  public getTimeScaleVisibleHours$(): Observable<number> {
    return this.timeScaleVisibleHoursSubject.asObservable();
  }

  public setTimeScaleVisibleHours(visibleHours: number) {
    this.timeScaleVisibleHoursSubject.next(visibleHours);
  }
}

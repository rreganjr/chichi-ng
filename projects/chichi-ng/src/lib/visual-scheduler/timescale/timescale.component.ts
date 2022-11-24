import { Component, OnDestroy, OnInit } from '@angular/core';
import { Duration, Interval } from 'luxon';
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

  public static readonly VIEWPORT_SIZES: Duration[] = [
    Duration.fromDurationLike({hours: 3}),
    Duration.fromDurationLike({hours: 6}),
    Duration.fromDurationLike({hours: 12}),
    Duration.fromDurationLike({days: 1}),
    Duration.fromDurationLike({days: 2}),
    Duration.fromDurationLike({days: 4}),
    Duration.fromDurationLike({weeks: 1})
  ];

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

  public get timescaleSizes(): Duration[] {
    return TimescaleComponent.VIEWPORT_SIZES;
  }

  public zoomIn(): void {
    const sizes = TimescaleComponent.VIEWPORT_SIZES;
    let index = sizes.indexOf(this._timescale.visibleDuration);
    if (index < 0) {
      index = 0;
    } else if (index  > 0) {
      index--;
    }
    this._visualSchedulerService.setViewportDuration(sizes[index]);
  }

  public zoomTo(index: number): void {
    const sizes = TimescaleComponent.VIEWPORT_SIZES;
    if (index >= 0 && index < sizes.length) {
      this._visualSchedulerService.setViewportDuration(sizes[index]);
    }
  }

  public zoomOut(): void {
    const sizes = TimescaleComponent.VIEWPORT_SIZES;
    let index = sizes.indexOf(this._timescale.visibleDuration);
    if (index > sizes.length - 1) {
      index = sizes.length - 1;
    } else if (index < sizes.length - 1) {
      index++;
    }
    this._visualSchedulerService.setViewportDuration(sizes[index]);
  }

  public scanToStart(): void {
    console.log(`scanToStart()`)
    this._visualSchedulerService.setViewportOffsetDuration(Duration.fromDurationLike({hours: 0}));
  }

  public scanBack(): void {
    console.log(`scanBack()`)
    if (this._timescale.offsetDuration.minus(this._timescale.visibleDuration).as('seconds') > 0) {
      console.log(`scanBack() by ${this._timescale.visibleDuration.as('seconds')} seconds`)
      this._visualSchedulerService.setViewportOffsetDuration(this._timescale.offsetDuration.minus(this._timescale.visibleDuration));
    } else {
      this.scanToStart();
    }
  }

  /**
   * Move the visibleDuration forward in time by setting the offsetDuration to the current offsetDuration plus
   * the visibleDuration period such that the end of the visibleDuration period is not greater than the end of
   * the scheduler bounds.
   */
  public scanForward(): void {

    if (this._timescale.visibleBounds.end.plus(this._timescale.visibleDuration) > this._timescale.boundsInterval.end) {
        this.scanToEnd();
    } else {
      this._visualSchedulerService.setViewportOffsetDuration(this._timescale.offsetDuration.plus(this._timescale.visibleDuration));
    }
  }

  public scanToEnd(): void {
    const offset:Duration = Interval.fromDateTimes(this._timescale.boundsInterval.start,
      this._timescale.boundsInterval.end.minus(this._timescale.visibleDuration)).toDuration();
    this._visualSchedulerService.setViewportOffsetDuration(offset);
  }

  public get viewportDuration(): Duration {
    return this._timescale.visibleDuration;
  }

  public set viewportDuration(duration: Duration) {
    this._visualSchedulerService.setViewportDuration(duration);
  }

  public get viewportOffset(): Duration {
    return this._timescale.offsetDuration;
  }

  public set viewportOffset(offset: Duration) {
    this._visualSchedulerService.setViewportOffsetDuration(offset);
  }
}

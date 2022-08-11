import { Component, ElementRef, Input, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { DateTime, DateTimeFormatOptions, Duration, Interval } from 'luxon';
import { Subscription } from 'rxjs';
import { Timescale } from '../../../timescale.model';
import { VisualSchedulerService } from '../../../visual-scheduler.service';

@Component({
  selector: 'cc-timeline',
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.scss']
})
export class TimelineComponent implements OnInit, OnDestroy {

  private _timescaleSubscription?: Subscription;
  private _timescale!: Timescale;
  private _dateFormatOptions: DateTimeFormatOptions | undefined = {dateStyle: 'short'};
  private _timeFormatOptions: DateTimeFormatOptions | undefined = {timeStyle: 'short'};

  @Input() showLabels: boolean = false;

  constructor(
    private visualSchedulerService: VisualSchedulerService,
    private renderer: Renderer2,
    private timelineElement: ElementRef
  ) { }

  ngOnInit(): void {
    this._timescaleSubscription = this.visualSchedulerService.getTimescale$().subscribe((timescale: Timescale) => {
      this._timescale = timescale;
      this.draw();
    });
  }

  ngOnDestroy(): void {
    if (this._timescaleSubscription) {
      this._timescaleSubscription.unsubscribe();
      this._timescaleSubscription = undefined;
    }
  }

  /**
   * @returns the percent width of each time division in the timeline for the current timescale.
   */
  private get timeDivisionWidth(): string {
    return (this.betweenTicksDuration.as('seconds') / this._timescale.visibleDuration.as('seconds')) * 100  + '%';
  }

  /**
   * @returns the {@link Duration} between the primary or labeled tick marks in the timeline.
   */
  private get primaryTicksDuration(): Duration {
    const visibleHours = this._timescale.visibleDuration.as('hours');
    if (visibleHours < 24) {
      return Duration.fromDurationLike({hours: 1});
    } else if (visibleHours < 2*24) {
      return Duration.fromDurationLike({hours: 2});
    } else if (visibleHours < 5*24) {
      return Duration.fromDurationLike({hours: 6});
    } else if (visibleHours < 7*24) {
      return Duration.fromDurationLike({hours: 12});
    } else {
      return Duration.fromDurationLike({days: 1});
    }
  }

  /**
   * @returns the {@link Duration} between the previous primary or subordinate tick marks in the timeline.
   */
  private get betweenTicksDuration(): Duration {
    const visibleHours = this._timescale.visibleDuration.as('hours');
    if (visibleHours < 12) {
      return Duration.fromDurationLike({minutes: 5});
    } else if (visibleHours < 24) {
      return Duration.fromDurationLike({minutes: 15});
    } else if (visibleHours < 3*24) {
      return Duration.fromDurationLike({minutes: 30});
    } else if (visibleHours < 5*24) {
      return Duration.fromDurationLike({hours: 3});
    } else {
      return Duration.fromDurationLike({hours: 6});
    }
  }

  /**
   * Adds a div element to the timeline containing the tick elements indicating times and days.
   */
  private draw(): void {
    if (this.timelineElement !== undefined) {
      // clean-up previous elements
      for (const child of this.timelineElement.nativeElement.children) {
        this.renderer.removeChild(this.timelineElement.nativeElement, child);
      }

      const startTick: DateTime = this._timescale.startOfVisibleTimeline;
      const lastTick: DateTime = this._timescale.endOfVisibleTimeline;
      const primaryTicksDuration: Duration = this.primaryTicksDuration;
      const betweenTicksDuration: Duration = this.betweenTicksDuration;

      const outOfBoundsStart: HTMLDivElement|undefined = this.makeOutOfBoundsElement('start');
      if (outOfBoundsStart) {
        console.log('adding outOfBoundsStart');
        this.renderer.appendChild(this.timelineElement.nativeElement, outOfBoundsStart);
      } else {
        console.log('no outOfBoundsStart');
      }

      // add the tick marks that are visible
      for (let primaryTick: DateTime = startTick; primaryTick < lastTick; primaryTick = primaryTick.plus(primaryTicksDuration)) {
        this.renderer.appendChild(this.timelineElement.nativeElement, this.makePrimaryTickElement(primaryTick));
        const nextPrimaryTick:DateTime = primaryTick.plus(primaryTicksDuration);
        for (let betweenTick: DateTime = primaryTick.plus(betweenTicksDuration); betweenTick < nextPrimaryTick; betweenTick = betweenTick.plus(betweenTicksDuration)) {
          // draw the inbetween marks, if one of these falls on the start of a day, add a primary mark instead
          if (betweenTick.hour === 0 && betweenTick.minute === 0) {
            this.renderer.appendChild(this.timelineElement.nativeElement, this.makePrimaryTickElement(betweenTick));
          } else {
            this.renderer.appendChild(this.timelineElement.nativeElement, this.makeBetweenTickElement(betweenTick));
          }
        }
      }
      const outOfBoundsEnd: HTMLDivElement|undefined = this.makeOutOfBoundsElement('end');
      if (outOfBoundsEnd) {
        console.log('adding outOfBoundsEnd');
        this.renderer.appendChild(this.timelineElement.nativeElement, outOfBoundsEnd);
      } else {
        console.log('no outOfBoundsEnd');
      }
    }
  }

  /**
   *
   * @param dateTime the {@link DateTime} represented by this tick mark
   * @returns an {@link HTMLDivElement} representing the tick mark via its width and css class smallTick or mediumTick for hours
   */
  private makeBetweenTickElement(dateTime: DateTime): HTMLDivElement {
    const element: HTMLDivElement = this.renderer.createElement('div');
    element.style.width = this.timeDivisionWidth;
    element.className = (dateTime.minute === 0) ? 'mediumTick' : 'smallTick';
    return element;
  }

  /**
   *
   * @param dateTime the {@link DateTime} represented by this tick mark used for labeling
   * @returns an {@link HTMLDivElement} representing the tick mark via its width and css class day or primaryTick, and may contain a label
   */
  private makePrimaryTickElement(dateTime: DateTime): HTMLDivElement {
    const element: HTMLDivElement = this.renderer.createElement('div');
    element.style.width = this.timeDivisionWidth;
    element.className = (dateTime.hour === 0) ? 'day' : 'primaryTick';
    if (this.showLabels) {
      this.renderer.appendChild(element, (dateTime.hour === 0) ? this.makeDayLabel(dateTime) : this.makeTimeLabel(dateTime));
    }
    return element;
  }

  /**
   * A timeline begins on the start of the hour or day creating an area at the start and end of the time line that are not in the timescale bounds.
   * This element demarks the time durations that aren't schedulable.
   * @param location - which end of the timeline being marked
   * @returns an {@link HTMLDivElement} representing the area at the start or end of the timeline that isn't part of the time bounds
   */
  private makeOutOfBoundsElement(location: 'start'|'end'): HTMLDivElement|undefined {
    const outOfBoundsInterval = (location === 'start' ? this._timescale.outOfBoundsStartInterval : this._timescale.outOfBoundsEndInterval);
    console.log(`outOfBoundsInterval location=${location} start = ${outOfBoundsInterval.start} end = ${outOfBoundsInterval.end}`);
    // calculate the intersection of the out of bounds interval to the visible duration interval
    const visibleOutOfBounds: Interval|null = this._timescale.visibleTimelineBounds.intersection(outOfBoundsInterval);
    if (visibleOutOfBounds?.toDuration('second')?.as('seconds') || 0 > 0) {
      const element: HTMLDivElement = this.renderer.createElement('div');
      if (location === 'start') {
        element.style.left = '0';
      } else {
        element.style.right = '0';
      }
      element.style.width = (outOfBoundsInterval.toDuration('seconds').as('seconds') / this._timescale.visibleTimelineBounds.toDuration('seconds').as('seconds')) * 100  + '%';
      element.className =  'outOfBounds';
      return element;
    }
    return;
  }

  /**
   *
   * @param dateTime the {@link DateTime} used to generate the label for the time
   * @returns an {@link HTMLDivElement} div element containing the time label
   */
  private makeTimeLabel(dateTime: DateTime): HTMLDivElement {
    const element: HTMLDivElement = this.renderer.createElement('div');
    element.textContent = dateTime.toLocaleString(this._timeFormatOptions);
    element.className = 'time-label';
    return element;
  }

  /**
   * 
   * @param dateTime the {@link DateTime} used to generate the label for the day
   * @returns an {@link HTMLDivElement} div element containing the date label
   */
  private makeDayLabel(dateTime: DateTime): HTMLDivElement {
    const element: HTMLDivElement = this.renderer.createElement('div');
    element.textContent = dateTime.toLocaleString(this._dateFormatOptions);
    element.className = 'day-label';
    return element;
  }
}

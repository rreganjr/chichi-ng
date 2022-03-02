import { Component, ElementRef, Input, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { DateTime, DateTimeFormatOptions, DateTimeUnit, Duration } from 'luxon';
import { Subscription } from 'rxjs';
import { Timescale } from '../timescale.model';
import { VisualSchedulerService } from '../visual-scheduler.service';

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
      console.log(`timescale changed`, timescale);
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
    return (this._timescale.visibleDuration.as('minutes') / this.betweenTicksDuration.as('minutes')) * 100  + '%';
  }

  private get primaryTicksDuration(): Duration {
    const visibleHours = this._timescale.visibleDuration.hours;
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

  private get betweenTicksDuration(): Duration {
    const visibleHours = this._timescale.visibleDuration.hours;
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

  private get startAt(): DateTimeUnit {
    const visibleHours = this._timescale.visibleDuration.hours;
    if (visibleHours < 3*24) {
      return 'hour';
    } else {
      return 'day';
    }
  }

  private draw(): void {
    const element: HTMLDivElement = this.renderer.createElement('div');

    if (this.timelineElement !== undefined) {
      // clean-up previous elements
      for (const child of this.timelineElement.nativeElement.children) {
        this.renderer.removeChild(this.timelineElement.nativeElement, child);
      }

      const startTick: DateTime = this._timescale.boundsInterval.start.startOf(this.startAt).plus(this._timescale.offsetDuration);
      const lastTick: DateTime = startTick.plus(this._timescale.visibleDuration);
      const primaryTicksDuration: Duration = this.primaryTicksDuration;
      const betweenTicksDuration: Duration = this.betweenTicksDuration;

      // drawing the tick marks
      for (let primaryTick: DateTime = startTick; primaryTick <= lastTick; primaryTick = primaryTick.plus(primaryTicksDuration)) {
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
    }
  }

  private makeBetweenTickElement(dateTime: DateTime): HTMLDivElement {
    console.log(`makeBetweenTickElement: ${dateTime}`);
    const element: HTMLDivElement = this.renderer.createElement('div');
    element.style.width = this.timeDivisionWidth;
    element.className = 'subHour';
    return element;
  }

  private makePrimaryTickElement(dateTime: DateTime): HTMLDivElement {
    console.log(`makePrimaryTickElement: ${dateTime}`);
    const element: HTMLDivElement = this.renderer.createElement('div');
    element.style.width = this.timeDivisionWidth;
    element.className = (dateTime.hour === 0) ? 'day' : 'hour';
    if (this.showLabels) {
      this.renderer.appendChild(element, (dateTime.hour === 0) ? this.makeDayLabel(dateTime) : this.makeHourLabel(dateTime));
    }
    return element;
  }

  private makeHourLabel(dateTime: DateTime): HTMLDivElement {
    const element: HTMLDivElement = this.renderer.createElement('div');
    element.textContent = dateTime.toLocaleString(this._timeFormatOptions);
    element.className = 'hour-label';
    return element;
  }

  private makeDayLabel(dateTime: DateTime): HTMLDivElement {
    const element: HTMLDivElement = this.renderer.createElement('div');
    element.textContent = dateTime.toLocaleString(this._dateFormatOptions);
    element.className = 'day-label';
    return element;
  }
}

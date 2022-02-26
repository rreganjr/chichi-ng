import { Component, ElementRef, Input, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { DateTime, DateTimeFormatOptions, Duration } from 'luxon';
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

  @Input() showLabels: boolean = false;
  private _dateFormatOptions: DateTimeFormatOptions | undefined = {dateStyle: 'short'};
  private _timeFormatOptions: DateTimeFormatOptions | undefined = {timeStyle: 'short'};
 
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
    return (this._timescale.visibleDuration.as('minutes') / this.timeDivisionDuration.as('minutes')) * 100  + '%';
  }

  private get timeDivisionDuration(): Duration {
    const visibleHours = this._timescale.visibleDuration.hours;
    if (visibleHours < 24) {
      return Duration.fromDurationLike({minutes: 15});
    } else if (visibleHours < 2*24) {
      return Duration.fromDurationLike({minutes: 30});
    } else if (visibleHours < 3*24) {
      return Duration.fromDurationLike({hours: 2});
    } else if (visibleHours < 5*24) {
      return Duration.fromDurationLike({hours: 6});
    } else if (visibleHours < 7*24) {
      return Duration.fromDurationLike({hours: 12});
    } else {
      return Duration.fromDurationLike({days: 1});
    }
  }

  private draw(): void {
    const element: HTMLDivElement = this.renderer.createElement('div');

    if (this.timelineElement !== undefined) {
      // clean-up previous elements
      for (const child of this.timelineElement.nativeElement.children) {
        this.renderer.removeChild(this.timelineElement.nativeElement, child);
      }

      const startTick: DateTime = this._timescale.boundsInterval.start.startOf('hour').plus(this._timescale.offsetDuration);
      const lastTick: DateTime = startTick.plus(this._timescale.visibleDuration);
      const tickDuration: Duration = this.timeDivisionDuration;

      // drawing the time lines
      for (let tick: DateTime = startTick; tick <= lastTick; tick = tick.plus(tickDuration) ) {
        this.renderer.appendChild(this.timelineElement.nativeElement, (tick.minute === 0 ? this.makeHourElement(tick) : this.makeSubHourElement(tick)));
      }
    }
  }

  private makeSubHourElement(dateTime: DateTime): HTMLDivElement {
    const element: HTMLDivElement = this.renderer.createElement('div');
    element.style.width = this.timeDivisionWidth;
    element.className = 'subHour';
    return element;
  }

  private makeHourElement(dateTime: DateTime): HTMLDivElement {
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

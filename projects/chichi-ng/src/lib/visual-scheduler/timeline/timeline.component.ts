import { Component, ElementRef, OnInit, Renderer2, ViewChild } from '@angular/core';
import { Interval } from 'luxon';
import { Subscription } from 'rxjs';
import { Timescale } from '../timescale.model';
import { VisualSchedulerService } from '../visual-scheduler.service';

@Component({
  selector: 'cc-timeline',
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.scss'],
  providers: [VisualSchedulerService]
})
export class TimelineComponent implements OnInit {

  private _timescaleSubscription!: Subscription;
  private _timescale!: Timescale;

  @ViewChild('timeline', {static: false}) timelineElement!: ElementRef;

  constructor(
    private visualSchedulerService: VisualSchedulerService,
    private renderer: Renderer2
  ) { }

  ngOnInit(): void {
    this._timescaleSubscription = this.visualSchedulerService.getTimescale$().subscribe((timescale: Timescale) => {
      this._timescale = timescale;
    });
  }

  /**
   * @returns the percent width of each time division in the timeline for the current timescale.
   */
     private get timeDivisionWidth(): string {
      return ((100.0 / this._timescale.visibleHours) / this.timeDivisionsPerHour) + '%';
    }

  /**
   * The number of time units to display between hours.
   */
  private get timeDivisionsPerHour(): number {
    const timeSpanHours = this._timescale.visibleHours;
    if (timeSpanHours < 24) {
      return 4;
    } else if (timeSpanHours < 72) {
      return 2;
    } else {
      return 1;
    }
  }

  private get startHour(): number {
    return this._timescale.boundsInterval.start.hour + this._timescale.offsetHours;
  }

  private get endHour(): number {
    return this.startHour + this._timescale.visibleHours;
  }

  private draw(renderer: Renderer2, timelineElement: ElementRef, includeHourLabel: boolean = false): void {
    const tempDiv: HTMLDivElement = renderer.createElement('div');
    if (timelineElement !== undefined) {
      // 
      for (const child of timelineElement.nativeElement.children) {
        renderer.removeChild(timelineElement.nativeElement, child);
      }

      renderer.appendChild(timelineElement.nativeElement, this.makeRulerElement(renderer, this.timeDivisionsPerHour, this.startHour, includeHourLabel)); // The hour line to start

      // The actual drawing of the lines
      for (let hour = this.startHour + 1; hour <= this.endHour; hour++) {
        for (let timeDivision = 1; timeDivision <= this.timeDivisionsPerHour; timeDivision++) {
          renderer.appendChild(timelineElement.nativeElement, this.makeRulerElement(renderer, timeDivision, hour, includeHourLabel));
        }
      }
    }
  }

  /*
   * @param renderer : Renderer2 - an Angular renderer for direct DOM editing.
   * @param timeDivision : number - the nth time division for this hour, if it equals {@link #timeDivisionsPerHour} then this is an hour line
   * @param hour : number - the nth hour since the start of the time span.
   * @param includeHourLabel : boolean - when true a label for the hour is add to the div in its own div
   * @returns an hour/subHour div element for the supplied hour and timeDivision
   */
  private makeRulerElement(renderer: Renderer2, timeDivision: number, hour: number, includeHourLabel: boolean): HTMLDivElement {
    const tempDiv: HTMLDivElement = renderer.createElement('div');
    tempDiv.style.width = this.timeDivisionWidth;
    tempDiv.className = (timeDivision === this.timeDivisionsPerHour) ? ((hour % 24 === 0) ? 'day' : 'hour') : 'subHour';
    if (this._timescale.visibleHours >= 24 && (hour % (4 / this.timeDivisionsPerHour)) === (this.startHour % (4 / this.timeDivisionsPerHour))) {
      tempDiv.className += ' labeled-hour';
    }
    if (timeDivision === this.timeDivisionsPerHour) { // the hour
      if (includeHourLabel && (this._timescale.visibleHours < 24 || ((hour % (4 / this.timeDivisionsPerHour)) === (this.startHour % (4 / this.timeDivisionsPerHour))))) {
        const labelDiv: HTMLDivElement = renderer.createElement('div');
        labelDiv.textContent = this.get12HourTime(hour);  // Label the hour
        labelDiv.className = 'hour-label';
        renderer.appendChild(tempDiv, labelDiv);
      }
    }
    return tempDiv;
  }

  // Returns 12H hour instead of 24H
  private get12HourTime(hour: number) {
    let hr, pm = false;
    for (hr = hour; hr >= 12; hr -= 12) {
      pm = !pm;
    }
    return (hr === 0 ? '12' : hr) + ':00' + (pm ? 'pm' : 'am');
  }


}

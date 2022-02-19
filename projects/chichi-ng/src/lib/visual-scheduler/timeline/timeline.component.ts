import { Component, ElementRef, Input, OnDestroy, OnInit, Renderer2 } from '@angular/core';
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

  @Input() showHourLabel: boolean = false;
 
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

  /**
   * The first hour visible in the timeline
   */
  private get startHour(): number {
    return this._timescale.boundsInterval.start.hour + this._timescale.offsetHours;
  }

  /**
   * The last hour visible in the timeline
   */
  private get endHour(): number {
    return this.startHour + this._timescale.visibleHours;
  }

  private draw(): void {
    console.log('draw!', this._timescale);
    const tempDiv: HTMLDivElement = this.renderer.createElement('div');
    if (this.timelineElement !== undefined) {
      // 
      for (const child of this.timelineElement.nativeElement.children) {
        this.renderer.removeChild(this.timelineElement.nativeElement, child);
      }

      this.renderer.appendChild(this.timelineElement.nativeElement, this.makeRulerElement(this.timeDivisionsPerHour, this.startHour, this.showHourLabel));

      // The actual drawing of the lines
      for (let hour = this.startHour + 1; hour <= this.endHour; hour++) {
        for (let timeDivision = 1; timeDivision <= this.timeDivisionsPerHour; timeDivision++) {
          this.renderer.appendChild(this.timelineElement.nativeElement, this.makeRulerElement(timeDivision, hour, (this.showHourLabel && hour !== this.endHour)));
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
  private makeRulerElement(timeDivision: number, hour: number, includeHourLabel: boolean): HTMLDivElement {
    const tempDiv: HTMLDivElement = this.renderer.createElement('div');
    tempDiv.style.width = this.timeDivisionWidth;
    tempDiv.className = (timeDivision === this.timeDivisionsPerHour) ? ((hour % 24 === 0) ? 'day' : 'hour') : 'subHour';
    if (this._timescale.visibleHours >= 24 && (hour % (4 / this.timeDivisionsPerHour)) === (this.startHour % (4 / this.timeDivisionsPerHour))) {
      tempDiv.className += ' labeled-hour';
    }
    if (timeDivision === this.timeDivisionsPerHour) { // the hour
      if (includeHourLabel && (this._timescale.visibleHours < 24 || ((hour % (4 / this.timeDivisionsPerHour)) === (this.startHour % (4 / this.timeDivisionsPerHour))))) {
        const labelDiv: HTMLDivElement = this.renderer.createElement('div');
        labelDiv.textContent = this.get12HourTime(hour);  // Label the hour
        labelDiv.className = 'hour-label';
        this.renderer.appendChild(tempDiv, labelDiv);
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

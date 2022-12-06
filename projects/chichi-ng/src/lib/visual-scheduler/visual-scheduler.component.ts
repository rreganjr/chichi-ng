import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { DateTime, Interval } from 'luxon';
import { VisualSchedulerService } from './visual-scheduler.service';

@Component({
  selector: 'cc-visual-scheduler',
  templateUrl: './visual-scheduler.component.html',
  styleUrls: ['./visual-scheduler.component.scss']
})
export class VisualSchedulerComponent implements OnChanges {

  /**
   * The Date in ISO8601 Format
   */
  @Input() startDate!: string;
  @Input() endDate!: string;

  constructor(
    private _visualSchedulerService: VisualSchedulerService
  ) { }

  /**
   * Listen for changes to the start/end date triggered outside the component and update the bounds through
   * the {@link VisualSchedulerService}
   *
   * @param changes - start or end date changes
   */
  ngOnChanges(changes: SimpleChanges): void {
    const oldStartDate:string = changes['startDate']?.previousValue;
    const newStartDate:string = changes['startDate']?.currentValue;
    const oldEndDate:string = changes['endDate']?.previousValue;
    const newEndDate:string = changes['endDate']?.currentValue;

    let boundsInterval: Interval|undefined = undefined;
    if (newStartDate && newStartDate !== oldStartDate && newEndDate && newEndDate !== oldEndDate) {
      boundsInterval = Interval.fromDateTimes(DateTime.fromISO(newStartDate), DateTime.fromISO(newEndDate));
    } else if (newStartDate && newStartDate !== oldStartDate) {
      boundsInterval = Interval.fromDateTimes(DateTime.fromISO(newStartDate), DateTime.fromISO(this.endDate));
    } else if (newEndDate && newEndDate !== oldEndDate) {
      boundsInterval = Interval.fromDateTimes(DateTime.fromISO(this.startDate), DateTime.fromISO(newEndDate));
    }
    if (boundsInterval) {
      this._visualSchedulerService.setBoundsInterval(boundsInterval);
    }
  }
}

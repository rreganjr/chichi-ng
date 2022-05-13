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
    if (this.startDate && this.endDate &&
        (changes['startDate']?.currentValue || changes['endDate']?.currentValue) &&
        (changes['startDate']?.currentValue !== changes['startDate']?.previousValue ||
        changes['endDate']?.currentValue !== changes['endDate']?.previousValue)
      ) {
      console.log(`date bounds changed: startDate=${this.startDate} DateTime.fromISO(this.startDate)=${DateTime.fromISO(this.startDate)} endDate=${this.endDate}`);
      this._visualSchedulerService.setBoundsInterval(Interval.fromDateTimes(DateTime.fromISO(this.startDate), DateTime.fromISO(this.endDate)));
    }
  }
}

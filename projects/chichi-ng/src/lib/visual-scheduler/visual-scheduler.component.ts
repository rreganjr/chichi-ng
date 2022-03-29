import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { DateTime, Interval } from 'luxon';
import { VisualSchedulerService } from './visual-scheduler.service';

@Component({
  selector: 'cc-visual-scheduler',
  templateUrl: './visual-scheduler.component.html',
  styleUrls: ['./visual-scheduler.component.scss']
})
export class VisualSchedulerComponent implements OnInit, OnChanges {

  /**
   * The Date in ISO8601 Format
   */
  @Input() startDate!: string;
  @Input() endDate!: string;

  constructor(
    private visualSchedulerService: VisualSchedulerService
  ) { }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.startDate && this.endDate && (changes['startDate']?.currentValue || changes['endDate']?.currentValue)) {
      console.log(`dates changed: startDate=${this.startDate} endDate=${this.endDate}`)
      this.visualSchedulerService.setBoundsInterval(Interval.fromDateTimes(DateTime.fromISO(this.startDate), DateTime.fromISO(this.endDate)));
    }
  }
}

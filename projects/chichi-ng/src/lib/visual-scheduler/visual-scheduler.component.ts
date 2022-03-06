import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { Interval } from 'luxon';
import { VisualSchedulerService } from './visual-scheduler.service';

@Component({
  selector: 'cc-visual-scheduler',
  templateUrl: './visual-scheduler.component.html',
  styleUrls: ['./visual-scheduler.component.scss']
})
export class VisualSchedulerComponent implements OnInit, OnChanges {

  @Input() startDate!: Date;
  @Input() endDate!: Date;

  constructor(
    private visualSchedulerService: VisualSchedulerService
  ) { }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.startDate && this.endDate && (changes['startDate'].currentValue || changes['endDate'].currentValue)) {
      this.visualSchedulerService.setBoundsInterval(Interval.fromDateTimes(this.startDate, this.endDate));
    }
  }
}

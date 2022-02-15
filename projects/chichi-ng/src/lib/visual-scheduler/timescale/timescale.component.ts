import { Component, Input, OnInit } from '@angular/core';
import { Interval } from 'luxon';
import { VisualSchedulerService } from '../visual-scheduler.service';

@Component({
  selector: 'cc-timescale',
  templateUrl: './timescale.component.html',
  styleUrls: ['./timescale.component.scss'],
  providers: [VisualSchedulerService]
})
export class TimescaleComponent implements OnInit {

  public boundsInterval: Interval = Interval.fromDateTimes(new Date(), new Date());
  public visibleHours: number = 3;
  public offsetHours: number = 0;

  constructor(
    private visualSchedulerService: VisualSchedulerService
    ) { 
      this.visualSchedulerService.getBoundsInterval$().subscribe( (interval: Interval) => {
          this.boundsInterval = interval;
      });
      this.visualSchedulerService.getTimeScaleVisibleHours$().subscribe ((visibleHours: number) => {
        this.visibleHours = visibleHours;
      });
      this.visualSchedulerService.getTimeScaleOffsestHours$().subscribe( (offsetHours: number) => {
        this.offsetHours = offsetHours;
      });
    }

  ngOnInit(): void {
  }

  public zoomIn(): void {
    this.visualSchedulerService.setTimeScaleVisibleHours(this.visibleHours * 2);
  }

  public zoomOut(): void {
    this.visualSchedulerService.setTimeScaleVisibleHours(this.visibleHours * 2); // TODO: round
  }

  public panBack(): void {
    if (this.offsetHours > 0) {
        this.visualSchedulerService.setTimeScaleOffsetHours(this.offsetHours - this.visibleHours);
    }
  }

  public setVisibleHours(visibleHours: number): void {
    this.visualSchedulerService.setTimeScaleVisibleHours(visibleHours);
  }
}

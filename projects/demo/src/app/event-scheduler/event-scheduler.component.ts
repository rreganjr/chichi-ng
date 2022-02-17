import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'event-scheduler',
  templateUrl: './event-scheduler.component.html',
  styleUrls: ['./event-scheduler.component.scss']
})
export class EventSchedulerComponent implements OnInit {

  public startDate: Date = new Date();
  public endDate: Date = new Date(this.startDate.getTime() + 24 * 60 * 60 * 1000);

  constructor() { }

  ngOnInit(): void {
  }

}

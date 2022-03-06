import { Component, ElementRef, Input, OnInit } from '@angular/core';
import { Duration, Interval } from 'luxon';
import { Subscription } from 'rxjs';
import { Timescale } from '../../../timescale.model';
import { VisualSchedulerService } from '../../../visual-scheduler.service';
import { AgendaItem } from '../agenda-item.model';

@Component({
  selector: 'cc-agenda-item',
  templateUrl: './agenda-item.component.html',
  styleUrls: ['./agenda-item.component.scss']
})
export class AgendaItemComponent implements OnInit {

  @Input() agendaItem!: AgendaItem;

  private _timescaleSubscription?: Subscription;

  constructor(
    private visualSchedulerService: VisualSchedulerService,
    private channelElement: ElementRef
  ) { }

  ngOnInit(): void {
    this._timescaleSubscription = this.visualSchedulerService.getTimescale$().subscribe((timescale: Timescale) => {
      console.log(`agenda-item: timescale change: ${timescale}`);
      if (this.channelElement && this.channelElement.nativeElement) {
        const visibleBounds: Interval = timescale.visibleBounds;
        const intersectingInterval: Interval|null = visibleBounds.intersection(this.agendaItem.bounds);
        if (intersectingInterval !== null) {
          const offset: Duration = intersectingInterval.start.diff(visibleBounds.start);
          const duration: Duration = intersectingInterval.toDuration();
          const el = this.channelElement.nativeElement;
          el.style.left = (offset.as('seconds') / visibleBounds.toDuration().as('seconds')) * 100  + '%';
          el.style.width = (duration.as('seconds') / visibleBounds.toDuration().as('seconds')) * 100  + '%';
        }
      }
    });
  }

}

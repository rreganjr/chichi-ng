import { Component, ElementRef, Input, OnDestroy, OnInit } from '@angular/core';
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
export class AgendaItemComponent implements OnInit, OnDestroy {

  @Input() agendaItem!: AgendaItem;

  private _timescaleSubscription?: Subscription;

  constructor(
    private visualSchedulerService: VisualSchedulerService,
    private channelElement: ElementRef
  ) {
    console.log(`AgendaItemComponent`, this.agendaItem);
  }

  ngOnInit(): void {
    // watch for changes to the timescale and adjust the position and size of the agenda-item
    this._timescaleSubscription = this.visualSchedulerService.getTimescale$().subscribe((timescale: Timescale) => {
      // TODO: I may be able remove the intersection part as I think the channel may rebuild the
      // TODO: agendaItems when the timescale or agendaItems change
      if (this.channelElement && this.channelElement.nativeElement) {
        const visibleBounds: Interval = timescale.visibleBounds;
        const intersectingInterval: Interval|null = visibleBounds.intersection(this.agendaItem.bounds);
        const el = this.channelElement.nativeElement;
        if (intersectingInterval !== null) {
          const offset: Duration = intersectingInterval.start.diff(visibleBounds.start);
          const duration: Duration = intersectingInterval.toDuration();
          el.style.display = 'block';
          el.style.left = (offset.as('seconds') / visibleBounds.toDuration().as('seconds')) * 100  + '%';
          // TODO: the width needs to account for the border, how can I do this if it is user defined css?
          el.style.width = `${(duration.as('seconds') / visibleBounds.toDuration().as('seconds')) * 100}%`;
        } else {
          el.style.display = 'none';
        }
      }
    });
  }

  ngOnDestroy(): void {
    if (this._timescaleSubscription) {
      this._timescaleSubscription.unsubscribe();
      this._timescaleSubscription = undefined;
    }
  }
}

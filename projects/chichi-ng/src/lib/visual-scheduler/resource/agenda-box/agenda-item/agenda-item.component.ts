import { Component, ElementRef, HostBinding, Input, OnDestroy, OnInit } from '@angular/core';
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
    private _visualSchedulerService: VisualSchedulerService,
    private _channelElement: ElementRef
  ) {
  }

  ngOnInit(): void {
    // watch for changes to the timescale and adjust the position and size of the agenda-item
    this._timescaleSubscription = this._visualSchedulerService.getTimescale$().subscribe((timescale: Timescale) => {
      // TODO: I may be able remove the intersection part as I think the channel may rebuild the
      // TODO: agendaItems when the timescale or agendaItems change
      if (this._channelElement && this._channelElement.nativeElement) {
        const visibleBounds: Interval = timescale.visibleBounds;
        const intersectingInterval: Interval|null = visibleBounds.intersection(this.agendaItem.bounds);
        const el = this._channelElement.nativeElement;
        if (intersectingInterval !== null) {
          // add the timescale.startAtDurationInSeconds to account for the timeline starting on an hour or day before
          // the actual start boundary, which requires the items to shift by that amount to line up properly
          const offset: Duration = intersectingInterval.start.diff(visibleBounds.start).plus(timescale.startAtDurationInSeconds);
          const duration: Duration = intersectingInterval.toDuration();
          el.style.display = 'block';
          el.style.left = (offset.as('seconds') / visibleBounds.toDuration().as('seconds')) * 100  + '%';
          el.style.width = `${(duration.as('seconds') / visibleBounds.toDuration().as('seconds')) * 100}%`;
        } else {
          el.style.display = 'none';
        }
      }
    });
  }

  onOpen($event: Event): void {
    console.log(`AgendaItem.onOpen`, $event);
    if (this.agendaItem) {
      this._visualSchedulerService.openAgendaItemDetail(this.agendaItem, $event);
    }
  }

  onDelete($event: Event): void {
    console.log(`AgendaItem.onDelete`, $event);
    if (this.agendaItem) {
      this._visualSchedulerService.removeAgendaItem(this.agendaItem);
    }
  }

  ngOnDestroy(): void {
    if (this._timescaleSubscription) {
      this._timescaleSubscription.unsubscribe();
      this._timescaleSubscription = undefined;
    }
  }
}

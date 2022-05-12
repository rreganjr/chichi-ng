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
    private _visualSchedulerService: VisualSchedulerService,
    private _agendaItemElement: ElementRef
  ) {
  }

  ngOnInit(): void {
    // watch for changes to the timescale and adjust the position and size of the agenda-item
    this._timescaleSubscription = this._visualSchedulerService.getTimescale$().subscribe((timescale: Timescale) => {
      // TODO: I may be able remove the intersection part as I think the channel may rebuild the
      // TODO: agendaItems when the timescale or agendaItems change
      if (this._agendaItemElement && this._agendaItemElement.nativeElement) {
        const visibleBounds: Interval = timescale.visibleTimelineBounds;
        const intersectingInterval: Interval|null = visibleBounds.intersection(this.agendaItem.bounds);
        const el = this._agendaItemElement.nativeElement;
        if (intersectingInterval !== null) {
          // add the {@link Timescale.outOfBoundsStartDuration} to account for the timeline starting on an hour or day before
          // the actual start boundary, which requires the items to shift by that amount to line up properly
          const offset: Duration = intersectingInterval.start.diff(visibleBounds.start); //.plus(timescale.outOfBoundsStartDuration);
          const duration: Duration = intersectingInterval.toDuration();
          el.style.display = 'block';
          el.style.left = `${(offset.as('seconds') / visibleBounds.toDuration().as('seconds')) * 100}%`;
          el.style.width = `${(duration.as('seconds') / visibleBounds.toDuration().as('seconds')) * 100}%`;
        } else {
          console.log(`hidden agenda-item component for ${this.agendaItem.id}`);
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
    $event.stopPropagation();
    if (this.agendaItem) {
      this._visualSchedulerService.removeAgendaItem(this.agendaItem);
    }
  }

  ngOnDestroy(): void {
    console.log(`destroying agenda-item component for ${this.agendaItem.id}`);
    if (this._timescaleSubscription) {
      this._timescaleSubscription.unsubscribe();
      this._timescaleSubscription = undefined;
    }
  }
}

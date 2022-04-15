import { Component, ElementRef, HostBinding, Input, OnInit } from '@angular/core';
import { Duration, Interval } from 'luxon';
import { filter, Subscription } from 'rxjs';
import { VisualSchedulerService } from '../../../visual-scheduler.service';
import { AgendaItem } from '../agenda-item.model';
import { Timescale } from '../../../timescale.model';
import { ToolEvent } from '../../../toolbox/tool/tool-event.model';

@Component({
  selector: 'cc-drop-zone',
  templateUrl: './drop-zone.component.html',
  styleUrls: ['./drop-zone.component.scss']
})
export class DropZoneComponent implements OnInit {

  @Input() agendaItem!: AgendaItem; // this is a faked up agendaItem representing an unscheduled area

  // When a tool is dragged that is appropriate to drop on this zone,
  // indicate this is an appropriate target via the is-dragging css class
  @HostBinding('class.is-dragging') isDragging: boolean = false;

  private _timescaleSubscription?: Subscription;

  constructor(
    private _visualSchedulerService: VisualSchedulerService,
    private _dropZoneElement: ElementRef
  ) {}

  ngOnInit(): void {
    // watch for changes to the timescale and adjust the position and size of the drop-zone
    this._timescaleSubscription = this._visualSchedulerService.getTimescale$().subscribe((timescale: Timescale) => {
      // TODO: I may be able remove the intersection part as I think the channel may rebuild the
      // TODO: agendaItems when the timescale or agendaItems change
      if (this._dropZoneElement && this._dropZoneElement.nativeElement) {
        const visibleBounds: Interval = timescale.visibleBounds;
        const intersectingInterval: Interval|null = visibleBounds.intersection(this.agendaItem.bounds);
        const el = this._dropZoneElement.nativeElement;
        if (intersectingInterval !== null) {
        // add the {@link Timescale.outOfBoundsStartDuration} to account for the timeline starting on an hour or day before
        // the actual start boundary, which requires the items to shift by that amount to line up properly
        const offset: Duration = intersectingInterval.start.diff(visibleBounds.start); //.plus(timescale.outOfBoundsStartDuration);
          const duration: Duration = intersectingInterval.toDuration();
          el.style.display = 'block';
          el.style.left = `${(offset.as('seconds') / visibleBounds.toDuration().as('seconds')) * 100}%`;
          el.style.width = `${(duration.as('seconds') / visibleBounds.toDuration().as('seconds')) * 100}%`;
        } else {
          console.log(`hidden drop-zone component for ${this.agendaItem.id}`);
          el.style.display = 'none';
        }
      }
    });

    // this listens for {@link ToolEvent} START and STOP to indicate starting/stopping dragging
    // so the drop zone can activate/highlight if the toolType of the event matches the channel
    this._visualSchedulerService.getToolEvents$().pipe(
      filter((toolEvent:ToolEvent) => toolEvent.toolType === this.agendaItem.channelName)
      ).subscribe( (toolEvent: ToolEvent) => {
      if (toolEvent.isStart()) {
        this.isDragging = true;
      } else {
        this.isDragging = false;
      }
    });
  }

  ngOnDestroy(): void {
    console.log(`destroying drop-zone component for ${this.agendaItem.id}`);
    if (this._timescaleSubscription) {
      this._timescaleSubscription.unsubscribe();
      this._timescaleSubscription = undefined;
    }
  }
}

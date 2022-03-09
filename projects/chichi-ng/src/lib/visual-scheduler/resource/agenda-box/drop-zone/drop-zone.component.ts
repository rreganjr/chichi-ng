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
    private visualSchedulerService: VisualSchedulerService,
    private dropZoneElement: ElementRef
  ) {}

  ngOnInit(): void {
      // watch for changes to the timescale and adjust the position and size of the timezone
      this.visualSchedulerService.getTimescale$().subscribe( (timescale: Timescale) => {
      // TODO: I may be able remove the intersection part as I think the channel may rebuild the
      // TODO: agendaItems when the timescale or agendaItems change
      if (this.dropZoneElement && this.dropZoneElement.nativeElement) {
        const visibleBounds: Interval = timescale.visibleBounds;
        const intersectingInterval: Interval|null = visibleBounds.intersection(this.agendaItem.bounds);
        const el = this.dropZoneElement.nativeElement;
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

    this.visualSchedulerService.getToolEvents$().pipe(
      filter((toolEvent:ToolEvent, index:number) => toolEvent.toolType === this.agendaItem.channelName)
      ).subscribe( (toolEvent: ToolEvent) => {
      if (toolEvent.isStart()) {
        this.isDragging = true;
      } else {
        this.isDragging = false;
      }
    })
  }

  ngOnDestroy(): void {
    if (this._timescaleSubscription) {
      this._timescaleSubscription.unsubscribe();
      this._timescaleSubscription = undefined;
    }
  }
}

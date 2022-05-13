import { AfterViewInit, Component, ElementRef, Input, OnInit } from '@angular/core';
import { combineLatest, debounceTime, map, Observable } from 'rxjs';
import { DndDropEvent } from 'ngx-drag-drop';
import { DateTime, Interval } from 'luxon';
import { AgendaItem, AgendaItemLabeler } from '../agenda-item.model';
import { VisualSchedulerService } from '../../../visual-scheduler.service';
import { Timescale } from '../../../timescale.model';

export class DropZoneAgendaItem extends AgendaItem {
  public readonly isDropZone: boolean = true;
  constructor(
     resource: string,
     channel: string,
     bounds: Interval,
     data: object,
     labeler: AgendaItemLabeler<any>
) {
    super(resource, channel, bounds, data, labeler)
  }
}

@Component({
  selector: 'cc-channel',
  templateUrl: './channel.component.html',
  styleUrls: ['./channel.component.scss']
})
export class ChannelComponent implements OnInit, AfterViewInit {

  @Input() resourceName!: string;
  @Input() channelName!: string;

/**
  * observable of visible agendaItems for this resource + channel updated when
  * items are added or removed or the displayed view (zoom/panning) changes.
  */
  public visibleAgendaItems$: Observable<AgendaItem[]>|undefined;

  constructor(
    public _visualSchedulerService: VisualSchedulerService,
    private _channelElement: ElementRef
  ) {
  }

  ngOnInit(): void {
    console.log(`ChannelComponent[${this.resourceName}, ${this.channelName}] ngOnInit()`);

    // visibleAgendaItems$ has to be defined here so that the resourceName and channelName are defined via the inputs
    // otherwise no agenda items will ever be returned
    this.visibleAgendaItems$ = combineLatest([
      this._visualSchedulerService.getAgendaItemsByResourceChannel$(this.resourceName, this.channelName),
      this._visualSchedulerService.getTimescale$()
    ]).pipe(
      // the debounceTime helps not get "Expression has changed after it was checked" when adding lots of
      // agenda items programatically after the views have been initialized, along with recalculating the
      // drop-zones after every addition. But it introduces a lag time, best to minimize it
      debounceTime(50),
      // get the visible agenda items in the current view, plus one on each end so drop-zones can straddle
      // the visible bounds
      //tap(([agendaItems, timeScale]):void => console.log(`ChannelComponent['${this.resourceName}', '${this.channelName}'].agendaItems: `, agendaItems)),
      map(([agendaItems, timeScale]):[AgendaItem[], Timescale] => [
        this.getVisibleAgendaItemsPlus(agendaItems, timeScale.visibleBounds), timeScale
      ]),
      // add drop zones around agenda items
      map(([agendaItems, timeScale]):AgendaItem[] => this.injectDropZones(agendaItems, timeScale.boundsInterval))
      //tap(agendaItems => console.log(`ChannelComponent['${this.resourceName}', '${this.channelName}'].visibleAgendaItems$: `, agendaItems))
    );
  }

  ngAfterViewInit(): void {
   if (this._channelElement !== undefined) {
     this._channelElement.nativeElement.className = `channel-${this.channelName}`;
   }
  }

  public onDrop($event:DndDropEvent, agendaItem: AgendaItem): void {
    console.log(`${this.resourceName} ${this.channelName} drop agendaItem.id=${agendaItem.id} starting ${agendaItem.startDateAsHtmlDateTimeLocalString} ending ${agendaItem.endDateAsHtmlDateTimeLocalString}`, agendaItem);
    try {
      this._visualSchedulerService.addAgendaItem(this.resourceName, this.channelName, agendaItem.bounds.start.toJSDate(), agendaItem.bounds.end.toJSDate(), {label: 'new item'}, (data:any)=>data.label);
    } catch (error: any) {
      console.error(error.message, error);
    }
  }


  /**
    * Given a list of {@link AgendaItem}s find all the items that intersect with the supplied bounds plus
    * the AgendaItem before the bounds and after the bounds when ordering by date, if they exist.
    *
    * The AgendaItem before and after are needed so that when creating drop zones between the first and
    * last AgendaItems in view, the drop zones fill completely between two AgendaItems and not just the 
    * area visible, i.e. a drop zone straddles visible items up to the previous or next AgendaItem that
    * is not visible.
    *
    * @param agendaItems A list of agenda items
    * @param bounds The bounds to match agenda items
    * @returns [agendaItems: AgendaItem[], timeScale: Timescale]
    */
  private getVisibleAgendaItemsPlus(agendaItems: AgendaItem[], bounds: Interval): AgendaItem[] {
    if (agendaItems && agendaItems.length > 0) {
      agendaItems = agendaItems.sort((a:AgendaItem, b:AgendaItem)=> a.startDate.toMillis() - b.startDate.toMillis());
      let visibleAgendaItems: AgendaItem[] = [];
      let beforeAgendaItem: AgendaItem|undefined;
      let afterAgendaItem: AgendaItem|undefined;
      for (let i:number = 0; i < agendaItems?.length||0; i++) {
        if (bounds.intersection(agendaItems[i].bounds) === null) {
          // if the current item isn't visible
          if (agendaItems[i].bounds.start < bounds.start) {
            // if its before the start of the bounds
            beforeAgendaItem = agendaItems[i];
          } else {
            // this is the next item after the last visible or the first item after the visible bounds
            afterAgendaItem = agendaItems[i];
            break;
          }
        } else {
          visibleAgendaItems.push(agendaItems[i]);
        }
      }
      if (beforeAgendaItem) {
        visibleAgendaItems.unshift(beforeAgendaItem);
      }
      if (afterAgendaItem) {
        visibleAgendaItems.push(afterAgendaItem);
      }
      agendaItems = visibleAgendaItems;
    }
    return agendaItems;
  }

  /**
   * For the given {@link AgendaItem}s insert {@link DropZoneAgendaItem} in open time slots around them that
   * fall within the given bounds interval.
   *
   * @param agendaItems an array of {@link AgendaItem}s that may be empty or have gaps in time before, between, or after
   * @param bounds the time bounds that constrain the results
   * @returns an array of {@link AgendaItem}s and {@link DropZoneAgendaItem}s
   */
  private injectDropZones(agendaItems: AgendaItem[], bounds: Interval): AgendaItem[] {
    const results: AgendaItem[] = [];
    if (agendaItems?.length > 0) {
      let previousEnd: DateTime = bounds.start;
      for (let index = 0; index < agendaItems.length; index++) {
        const agendaItem: AgendaItem = agendaItems[index];
        const intervalBetween: Interval = Interval.fromDateTimes(previousEnd, agendaItem.bounds.start);
        if (intervalBetween.toDuration().as('seconds') > 0) {
          results.push(new DropZoneAgendaItem(this.resourceName, this.channelName, intervalBetween, {label: 'drop zone'}, (data)=> data.label));
        }
        results.push(agendaItem);
        previousEnd = agendaItem.bounds.end;
      }
      if (previousEnd < bounds.end) {
        // add a trailing drop zone
        const intervalBetween: Interval = Interval.fromDateTimes(previousEnd, bounds.end);
        results.push(new DropZoneAgendaItem(this.resourceName, this.channelName, intervalBetween, {label: 'drop zone'}, (data)=> data.label));
      }
    } else {
      // fill the whole visible part of the channel with a drop zone
      results.push(new DropZoneAgendaItem(this.resourceName, this.channelName, bounds, {label: 'drop zone'}, (data)=> data.label));
    }
    return results;
  }
}

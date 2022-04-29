import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, ReplaySubject, Subject } from 'rxjs';
import { Duration, Interval, DateTime } from 'luxon';
import { Timescale, TimescaleValidator } from './timescale.model';
import { AgendaItem, AgendaItemLabeler } from './resource/agenda-box/agenda-item.model';
import { ToolEvent } from './toolbox/tool/tool-event.model';
import { AgendaItemConflicts } from './agenda-item-conflicts.error';
import { AgendaItemOutOfBounds } from './agenda-item-out-of-bounds.error';
import { TimescaleNotSet } from './timescale-not-set.error';

type ResourceChannelMapKey = string;

class ResourceChannelMapData {
  public readonly agendaItems: AgendaItem[] = [];
  // Use a BehaviorSubject so that if no agenda items are added on startup the channel will be initialized to a big drop-zone
  public readonly subject: Subject<AgendaItem[]> = new BehaviorSubject<AgendaItem[]>([]);
}

@Injectable({
  providedIn: null
})
export class VisualSchedulerService {
  public static readonly MIN_VIEWPORT_DURATION: Duration = Duration.fromDurationLike({hours: 1});
  public static readonly MAX_VIEWPORT_DURATION: Duration = Duration.fromDurationLike({days: 7});

  private _timescale: Timescale|undefined;
  private _timescaleSubject: ReplaySubject<Timescale> = new ReplaySubject(1);

  private _toolEventsSubject: Subject<ToolEvent> = new BehaviorSubject(ToolEvent.CLEAR);

  private _agendaItemsById: Map<number,AgendaItem> = new Map<number, AgendaItem>();
  private _agendaItems: AgendaItem[] = [];
  private _agendaItemsSubject: ReplaySubject<AgendaItem[]> = new ReplaySubject(1);
  private _agendaItemsByResourceChannelMap: Map<ResourceChannelMapKey,ResourceChannelMapData> = new Map<ResourceChannelMapKey, ResourceChannelMapData>();

  constructor() {
  }

  public dragStart($event: DragEvent, toolType: string): void {
    console.log(`dragStart: ${toolType}`, $event);
    this._toolEventsSubject.next(ToolEvent.newDragStartEvent(toolType, $event));
  }

  public dragEnd($event: DragEvent, toolType: string): void {
    console.log(`dragEnd: ${toolType}`, $event);
    this._toolEventsSubject.next(ToolEvent.newDragEndEvent(toolType, $event));
  }
  
  /**
   * Open a viewer/editor for the supplied {@link AgendaItem}
   * @param agendaItemOrId - The {@link AgendaItem} or the id of the agenda item to remove
   * @returns true if the viewer/editor
   */
   public openAgendaItemDetail(agendaItemOrId: AgendaItem|number, $event: Event): boolean {
    const agendaItem: AgendaItem|undefined = this.toAgendaItem(agendaItemOrId);
    if (agendaItem !== undefined) {
      this._toolEventsSubject.next(ToolEvent.newEditEvent(agendaItem, $event));
        console.log(`open agenda item: ${agendaItem.label} in resource ${agendaItem.resourceName} channel ${agendaItem.channelName}`);
    }
    return false;
  }

  public getToolEvents$(): Observable<ToolEvent> {
    return this._toolEventsSubject.asObservable();
  }

  public getTimescale$(): Observable<Timescale> {
    return this._timescaleSubject.asObservable();
  }

  /**
   *
   * @param resourceName
   * @param channelName
   * @param startDate
   * @param endDate
   * @returns a list of {@link AgendaItem}s that intersect with the supplied date interval. The list may be empty.
   */
  public getIntersectingAgendaItems(resourceName: string, channelName: string, startDate: Date, endDate: Date): AgendaItem[] {
    return this.getResourceChannelMapData(this.getResourceChannelMapKey(resourceName, channelName))
      .agendaItems.filter((agendaItem) => agendaItem.bounds.intersection(Interval.fromDateTimes(startDate, endDate)) !== null);
  }

  /**
   *
   * @param resourceName
   * @param channelName
   * @param startDate
   * @param endDate
   * @returns true if the supplied date interval doesn't contain any scheduled items
   * @throws Error when the timescale is not defined yet
   */
  public isIntervalAvailable(resourceName: string, channelName: string, startDate: Date, endDate: Date): boolean {
    if (this._timescale == undefined) throw this.timescaleNotSetError();

    const start = DateTime.fromJSDate(startDate);
    const end = DateTime.fromJSDate(endDate);
    return this._timescale?.boundsInterval.contains(start) && (
        this._timescale?.boundsInterval.contains(end) ||
        this._timescale?.boundsInterval.end.equals(end)
      ) && this.getIntersectingAgendaItems(resourceName, channelName, startDate, endDate).length===0;
  }

  /**
   * Set the time bounds of the scheduler. adding an {@link AgendaItem} outside these
   * bounds is not allowed. scaling and panning the view outside these bounds is not allowed.
   * @param startDate the minimum date/time of scheduled agenda items as a {@link Date}.
   * @param endDate the maximum date/time of scheduled agenda items as a {@link Date}.
   */
  public setBounds(startDate: Date, endDate: Date): void {
    this.setBoundsInterval(Interval.fromDateTimes(startDate, endDate));
  }

  /**
   * Set the time bounds of the scheduler. adding an {@link AgendaItem} outside these
   * bounds is not allowed. scaling and panning the view outside these bounds is not allowed.
   * @param interval the start date and time to the end date and time as an {@link Interval}
   */
  public setBoundsInterval(interval: Interval): void {
    // TODO: adjust the visibleDuration and offsetDuration if needed when the bounds change
    this._timescale = new Timescale(interval, this._timescale?.visibleDuration, this._timescale?.offsetDuration);
    this._timescaleSubject.next(this._timescale);
  }

  private _adjustOffsetToKeepViewportInbounds(timescale: Timescale, offset: Duration): Duration {
    if (timescale.visibleBounds.end.plus(offset) > timescale.boundsInterval.end) {
      offset = Interval.fromDateTimes(timescale.boundsInterval.start, timescale.boundsInterval.end.minus(timescale.visibleDuration)).toDuration();
    }
    return offset;
  }

  private _adjustViewportToBounds(bounds: Interval, duration: Duration): Duration {
    if (duration > bounds.toDuration()) {
      duration = bounds.toDuration();
    }
    return duration;
  }

  /**
   * Set the viewport offset from the start of the scheduler bounds. The offset
   * will be adjusted such that the viewport stays within the scheduler bounds.
   *
   * NOTE: this is the absolute position from the start, not adding to the current offset.
   *
   * @param offset - the {@link Duration} from the scheduler bounds start time to the start of the viewport
   * @throws Error when the timescale is not defined yet
   */
  public setViewportOffsetDuration(offset: Duration): void {
    if (this._timescale == undefined) throw this.timescaleNotSetError();
    if (offset.as('seconds') >= 0) {
      offset = this._adjustOffsetToKeepViewportInbounds(this._timescale, offset);
      if (!this._timescale.offsetDuration.equals(offset)) {
        console.log(`setViewportOffsetDuration(offset = ${offset})`);
        this._timescale = new Timescale(this._timescale.boundsInterval, this._timescale.visibleDuration, offset);
        this._timescaleSubject.next(this._timescale);
      }
    }
  }

  /**
   * Set the viewport {@link Duration}. The viewport must be less than or equal to the scheduler duration as
   * well as between {@link MIN_VIEWPORT_DURATION} and {@link MAX_VIEWPORT_DURATION} inclusive.
   * @param duration - The viewport duration
   * @throws Error when the timescale is not defined yet or invalid
   */
  public setViewportDuration(duration: Duration): void {
    if (this._timescale == undefined) throw this.timescaleNotSetError();

    if (duration < VisualSchedulerService.MIN_VIEWPORT_DURATION) {
      duration = VisualSchedulerService.MIN_VIEWPORT_DURATION;
    } else if (duration > VisualSchedulerService.MAX_VIEWPORT_DURATION) {
      duration = VisualSchedulerService.MAX_VIEWPORT_DURATION;
    }
    duration = this._adjustViewportToBounds(this._timescale.boundsInterval, duration);

    // adjust the offset so the viewport stays in the scheduler bounds
    let offset: Duration = this._adjustOffsetToKeepViewportInbounds(this._timescale, this._timescale.offsetDuration);

    this._timescale = new Timescale(this._timescale.boundsInterval, duration, offset);
    this._timescaleSubject.next(this._timescale);
  }

  public getAgendaItemById(id: number): AgendaItem|undefined {
    return this._agendaItemsById.get(id);
  }

  /**
   *
   * @returns All the {@link AgendaItem}s in the {@link VisualSchedulerComponent}
   */
  public getAgendaItems$(): Observable<AgendaItem[]> {
    return this._agendaItemsSubject.asObservable();
  }

  /**
   *
   * @param resourceName - The name of a specific {@link ResourceComponent}
   * @param channelName - The name of a {@link ChannelComponent} in the named resource
   * @returns The {@link AgendaItem}s in that channel of the resource
   */
  public getAgendaItemsByResourceChannel$(resourceName: string, channelName: string): Observable<AgendaItem[]> {
    return this.getResourceChannelMapData(this.getResourceChannelMapKey(resourceName, channelName)).subject.asObservable();
  }

  /**
   * Add an item to the agenda. If the supplied start/end date intersect with another agenda item in the same resource/channel the item is
   * not added.
   *
   * @param resourceName - The name of a specific {@link ResourceComponent}
   * @param channelName  - The name of a {@link ChannelComponent} in the named resource
   * @param startDate - start date and time of new item
   * @param endDate - end date and time of new item
   * @param data - Data for the agenda item not specific to the agenda except that the labeler function will use it.
   * @param labeler - A function that takes the supplied data to generate a label to display in the agenda.
   * @returns The id of the agenda item added to the agenda or undefined if not added
   * @throws Error when the timescale is not defined yet or the start/end is out of bounds or the start/end overlaps another agenda item
   */
  public addAgendaItem(resourceName: string, channelName: string, startDate: Date, endDate: Date, data: object, labeler: AgendaItemLabeler<any>): number {
    if (this._timescale == undefined) throw this.timescaleNotSetError();
    const newItemInterval = Interval.fromDateTimes(startDate, endDate);
    if (this.isIntervalAvailable(resourceName, channelName, startDate, endDate)) {
      const agendaItem = new AgendaItem(resourceName, channelName, newItemInterval, data, labeler);
      this._agendaItemsById.set(agendaItem.id, agendaItem);
      this._agendaItems.push(agendaItem);
      this._agendaItemsSubject.next(this._agendaItems);

      const mapData = this.getResourceChannelMapData(this.getResourceChannelMapKey(resourceName, channelName));
      mapData.agendaItems.push(agendaItem);
      mapData.subject.next(mapData.agendaItems);
      return agendaItem.id;
    } else {
      console.log(`failed to add resourceName=${resourceName}, channelName=${channelName} agendaItem=${labeler(data)} `);
      const conflictingItems: AgendaItem[] = this.getIntersectingAgendaItems(resourceName, channelName, startDate, endDate);
      if (conflictingItems.length > 0) {
        throw  new AgendaItemConflicts(newItemInterval, conflictingItems);
      } else {
        throw new AgendaItemOutOfBounds(newItemInterval, this._timescale.boundsInterval);
      }
    }
  }

  /**
   * Remove an {@link AgendaItem} from the scheduler.
   * @param agendaItemOrId - The {@link AgendaItem} or the id of the agenda item to remove
   * @returns true if the {@link AgendaItem} was found and removed, false if it wasn't found
   */
  public removeAgendaItem(agendaItemOrId: AgendaItem|number): boolean {
    const agendaItem: AgendaItem|undefined = this.toAgendaItem(agendaItemOrId);
    if (agendaItem) {
      const index = this._agendaItems.findIndex((item:AgendaItem) => {
        return item.resourceName === agendaItem.resourceName &&
          item.channelName === agendaItem.channelName &&
          item.bounds == agendaItem.bounds
      })
      if (index > -1) {
        this._agendaItems.splice(index, 1);
        this._agendaItemsSubject.next(this._agendaItems);
        // if the item is in the _agendaItems array, it will also be in the mapped data
        const key = this.getResourceChannelMapKey(agendaItem.resourceName, agendaItem.channelName);
        const mapData = this.getResourceChannelMapData(key);
        const mapDataIndex = mapData.agendaItems.findIndex((item:AgendaItem) => {
          return item.resourceName === agendaItem.resourceName &&
            item.channelName === agendaItem.channelName &&
            item.bounds == agendaItem.bounds
        })
        if (mapDataIndex > -1) {
          mapData.agendaItems.splice(mapDataIndex, 1);
          mapData.subject.next(mapData.agendaItems);
        }
      }
      return index > -1;
    }
    return false;
  }

  /**
   * @param agendaItemOrId - The {@link AgendaItem} or the id of the agenda item to remove
   * @returns the supplied {@link AgendaItem} or the agenda item in the schedule by id
   */
  private toAgendaItem(agendaItemOrId: AgendaItem|number): AgendaItem|undefined {
    if (typeof agendaItemOrId === 'number') {
      return this.getAgendaItemById(agendaItemOrId);
    } else {
      return agendaItemOrId;
    }
  }

  /**
   *
   * @param key
   * @returns a {@link ResourceChannelMapData} which may have no items scheduled
   * NOTE: This adds a {@link ResourceChannelMapData} to the _agendaItemsByResourceChannelMap if not found
   */
  private getResourceChannelMapData(key: ResourceChannelMapKey): ResourceChannelMapData {
    let mapData = this._agendaItemsByResourceChannelMap.get(key);
    if (mapData == undefined) {
      mapData = new ResourceChannelMapData();
      this._agendaItemsByResourceChannelMap.set(key, mapData);
    }
    return mapData;
  }

  private getResourceChannelMapKey(resourceName: string, channelName: string): string {
    return `resourceName: ${resourceName}, channelName: ${channelName}`;
  }

  private timescaleNotSetError(): Error {
    return new TimescaleNotSet(`${this.constructor.name}.${this.setBounds.name}`);
  }

}

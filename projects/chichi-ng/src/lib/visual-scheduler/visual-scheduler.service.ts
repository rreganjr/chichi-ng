import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, ReplaySubject, Subject } from 'rxjs';
import { Duration, Interval, DateTime, DateInput } from 'luxon';
import { Timescale } from './timescale.model';
import { AgendaItem, AgendaItemLabeler } from './resource/agenda-box/agenda-item.model';
import { ToolEvent } from './toolbox/tool/tool-event.model';
import { AgendaItemConflicts } from './agenda-item-conflicts.error';
import { AgendaItemOutOfBounds } from './agenda-item-out-of-bounds.error';
import { TimescaleNotSet } from './timescale-not-set.error';
import { ResourceChannelNotValid } from './resource-channel-not-valid';

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

  /**
   * This marks all the subjects as complete, used for tests
   */
  public shutdown(): void {
    this._timescaleSubject.complete()
    this._toolEventsSubject.complete()
    this._agendaItemsSubject.complete()
  }

  /**
   * Used for testing
   */
  public get timescale() {
    return this._timescale
  }

  /**
   * Causes a {@link ToolEvent} START action to be dispatched on the ToolEvents$ observables
   * @param $event The {@link DragEvent} from the browser.
   * @param toolType The type of the tool being dragged as defined by the cc-tool element in the cc-toolbox of the cc-visual-scheduler
   */
  public dragStart($event: DragEvent, toolType: string): void {
    console.log(`dragStart: ${toolType}`, $event);
    this._toolEventsSubject.next(ToolEvent.newDragStartEvent(toolType, $event));
  }

  /**
   * Causes a {@link ToolEvent} END action to be dispatched on the ToolEvents$ observables
   * @param $event The {@link DragEvent} from the browser.
   * @param toolType The type of the tool being dragged as defined by the cc-tool element in the cc-toolbox of the cc-visual-scheduler
   */
   public dragEnd($event: DragEvent, toolType: string): void {
    console.log(`dragEnd: ${toolType}`, $event);
    this._toolEventsSubject.next(ToolEvent.newDragEndEvent(toolType, $event));
  }

  /**
   * Causes a {@link ToolEvent} EDIT action to be dispatched on the ToolEvents$ observables
   * NOTE: The host of the cc-visual-scheduler should open a viewer/editor for the supplied {@link AgendaItem}
   * @param agendaItemOrId - The {@link AgendaItem} or the id of the agenda item to remove
   * @param $event The {@link Event} from the browser.
   * @returns true if the {@link AgendaItem} exists and an event is dispatched
   */
   public openAgendaItemDetail(agendaItemOrId: AgendaItem|number, $event: Event): boolean {
    const agendaItem: AgendaItem|undefined = this.toAgendaItem(agendaItemOrId);
    if (agendaItem) {
      this._toolEventsSubject.next(ToolEvent.newEditEvent(agendaItem, $event));
      console.log(`open agenda item: ${agendaItem.label} in resource ${agendaItem.resourceName} channel ${agendaItem.channelName}`);
      return true;
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
   * @param resourceName the resource name to check
   * @param channelName the channel in the resource to check
   * @param startDate the start of the interval to find matching {@link AgendaItem}
   * @param endDate the end of the interval, inclusive, to find matching {@link AgendaItem}
   * @returns a list of {@link AgendaItem}s that intersect with the supplied date interval. The list may be empty.
   */
  public getIntersectingAgendaItems(resourceName: string, channelName: string, startDate: Date, endDate: Date): AgendaItem[] {
    return this.getResourceChannelMapData(this.getResourceChannelMapKey(resourceName, channelName))
      .agendaItems.filter((agendaItem) => agendaItem.bounds.intersection(Interval.fromDateTimes(startDate, endDate)) !== null);
  }

  /**
   * @param resourceName the resource name to check
   * @param channelName the channel in the resource to check
   * @returns true if the specified resource exists and the specified channel exists in the specified resource
   */
   public isResourceChannelExist(resourceName: string, channelName: string): boolean {
    return this._agendaItemsByResourceChannelMap.get(this.getResourceChannelMapKey(resourceName, channelName)) !== undefined;
  }

  /**
   *
   * @param resourceName the resource name to check
   * @param channelName the channel of the resource to check
   * @param startDate the date/time starting the interval
   * @param endDate the date/time ending the interval, inclusive
   * @returns true if the supplied resource and channel exist and the date interval doesn't contain any scheduled items in the specific resource and channel
   * @throws Error when the timescale is not defined yet
   */
  public isIntervalAvailable(resourceName: string, channelName: string, startDate: Date, endDate: Date): boolean {
    if (this._timescale == undefined) throw this.timescaleNotSetError();

    if (this.isResourceChannelExist(resourceName, channelName)) {
      const start = DateTime.fromJSDate(startDate);
      const end = DateTime.fromJSDate(endDate);
      return this.isIntervalInBounds(startDate, endDate) && this.getIntersectingAgendaItems(resourceName, channelName, startDate, endDate).length===0;
    }
    return false;
  }

  /**
   *
   * @param startDate the date/time starting the interval
   * @param endDate the date/time ending the interval, inclusive
   * @returns true if the supplied date interval is contained by the boundsInterval
   * @throws Error when the timescale is not defined yet
   */
  public isIntervalInBounds(startDate: Date, endDate: Date): boolean {
    if (this._timescale == undefined) throw this.timescaleNotSetError();

    const start = DateTime.fromJSDate(startDate);
    const end = DateTime.fromJSDate(endDate);
    return this._timescale.boundsInterval.contains(start) && (
      this._timescale.boundsInterval.contains(end) ||
      this._timescale.boundsInterval.end.equals(end)
    );
  }

  /**
   * Set the time bounds of the scheduler. adding an {@link AgendaItem} outside these
   * bounds is not allowed. scaling and panning the view outside these bounds is not allowed.
   * @param startDate the minimum date/time of scheduled agenda items as a Luxon {@link DateInput}.
   * @param endDate the maximum date/time of scheduled agenda items as a Luxon {@link DateInput}.
   */
  public setBounds(startDate: DateInput, endDate: DateInput): void {
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

  private _adjustOffsetToKeepViewportInbounds(bounds: Duration, offset: Duration, viewport: Duration): Duration {
    console.log(`_adjustOffsetToKeepViewportInbounds(bounds: = ${bounds.as('seconds')} seconds, offset = ${offset.as('seconds')} second, viewport = ${viewport.as('seconds')} seconds  ) `)
    if (bounds < offset.plus(viewport)) {
      offset = bounds.minus(viewport);
      console.log(`_adjustOffsetToKeepViewportInbounds() adjusted offset to ${offset.as('seconds')} seconds`);
    }
    return offset;
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
    console.log(`setViewportOffsetDuration(offset = ${offset.as('seconds')} seconds)`)
    if (this._timescale == undefined) throw this.timescaleNotSetError();
    if (offset.as('seconds') >= 0) {
      offset = this._adjustOffsetToKeepViewportInbounds(this._timescale.boundsInterval.toDuration(), offset, this._timescale.visibleDuration);
      if (!this._timescale.offsetDuration.equals(offset)) {
        console.log(`setViewportOffsetDuration() adjusted offset = ${offset.as('seconds')}`);
        this._timescale = new Timescale(this._timescale.boundsInterval, this._timescale.visibleDuration, offset);
        this._timescaleSubject.next(this._timescale);
      } else {
        console.log(`offset is the same, ignore`)
      }
    }
  }

  /**
   * Set the viewport {@link Duration}. The viewport must be less than or equal to the scheduler duration as
   * well as between {@link MIN_VIEWPORT_DURATION} and {@link MAX_VIEWPORT_DURATION} inclusive.
   *
   * The viewportOffsetDuration may also change to keep the viewportDuration inside the boundsInterval
   *
   * @param viewport - The viewport duration
   * @throws Error when the timescale is not defined yet or invalid
   */
  public setViewportDuration(viewport: Duration): void {
    console.log(`setViewportDuration(duration = ${viewport.as('seconds')} seconds)`)
    if (this._timescale == undefined) throw this.timescaleNotSetError();

    if (viewport < VisualSchedulerService.MIN_VIEWPORT_DURATION) {
      viewport = VisualSchedulerService.MIN_VIEWPORT_DURATION;
    } else if (viewport > VisualSchedulerService.MAX_VIEWPORT_DURATION) {
      viewport = VisualSchedulerService.MAX_VIEWPORT_DURATION;
    }

    // adjust the offset so the viewport stays in the scheduler bounds
    let offset: Duration = this._adjustOffsetToKeepViewportInbounds(this._timescale.boundsInterval.toDuration(), this._timescale.offsetDuration, viewport);

    this._timescale = new Timescale(this._timescale.boundsInterval, viewport, offset);
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
  public addAgendaItem(resourceName: string, channelName: string, startDate: Date, endDate: Date, data: object, labeler: AgendaItemLabeler<any>): AgendaItem {
    if (this._timescale == undefined) throw this.timescaleNotSetError();
    if (this.isResourceChannelExist(resourceName, channelName)) {
      const newItemInterval = Interval.fromDateTimes(startDate, endDate);
      if (this.isIntervalAvailable(resourceName, channelName, startDate, endDate)) {
        const agendaItem = new AgendaItem(resourceName, channelName, newItemInterval, data, labeler);
        this._agendaItemsById.set(agendaItem.id, agendaItem);
        this._agendaItems.push(agendaItem);
        this._agendaItemsSubject.next(this._agendaItems);

        const mapData = this.getResourceChannelMapData(this.getResourceChannelMapKey(resourceName, channelName));
        mapData.agendaItems.push(agendaItem);
        mapData.subject.next(mapData.agendaItems);
        return agendaItem;
      } else {
        console.log(`failed to add resourceName=${resourceName}, channelName=${channelName} agendaItem=${labeler(data)} `);
        const conflictingItems: AgendaItem[] = this.getIntersectingAgendaItems(resourceName, channelName, startDate, endDate);
        if (conflictingItems.length > 0) {
          throw  new AgendaItemConflicts(newItemInterval, conflictingItems);
        } else {
          throw new AgendaItemOutOfBounds(newItemInterval, this._timescale.boundsInterval);
        }
      }
    } else {
      throw new ResourceChannelNotValid(resourceName, channelName);
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
        // TODO: maybe just use id?
        return item.resourceName === agendaItem.resourceName &&
          item.channelName === agendaItem.channelName &&
          item.bounds.equals(agendaItem.bounds) &&
          item.id === agendaItem.id
      })
      if (index > -1) {
        this._agendaItemsById.delete(agendaItem.id);
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
        this._toolEventsSubject.next(ToolEvent.newDeleteEvent(agendaItem));
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

  /**
   * @param resourceName the name of the resource to look up
   * @param channelName the name of the channel in the specified resource
   * @returns A {@link ResourceChannelMapKey} to lookup the {@link ResourceChannelMapData}
   */
  private getResourceChannelMapKey(resourceName: string, channelName: string): ResourceChannelMapKey {
    return `resourceName: ${resourceName}, channelName: ${channelName}`;
  }

  private timescaleNotSetError(): Error {
    return new TimescaleNotSet(`${this.constructor.name}.${this.setBounds.name}`);
  }

}

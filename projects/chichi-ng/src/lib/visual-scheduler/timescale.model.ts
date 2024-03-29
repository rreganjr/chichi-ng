import { DateTime, DateTimeUnit, Duration, DurationUnit, Interval } from "luxon";
import { TimescaleValidator } from "./timescale-validator.util";
import { Utils } from "./utils";

/**
 * The {@link Timescale} defines the boundaries of when items can be scheduled in the scheduler and
 * the boundaries of what is visible in the scheduler.
 *
 * It also defines the {@link TimelineComponent} boundaries, the primary units and sub-unit marks on
 * the timeline.
 */
export class Timescale {
    public static readonly DEFAULT_VISIBLE_DURATION:Duration = Duration.fromDurationLike({hours: 12});
    public static readonly DEFAULT_OFFSET_DURATION:Duration = Duration.fromDurationLike({hours: 0});
    public static readonly MAX_VISIBLE_DURATION_FOR_HOUR_BASED_PRIMARY_DATE_TIME_UNIT: Duration = Duration.fromDurationLike({hours: 3*24});
    public static readonly HOUR_DATETIME_UNIT: DateTimeUnit = 'hour';
    public static readonly DAY_DATETIME_UNIT: DateTimeUnit = 'day';

    /**
     *
     * @param _boundsInterval The min and max date range in the visual scheduler
     * @param _visibleDuration The duration visible in the scheduler
     * @param _offsetDuration The duration from the start of the bounds to what is visible, i.e. the point of time at the start of the visible hours
     */
    constructor(
        private _boundsInterval: Interval,
        private _visibleDuration: Duration = Timescale.DEFAULT_VISIBLE_DURATION,
        private _offsetDuration:  Duration = Timescale.DEFAULT_OFFSET_DURATION
    ) {
        TimescaleValidator.checkBoundsInterval(_boundsInterval);
        TimescaleValidator.checkVisibleDuration(_boundsInterval, _visibleDuration);
        TimescaleValidator.checkOffsetDuration(_boundsInterval, _offsetDuration);
        TimescaleValidator.checkVisibleDurationWithOffsetDurationToBounds(_boundsInterval, _visibleDuration, _offsetDuration);
    }

    /**
     * The schedule boundaries, items can't be scheduled out of this range.
     */
    public get boundsInterval(): Interval {
        return this._boundsInterval;
    }

    /**
     * @param dateTime - the dateTime to check if it is outside the schedule boundaries
     * @returns true if the supplied dateTime is >= schedule boundaries start and < the schedule boundaries end
     */
     isOutOfBounds(dateTime: DateTime): boolean {
        return ! this._boundsInterval.contains(dateTime);
    }

    /**
     * The {@link Duration} from the start of the schedule boundaries to the visible time in the scheduler
     */
    public get offsetDuration(): Duration {
        return this._offsetDuration;
    }

    /**
     * The {@link Duration} of time visible in the scheduler
     */
     public get visibleDuration(): Duration {
        return this._visibleDuration;
    }

    /**
     * @returns The {@link Interval} of schedulable time visible in the scheduler.
     */
     public get visibleBounds(): Interval {
        const start:DateTime = this._boundsInterval.start.plus(this._offsetDuration);
        const end:DateTime = start.plus(this._visibleDuration);
        const visibleBounds = Interval.fromDateTimes(start, end);
        console.log(`Timescale.visibleBounds() => ${visibleBounds}`);
        return visibleBounds;
    }

    /**
     * The timeline should start at the beginning of a unit to make it easier to read, for example if the start of
     * the bounds is 1:15 PM and the view size is 7 days, having the timelines show 1:15 PM 7 times is harder to read
     * than if the time line starts at the beginning of the day and shows the dates marked for each day.
     *
     * NOTE: this will vary based on the {@link Duration} visible
     *
     * @returns a {@link DateTimeUnit} indicating when the timeline starts, for example start of day or hour
     */
    public get primaryDateTimeUnit(): DateTimeUnit {
        if (this._visibleDuration.as('seconds') <= Timescale.MAX_VISIBLE_DURATION_FOR_HOUR_BASED_PRIMARY_DATE_TIME_UNIT.as('seconds')) {
            return Timescale.HOUR_DATETIME_UNIT;
        } else {
            return Timescale.DAY_DATETIME_UNIT;
        }
    }

    public get onePrimaryDateTimeUnitDuration(): Duration {
        if (Timescale.HOUR_DATETIME_UNIT === this.primaryDateTimeUnit) {
            return Duration.fromDurationLike({hours: 1});
        } else {
           return Duration.fromDurationLike({days: 1});
        }

    }

    /**
     * This is the first time unit (hour or day) visible in the timeline equal to or less than the start of the
     * schedule boundaries.
     * @returns the {@link DateTime} of the first {@link DateTimeUnit} in the {@link Timescale#visibleDuration}
     */
     public get startOfVisibleTimeline(): DateTime {
        return this._boundsInterval.start.plus(this._offsetDuration).startOf(this.primaryDateTimeUnit);
    }

    /**
     * This is the last time unit (hour or day) visible in the timeline equal to or greater than the end of the
     * schedule boundaries.
     * @returns the {@link DateTime} of the last {@link DateTimeUnit} in the {@link Timescale#visibleDuration}
     */
     public get endOfVisibleTimeline(): DateTime {
        return this.startOfVisibleTimeline.plus(this._visibleDuration).plus(this.onePrimaryDateTimeUnitDuration).startOf(this.primaryDateTimeUnit);
    }

    /**
     * @returns the {@link Interval} of the visible timeline
     */
     public get visibleTimelineBounds(): Interval {
        return Interval.fromDateTimes(this.startOfVisibleTimeline, this.endOfVisibleTimeline);
    }

    /**
     * @returns the Interval before the start of the boundsInterval starting at the primary DateTime unit before the boundsInterval and ending at the boundsInterval start. Note it may have a duration of 0 and the duration will always be less than one primary datetime unit.
     */
     public get outOfBoundsStartInterval(): Interval {
        return Interval.fromDateTimes(this._boundsInterval.start.startOf(this.primaryDateTimeUnit), this._boundsInterval.start);
    }

    /**
     * The duration from where the timeline starts versus the schedule bounds start
     * given the {@link Timescale#primaryDateTimeUnit}.
     *
     * <strong>
     * NOTE: Super Important!!!: if comparing always use seconds! A duration of 1 Hour <> a duration of 60 Minutes
     * even though they are the same amount of time.
     * </strong>
     *
     * @example
     *   // bounds start: 1/1/2020 12:14 pm
     *   // visible duration 1 day -> startAtDateTimeUnit = hour
     *   // timeline starts at 1/1/2020 12:00 pm
     *   this.outOfBoundsStartDuration
     *   // returns 840 seconds (14 minutes in seconds)
     * @example
     *   // bounds start: 1/1/2020 12:14 pm
     *   // visible duration 1 week -> startAtDateTimeUnit = day
     *   // timeline starts at 1/1/2020 12:00 am
     *   this.outOfBoundsStartDuration
     *   // returns 44,040 seconds (12 hours and 14 minutes in seconds)
     */
    public get outOfBoundsStartDurationSeconds(): Duration {
        return this.getOutOfBoundsStartDuration('seconds');
    }

    public getOutOfBoundsStartDuration(unit: DurationUnit) {
        return this.outOfBoundsStartInterval.toDuration(unit);
    }

    /**
     * @returns The area adjacently after the boundInterval end to the start of the next primary DateTime unit
     */
     public get outOfBoundsEndInterval(): Interval {
        return Interval.fromDateTimes(this._boundsInterval.end, this._boundsInterval.end.plus(this.onePrimaryDateTimeUnitDuration).startOf(this.primaryDateTimeUnit));
    }

    /**
     * The duration from where the schedule bounds end and the time line ends. NOTE: the duration is set in seconds
     */
     public get outOfBoundsEndDurationSeconds(): Duration {
        return this.getOutOfBoundsEndDuration('seconds');
    }

    public getOutOfBoundsEndDuration(unit: DurationUnit) {
        return this.outOfBoundsEndInterval.toDuration(unit);
    }
}

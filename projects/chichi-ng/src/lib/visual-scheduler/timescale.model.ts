import { Duration, Interval } from "luxon";

export class Timescale {
 
    constructor(
        private _boundsInterval: Interval, // The min and max date range in the visual scheduler
        private _visibleDuration: Duration = Duration.fromDurationLike({hours: 12}), // The duration visible in the scheduler
        private _offsetDuration:  Duration = Duration.fromDurationLike({hours: 0}) // The duration from the start of the bounds to what is visible, i.e. the point of time at the start of the visible hours
    ) {
        // TODO: validate
    }

    public get boundsInterval(): Interval {
        return this._boundsInterval;
    }

    public get visibleDuration(): Duration {
        return this._visibleDuration;
    }

    public get offsetDuration(): Duration {
        return this._offsetDuration;
    }
}

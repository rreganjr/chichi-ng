import { Interval } from "luxon";

export class Timescale {
 
    constructor(
        private _boundsInterval: Interval, // The min and max date range in the visual scheduler
        private _visibleHours: number = 0, // The number of hours visible in the scheduler
        private _offsetHours: number = 0 // The number of hours from the start of the bounds to what is visible, i.e. the point of time at the start of the visible hours
    ) {
        // TODO: validate
    }

    public get boundsInterval(): Interval {
        return this._boundsInterval;
    }

    public get visibleHours(): number {
        return this._visibleHours;
    }

    public get offsetHours(): number {
        return this._offsetHours;
    }
}

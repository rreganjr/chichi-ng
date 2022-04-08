import { Interval } from "luxon";

export class AgendaItemOutOfBounds extends Error {
    public readonly newItemInterval: Interval;
    public readonly schedulerBounds: Interval;

    constructor(newItemInterval: Interval, schedulerBounds: Interval) {
        super(AgendaItemOutOfBounds.createMessage(newItemInterval, schedulerBounds))
        this.newItemInterval = newItemInterval;
        this.schedulerBounds = schedulerBounds;
    }

    private static createMessage(newItemInterval: Interval, schedulerBounds: Interval): string {
        return `OutOfBounds. The AgendaItem  start=${newItemInterval.start} end=${newItemInterval.end} is out of bounds start=${schedulerBounds.start} end=${schedulerBounds.end}`;
    }
}

import { AgendaItem } from "./resource/agenda-box/agenda-item.model";
import { Interval } from "luxon";

export class AgendaItemConflicts extends Error {
    public readonly conflictingInterval: Interval;
    public readonly conflictingItems: AgendaItem[];

    constructor(newItemInterval: Interval, conflictingItems: AgendaItem[]) {
        super(AgendaItemConflicts.createMessage(newItemInterval, conflictingItems));
        this.conflictingInterval = newItemInterval;
        this.conflictingItems = conflictingItems;
    }

    private static createMessage(newItemInterval: Interval, conflictingItems: AgendaItem[]): string {
        return conflictingItems.map((item) => {
            return `item:${item.label} in ${item.resourceName} : ${item.channelName} start=${item.bounds.start} end=${item.bounds.end}`
          }).reduce((collector: string, newVal: string) => `${collector} ${newVal}`, 
            `Conflicts. The AgendaItem start=${newItemInterval.start} end=${newItemInterval.end} conflicts with `);
    }
}

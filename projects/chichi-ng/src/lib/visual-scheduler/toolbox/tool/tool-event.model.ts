import { AgendaItem } from "../../resource/agenda-box/agenda-item.model";

export class ToolEvent {
    private static nextId: number = 1;
    public static readonly CLEAR = new ToolEvent('CLEAR');

    public static newDragStartEvent(toolType: string, event: DragEvent): ToolEvent {
        return new ToolEvent('START', toolType, event);
    }

    public static newDragEndEvent(toolType: string, event: DragEvent): ToolEvent {
        return new ToolEvent('END', toolType, event);
    }

    public static newEditEvent(agendaItem: AgendaItem, event: Event): ToolEvent {
        return new ToolEvent('EDIT', agendaItem.channelName, event, agendaItem);
    }

    public static newDeleteEvent(agendaItem: AgendaItem): ToolEvent {
        return new ToolEvent('DELETE', agendaItem.channelName, null, agendaItem);
    }

    public readonly id: number;

    protected constructor(
        public readonly action: 'CLEAR'|'START'|'END'|'EDIT'|'DELETE',
        public readonly toolType: string = '',
        public readonly event: DragEvent|Event|null = null,
        public readonly agendaItem: AgendaItem|null = null
    ) {
        this.id = ToolEvent.nextId++;
    }

    public isStart(): boolean {
        return this.action === 'START';
    }

    public isEnd(): boolean {
        return this.action === 'END';
    }

    public isClear(): boolean {
        return this.action === 'CLEAR';
    }

    public isEdit(): boolean {
        return this.action === 'EDIT';
    }

    public isDelete(): boolean {
        return this.action === 'DELETE';
    }    
}

export class ToolEvent {
    public static readonly CLEAR = new ToolEvent('CLEAR', null);
    
    constructor(
        public readonly toolType: string,
        public readonly event: Event|null
    ) {}
}

export class ToolEvent {
    public static readonly CLEAR = new ToolEvent('CLEAR');
    
    constructor(
        public readonly action: 'CLEAR'|'START'|'END'|'DROP',
        public readonly toolType: string = '',
        public readonly event: DragEvent|null = null
    ) {}

    public isStart(): boolean {
        return this.action === 'START';
    }

    public isEnd(): boolean {
        return this.action === 'END';
    }

    public isClear(): boolean {
        return this.action === 'CLEAR';
    }

    public isDrop(): boolean {
        return this.action === 'DROP';
    }
}

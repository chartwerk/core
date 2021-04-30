declare const _default: {
    props: {
        id: {
            type: StringConstructor;
            required: boolean;
        };
        series: {
            type: ArrayConstructor;
            required: boolean;
            default: () => any[];
        };
        options: {
            type: ObjectConstructor;
            required: boolean;
            default: () => {};
        };
    };
    watch: {
        id(): void;
        series(): void;
        options(): void;
    };
    mounted(): void;
    methods: {
        render(): void;
        renderChart(): void;
        renderSharedCrosshair(values: {
            x?: number;
            y?: number;
        }): void;
        appendEvents(): void;
        zoomIn(range: any): void;
        zoomOut(centers: any): void;
        mouseMove(evt: any): void;
        mouseOut(): void;
        onLegendClick(idx: any): void;
        panningEnd(range: any): void;
        panning(range: any): void;
        contextMenu(evt: any): void;
        sharedCrosshairMove(event: any): void;
    };
};
export default _default;

export declare type Margin = {
    top: number;
    right: number;
    bottom: number;
    left: number;
};
export declare type TimeSerie = {
    target: string;
    datapoints: [number, number][];
    alias?: string;
    visible?: boolean;
    color?: string;
};
export declare type Options = {
    margin?: Margin;
    confidence?: number;
    eventsCallbacks?: {
        zoomIn: (range: [AxisRange, AxisRange]) => void;
        panning: (range: [AxisRange, AxisRange]) => void;
        panningEnd: (range: [AxisRange, AxisRange]) => void;
        zoomOut: (center: number) => void;
        mouseMove: (evt: any) => void;
        mouseOut: () => void;
        onLegendClick: (idx: number) => void;
        onLegendLabelClick: (idx: number) => void;
        contextMenu: (evt: any) => void;
    };
    axis?: {
        x?: {
            format: AxisFormat;
            range?: [number, number];
            invert?: boolean;
            valueFormatter?: (value: any) => string;
        };
        y?: {
            format: AxisFormat;
            range?: [number, number];
            invert?: boolean;
            valueFormatter?: (value: any) => string;
        };
    };
    crosshair?: {
        orientation?: CrosshairOrientation;
        color?: string;
    };
    timeInterval?: {
        timeFormat?: TimeFormat;
        count?: number;
    };
    tickFormat?: {
        xAxis?: string;
        xTickOrientation?: TickOrientation;
    };
    labelFormat?: {
        xAxis?: string;
        yAxis?: string;
    };
    bounds?: {
        upper: string;
        lower: string;
    };
    timeRange?: {
        from: number;
        to: number;
    };
    zoom?: {
        type?: ZoomType;
        orientation?: ZoomOrientation;
        transform?: boolean;
        y?: [number, number];
        x?: [number, number];
    };
    renderTicksfromTimestamps?: boolean;
    renderYaxis?: boolean;
    renderXaxis?: boolean;
    renderGrid?: boolean;
    renderLegend?: boolean;
    renderCrosshair?: boolean;
    usePanning?: boolean;
};
export declare type AxisRange = [number, number] | undefined;
export declare type VueOptions = Omit<Options, 'eventsCallbacks'>;
export declare enum TickOrientation {
    VERTICAL = "vertical",
    HORIZONTAL = "horizontal",
    DIAGONAL = "diagonal"
}
export declare enum TimeFormat {
    SECOND = "second",
    MINUTE = "minute",
    HOUR = "hour",
    DAY = "day",
    MONTH = "month",
    YEAR = "year"
}
export declare enum ZoomOrientation {
    VERTICAL = "vertical",
    HORIZONTAL = "horizontal",
    BOTH = "both"
}
export declare enum ZoomType {
    BRUSH = "brush",
    SCROLL = "scroll",
    NONE = "none"
}
export declare enum AxisFormat {
    TIME = "time",
    NUMERIC = "numeric",
    STRING = "string",
    CUSTOM = "custom"
}
export declare enum CrosshairOrientation {
    VERTICAL = "vertical",
    HORIZONTAL = "horizontal",
    BOTH = "both"
}

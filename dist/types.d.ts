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
    yOrientation?: yAxisOrientation;
};
export declare type Options = {
    margin?: Margin;
    confidence?: number;
    eventsCallbacks?: {
        zoomIn: (range: AxisRange[]) => void;
        panning: (event: {
            ranges: AxisRange[];
            d3Event: any;
        }) => void;
        panningEnd: (range: AxisRange[]) => void;
        zoomOut: (centers: {
            x: number;
            y: number;
        }) => void;
        mouseMove: (evt: any) => void;
        mouseOut: () => void;
        onLegendClick: (idx: number) => void;
        onLegendLabelClick: (idx: number) => void;
        contextMenu: (evt: any) => void;
        sharedCrosshairMove: (event: any) => void;
    };
    axis?: {
        x?: AxisOption;
        y?: AxisOption;
        y1?: AxisOption;
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
    zoomEvents?: {
        mouse?: {
            zoom?: {
                isActive: boolean;
                keyEvent?: KeyEvent;
                orientation?: BrushOrientation;
            };
            pan?: {
                isActive: boolean;
                keyEvent?: KeyEvent;
                orientation?: PanOrientation;
            };
        };
        scroll?: {
            zoom?: {
                isActive: boolean;
                keyEvent?: KeyEvent;
            };
            pan?: {
                isActive: boolean;
                keyEvent?: KeyEvent;
                panStep?: number;
                orientation?: ScrollPanOrientation;
            };
        };
    };
    renderTicksfromTimestamps?: boolean;
    renderGrid?: boolean;
    renderLegend?: boolean;
    renderCrosshair?: boolean;
};
export declare type AxisOption = {
    isActive?: boolean;
    ticksCount?: number;
    format?: AxisFormat;
    range?: [number, number];
    invert?: boolean;
    valueFormatter?: (value: number, i: number) => string;
    colorFormatter?: (value: number, i: number) => string;
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
export declare enum BrushOrientation {
    VERTICAL = "vertical",
    HORIZONTAL = "horizontal",
    RECTANGLE = "rectangle",
    SQUARE = "square"
}
export declare enum PanOrientation {
    VERTICAL = "vertical",
    HORIZONTAL = "horizontal",
    BOTH = "both"
}
export declare enum ScrollPanOrientation {
    VERTICAL = "vertical",
    HORIZONTAL = "horizontal"
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
export declare type SvgElementAttributes = {
    x: number;
    y: number;
    width: number;
    height: number;
};
export declare enum KeyEvent {
    MAIN = "main",
    SHIFT = "shift"
}
export declare enum xAxisOrientation {
    TOP = "top",
    BOTTOM = "bottom",
    BOTH = "both"
}
export declare enum yAxisOrientation {
    LEFT = "left",
    RIGHT = "right",
    BOTH = "both"
}

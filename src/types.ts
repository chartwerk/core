export type Margin = { top: number, right: number, bottom: number, left: number };
// TODO: Pods can render not only "time" series
export type TimeSerie = {
  target: string,
  datapoints: [number, number][],
  alias?: string,
  visible?: boolean,
  color?: string,
  yOrientation?: yAxisOrientation,
};
// TODO: move some options to line-chart
export type Options = {
  margin?: Margin;
  confidence?: number;
  eventsCallbacks?: {
    zoomIn: (range: AxisRange[]) => void,
    panning: (range: AxisRange[]) => void,
    panningEnd: (range: AxisRange[]) => void,
    zoomOut: (centers: {x: number, y: number}) => void,
    mouseMove: (evt: any) => void,
    mouseOut: () => void,
    onLegendClick: (idx: number) => void,
    onLegendLabelClick: (idx: number) => void,
    contextMenu: (evt: any) => void, // the same name as in d3.events
    sharedCrosshairMove: (event: any) => void
  };
  axis?: {
    x?: AxisOption,
    y?: AxisOption,
    y1?: AxisOption
  };
  crosshair?: {
    orientation?: CrosshairOrientation;
    color?: string;
  }
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
    from: number,
    to: number
  };
  zoomEvents?: {
    mouse: {
      zoom: { // same as brush
        isActive: boolean;
        keyEvent: KeyEvent; // main(or base, or smth) / shift / alt / etc
        orientation?: BrushOrientation; // to BrushOrientation: vertical, horizaontal, square, rectange
      },
      pan: {
        isActive: boolean;
        keyEvent: KeyEvent; // main(or base, or smth) / shift / alt / etc
        orientation?: PanOrientation;
      },
    },
    scroll: {
      zoom: {
        isActive: boolean;
        keyEvent?: KeyEvent;
      },
      pan: {
        isActive: boolean;
        keyEvent?: KeyEvent;
        panStep?: number;
        orientation?: ScrollPanOrientation;
      },
    },
  }
  renderTicksfromTimestamps?: boolean;
  renderGrid?: boolean;
  renderLegend?: boolean;
  renderCrosshair?: boolean;
};
export type AxisOption = {
  isActive?: boolean;
  ticksCount?: number;
  format: AxisFormat;
  range?: [number, number];
  invert?: boolean;
  valueFormatter?: (value: number, i: number) => string;
}
export type AxisRange = [number, number] | undefined;
export type VueOptions = Omit<Options, 'eventsCallbacks'>;
export enum TickOrientation {
  VERTICAL = 'vertical',
  HORIZONTAL = 'horizontal',
  DIAGONAL = 'diagonal'
}
export enum TimeFormat {
  SECOND = 'second',
  MINUTE = 'minute',
  HOUR = 'hour',
  DAY = 'day',
  MONTH = 'month',
  YEAR = 'year'
}
export enum BrushOrientation {
  VERTICAL = 'vertical',
  HORIZONTAL = 'horizontal',
  RECTANGLE = 'rectangle',
  SQUARE = 'square'
}
export enum PanOrientation {
  VERTICAL = 'vertical',
  HORIZONTAL = 'horizontal',
  BOTH = 'both',
}
export enum ScrollPanOrientation {
  VERTICAL = 'vertical',
  HORIZONTAL = 'horizontal',
}
export enum AxisFormat {
  TIME = 'time',
  NUMERIC = 'numeric',
  STRING = 'string',
  CUSTOM = 'custom'
}
export enum CrosshairOrientation {
  VERTICAL = 'vertical',
  HORIZONTAL = 'horizontal',
  BOTH = 'both'
}
export type SvgElementAttributes = {
  x: number,
  y: number,
  width: number,
  height: number
}
export enum KeyEvent {
  MAIN = 'main',
  SHIFT = 'shift'
}
// allow series values to affect a specific axis
export enum xAxisOrientation {
  TOP = 'top',
  BOTTOM = 'bottom',
  BOTH = 'both'
}
export enum yAxisOrientation {
  LEFT = 'left',
  RIGHT = 'right',
  BOTH = 'both'
}

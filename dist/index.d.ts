import VueChartwerkPodMixin from './VueChartwerkPodMixin';
import { PodState } from './state';
import { Margin, TimeSerie, Options, TickOrientation, TimeFormat, BrushOrientation, AxisFormat, SvgElementAttributes, KeyEvent, PanOrientation } from './types';
import { palette } from './colors';
import * as d3 from 'd3';
declare abstract class ChartwerkPod<T extends TimeSerie, O extends Options> {
    protected readonly el: HTMLElement;
    protected readonly series: T[];
    protected d3Node?: d3.Selection<HTMLElement, unknown, null, undefined>;
    protected chartContainer?: d3.Selection<SVGGElement, unknown, null, undefined>;
    protected customOverlay?: d3.Selection<SVGRectElement, unknown, null, undefined>;
    protected crosshair?: d3.Selection<SVGGElement, unknown, null, undefined>;
    protected brush?: d3.BrushBehavior<unknown>;
    protected zoom?: any;
    protected svg?: d3.Selection<SVGElement, unknown, null, undefined>;
    protected state?: PodState;
    protected clipPath?: any;
    protected isPanning: boolean;
    protected isBrushing: boolean;
    protected brushStartSelection: [number, number] | null;
    private _clipPathUID;
    protected readonly options: O;
    protected readonly d3: typeof d3;
    constructor(_d3: typeof d3, el: HTMLElement, series: T[], _options: O);
    render(): void;
    protected abstract renderMetrics(): void;
    protected abstract onMouseOver(): void;
    protected abstract onMouseOut(): void;
    protected abstract onMouseMove(): void;
    abstract renderSharedCrosshair(timestamp: number): void;
    abstract hideSharedCrosshair(): void;
    protected initPodState(): void;
    protected renderSvg(): void;
    protected renderGrid(): void;
    protected renderXAxis(): void;
    protected renderYAxis(): void;
    protected formatYAxisTicks(value: d3.NumberValue): string;
    protected renderCrosshair(): void;
    protected addEvents(): void;
    protected initBrush(): void;
    protected filterByKeyEvent(key: KeyEvent): () => boolean;
    protected initPan(): void;
    protected initScrollZoom(): void;
    protected renderClipPath(): void;
    protected renderLegend(): void;
    protected renderYLabel(): void;
    protected renderXLabel(): void;
    protected renderNoDataPointsMessage(): void;
    protected onPanningZoom(event: d3.D3ZoomEvent<any, any>): void;
    protected onPanningEnd(): void;
    protected onBrush(): void;
    protected getSelectionAttrs(selection: number[][]): SvgElementAttributes | undefined;
    protected onBrushStart(): void;
    protected onBrushEnd(): void;
    protected scrollZoomed(): void;
    protected zoomOut(): void;
    get absXScale(): d3.ScaleLinear<number, number>;
    get absYScale(): d3.ScaleLinear<number, number>;
    get xScale(): d3.ScaleLinear<number, number>;
    get yScale(): d3.ScaleLinear<number, number>;
    get minValue(): number;
    get maxValue(): number;
    get minValueX(): number;
    get maxValueX(): number;
    get axisBottomWithTicks(): d3.Axis<number | Date | {
        valueOf(): number;
    }>;
    get ticksCount(): d3.TimeInterval | number;
    getd3TimeRangeEvery(count: number): d3.TimeInterval;
    get serieTimestampRange(): number | undefined;
    get xAxisTicksFormat(): (d: any) => any;
    get timeInterval(): number;
    get xTickTransform(): string;
    get extraMargin(): Margin;
    get width(): number;
    get height(): number;
    get legendRowPositionY(): number;
    get margin(): Margin;
    get isSeriesUnavailable(): boolean;
    formatedBound(alias: string, target: string): string;
    protected getSerieColor(idx: number): string;
    protected get seriesTargetsWithBounds(): any[];
    protected get visibleSeries(): any[];
    protected get rectClipId(): string;
    isOutOfChart(): boolean;
}
export { ChartwerkPod, VueChartwerkPodMixin, Margin, TimeSerie, Options, TickOrientation, TimeFormat, BrushOrientation, PanOrientation, AxisFormat, palette };

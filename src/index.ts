import VueChartwerkPodMixin from './VueChartwerkPodMixin';
import { PodState } from './state';

import styles from './css/style.css';

import {
  Margin,
  TimeSerie,
  Options,
  TickOrientation,
  TimeFormat,
  BrushOrientation,
  AxisFormat,
  CrosshairOrientation,
  SvgElementAttributes,
  KeyEvent,
  PanOrientation,
  yAxisOrientation,
  ScrollPanOrientation,
  AxisOption
} from './types';
import { uid } from './utils';
import { palette } from './colors';

// we import only d3 types here
import * as d3 from 'd3';

import defaultsDeep from 'lodash/defaultsDeep';
import includes from 'lodash/includes';
import first from 'lodash/first';
import last from 'lodash/last';
import mergeWith from 'lodash/mergeWith';
import min from 'lodash/min';
import minBy from 'lodash/minBy';
import max from 'lodash/max';
import maxBy from 'lodash/maxBy';
import add from 'lodash/add';
import replace from 'lodash/replace';
import reverse from 'lodash/reverse';
import sortBy from 'lodash/sortBy';
import cloneDeep from 'lodash/cloneDeep';
import debounce from 'lodash/debounce';


const DEFAULT_MARGIN: Margin = { top: 30, right: 20, bottom: 20, left: 30 };
const DEFAULT_TICK_COUNT = 4;
const DEFAULT_TICK_SIZE = 2;
const MILISECONDS_IN_MINUTE = 60 * 1000;
const DEFAULT_AXIS_RANGE = [0, 1];
const DEFAULT_SCROLL_PAN_STEP = 50;
const DEFAULT_OPTIONS: Options = {
  confidence: 0,
  timeInterval: {
    timeFormat: TimeFormat.MINUTE
  },
  tickFormat: {
    xAxis: '%H:%M',
    xTickOrientation: TickOrientation.HORIZONTAL
  },
  zoomEvents: {
    mouse: {
      zoom: {
        isActive: true,
        keyEvent: KeyEvent.MAIN,
        orientation: BrushOrientation.HORIZONTAL
      },
      pan: {
        isActive: true,
        keyEvent: KeyEvent.SHIFT,
        orientation: PanOrientation.HORIZONTAL
      },
    },
    scroll: {
      zoom: {
        isActive: true,
        keyEvent: KeyEvent.MAIN,
      },
      pan: {
        isActive: false,
        keyEvent: KeyEvent.SHIFT,
        panStep: DEFAULT_SCROLL_PAN_STEP,
        orientation: ScrollPanOrientation.HORIZONTAL,
      },
    },
  },
  axis: {
    x: {
      isActive: true,
      ticksCount: DEFAULT_TICK_COUNT,
      format: AxisFormat.TIME
    },
    y: {
      isActive: true,
      ticksCount: DEFAULT_TICK_COUNT,
      format: AxisFormat.NUMERIC
    },
    y1: {
      isActive: false,
      ticksCount: DEFAULT_TICK_COUNT,
      format: AxisFormat.NUMERIC
    }
  },
  grid: {
    x: {
      isActive: true,
      ticksCount: 5,
    },
    y: {
      isActive: true,
      ticksCount: 5,
    },
  },
  crosshair: {
    orientation: CrosshairOrientation.VERTICAL,
    color: 'red'
  },
  renderTicksfromTimestamps: false,
  renderLegend: true,
}

abstract class ChartwerkPod<T extends TimeSerie, O extends Options> {
  protected d3Node?: d3.Selection<HTMLElement, unknown, null, undefined>;
  protected chartContainer?: d3.Selection<SVGGElement, unknown, null, undefined>;
  protected customOverlay?: d3.Selection<SVGRectElement, unknown, null, undefined>;
  protected crosshair?: d3.Selection<SVGGElement, unknown, null, undefined>;
  protected brush?: d3.BrushBehavior<unknown>;
  protected zoom?: any;
  protected svg?: d3.Selection<SVGElement, unknown, null, undefined>;
  protected state?: PodState;
  protected clipPath?: any;
  protected isPanning = false;
  protected isBrushing = false;
  protected brushStartSelection: [number, number] | null = null;
  protected initScaleX?: d3.ScaleLinear<any, any>;
  protected initScaleY?: d3.ScaleLinear<any, any>;
  protected initScaleY1?: d3.ScaleLinear<any, any>;
  protected xAxisElement?: d3.Selection<SVGGElement, unknown, null, undefined>;
  protected yAxisElement?: d3.Selection<SVGGElement, unknown, null, undefined>;
  protected y1AxisElement?: d3.Selection<SVGGElement, unknown, null, undefined>;
  protected yAxisTicksColors?: string[] = [];
  private _clipPathUID = '';
  protected series: T[];
  protected options: O;
  protected readonly d3: typeof d3;
  protected deltaYTransform = 0;
  protected debouncedRender = debounce(this.render.bind(this), 100);

  // TODO: test variables instead of functions with cache
  private _xScale: d3.ScaleLinear<number, number> | null = null;
  private _yScale: d3.ScaleLinear<number, number> | null = null;
  private _y1Scale: d3.ScaleLinear<number, number> | null = null;

  constructor(
    // maybe it's not the best idea
    _d3: typeof d3,
    protected readonly el: HTMLElement,
    _series: T[] = [],
    _options: O
  ) {
    // TODO: test if it's necessary
    styles.use();

    let options = cloneDeep(_options);
    defaultsDeep(options, DEFAULT_OPTIONS);
    this.options = options;
    this.series = cloneDeep(_series);
    this.d3 = _d3;

    // TODO: mb move it to render();
    this.initPodState();

    this.d3Node = this.d3.select(this.el);
    this.addEventListeners();
  }

  protected addEventListeners(): void {
    window.addEventListener('resize', this.debouncedRender);
  }

  protected removeEventListeners(): void {
    window.removeEventListener('resize', this.debouncedRender);
  }

  public render(): void {
    this.clearScaleCache();

    this.renderSvg();
    this.renderAxes();
    this.renderGrid();

    this.renderClipPath();
    this.addEvents();

    this.renderCrosshair();
    this.renderMetrics();

    this.renderLegend();
    this.renderYLabel();
    this.renderXLabel();
  }

  public updateData(series?: T[], options?: O, shouldRerender = true): void {
    this.updateSeries(series);
    this.updateOptions(options);
    if(shouldRerender) {
      this.render();
    }
  }

  protected updateOptions(newOptions: O): void {
    if(newOptions === undefined) {
      return;
    }
    let options = cloneDeep(newOptions);
    defaultsDeep(options, DEFAULT_OPTIONS);
    this.options = options;
    
  }

  protected updateSeries(newSeries: T[]): void {
    if(newSeries === undefined) {
      return;
    }
    let series = cloneDeep(newSeries);
    this.series = series;
  }

  protected abstract renderMetrics(): void;
  protected abstract onMouseOver(): void;
  protected abstract onMouseOut(): void;
  protected abstract onMouseMove(): void;
  public abstract renderSharedCrosshair(values: { x?: number, y?: number }): void;
  public abstract hideSharedCrosshair(): void;

  protected initPodState() {
    this.state = new PodState(this.options);
  }

  protected renderSvg(): void {
    this.d3Node.select('svg').remove();
    this.svg = this.d3Node
      .append('svg')
      .style('width', '100%')
      .style('height', '100%')
      .style('backface-visibility', 'hidden');
    this.chartContainer = this.svg
      .append('g')
        .attr('transform', `translate(${this.margin.left},${this.margin.top})`);
  }

  protected renderGrid(): void {
    this.chartContainer.selectAll('.grid').remove();

    if(this.options.grid.x.isActive) {
      this.chartContainer
        .append('g')
        .attr('transform', `translate(0,${this.height})`)
        .attr('class', 'grid x-grid')
        .style('pointer-events', 'none')
        .call(
          this.d3.axisBottom(this.xScale)
            .ticks(this.options.grid.x.ticksCount)
            .tickSize(-this.height)
            .tickFormat(() => '')
        );
    }

    if(this.options.grid.y.isActive) {
      this.chartContainer
        .append('g')
        .attr('class', 'grid y-grid')
        .style('pointer-events', 'none')
        .call(
          this.d3.axisLeft(this.yScale)
            .ticks(this.options.grid.y.ticksCount)
            .tickSize(-this.width)
            .tickFormat(() => '')
        );
    }

    this.chartContainer.selectAll('.grid').selectAll('.tick')
      .attr('opacity', '0.5');

    this.chartContainer.selectAll('.grid').select('.domain')
      .style('pointer-events', 'none');
  }

  protected renderAxes(): void {
    // TODO: remove duplicates
    this.renderXAxis();
    this.renderYAxis();
    this.renderY1Axis();
  }

  protected renderXAxis(): void {
    if(this.options.axis.x.isActive === false) {
      return;
    }
    this.chartContainer.select('#x-axis-container').remove();
    this.xAxisElement = this.chartContainer
      .append('g')
      .attr('transform', `translate(0,${this.height})`)
      .attr('id', 'x-axis-container')
      .style('pointer-events', 'none')
      .call(
        this.d3.axisBottom(this.xScale)
          .ticks(this.options.axis.x.ticksCount)
          .tickSize(DEFAULT_TICK_SIZE)
          .tickFormat(this.getAxisTicksFormatter(this.options.axis.x))
      );
    this.chartContainer.select('#x-axis-container').selectAll('.tick').selectAll('text')
      .style('transform', this.xTickTransform);
  }

  protected renderYAxis(): void {
    if(this.options.axis.y.isActive === false) {
      return;
    }
    this.chartContainer.select('#y-axis-container').remove();
    this.yAxisTicksColors = [];
    this.yAxisElement = this.chartContainer
      .append('g')
      .attr('id', 'y-axis-container')
      .style('pointer-events', 'none')
      // TODO: number of ticks shouldn't be hardcoded
      .call(
        this.d3.axisLeft(this.yScale)
          .ticks(this.options.axis.y.ticksCount)
          .tickSize(DEFAULT_TICK_SIZE)
          .tickFormat(this.getAxisTicksFormatter(this.options.axis.y))
      );
    const ticks = this.yAxisElement.selectAll(`.tick`).select('text').nodes();
    this.yAxisTicksColors.map((color, index) => {
      if(ticks === undefined || ticks[index] === undefined) {
        return;
      }
      this.d3.select(ticks[index]).attr('color', color);
    });
  }

  protected renderY1Axis(): void {
    if(this.options.axis.y1.isActive === false) {
      return;
    }
    this.chartContainer.select('#y1-axis-container').remove();
    this.y1AxisElement = this.chartContainer
      .append('g')
      .attr('id', 'y1-axis-container')
      .attr('transform', `translate(${this.width},0)`)
      .style('pointer-events', 'none')
      // TODO: number of ticks shouldn't be hardcoded
      .call(
        this.d3.axisRight(this.y1Scale)
          .ticks(DEFAULT_TICK_COUNT)
          .tickSize(DEFAULT_TICK_SIZE)
          .tickFormat(this.getAxisTicksFormatter(this.options.axis.y1))
      );
  }

  protected renderCrosshair(): void {
    this.crosshair = this.chartContainer.append('g')
      .attr('id', 'crosshair-container')
      .style('display', 'none');

    if(
      this.options.crosshair.orientation === CrosshairOrientation.VERTICAL ||
      this.options.crosshair.orientation === CrosshairOrientation.BOTH
    ) {
      this.crosshair.append('line')
        .attr('class', 'crosshair-line')
        .attr('id', 'crosshair-line-x')
        .attr('fill', this.options.crosshair.color)
        .attr('stroke', this.options.crosshair.color)
        .attr('stroke-width', '1px')
        .attr('y1', 0)
        .attr('y2', this.height)
        .style('pointer-events', 'none');
    }
    if(
      this.options.crosshair.orientation === CrosshairOrientation.HORIZONTAL ||
      this.options.crosshair.orientation === CrosshairOrientation.BOTH
    ) {
      this.crosshair.append('line')
        .attr('class', 'crosshair-line')
        .attr('id', 'crosshair-line-y')
        .attr('fill', this.options.crosshair.color)
        .attr('stroke', this.options.crosshair.color)
        .attr('stroke-width', '1px')
        .attr('x1', 0)
        .attr('x2', this.width)
        .style('pointer-events', 'none');
    }
  }

  protected addEvents(): void {
    // TODO: refactor for a new mouse/scroll events
    const panKeyEvent = this.options.zoomEvents.mouse.pan.keyEvent;
    const isPanActive = this.options.zoomEvents.mouse.pan.isActive;
    if(isPanActive === true && panKeyEvent === KeyEvent.MAIN) {
      this.initPan();
      this.initBrush();
    } else {
      this.initBrush();
      this.initPan();
    }

    this.chartContainer
      .on('mouseover', this.onMouseOver.bind(this))
      .on('mouseout', this.onMouseOut.bind(this))
      .on('mousemove', this.onMouseMove.bind(this))
      .on('dblclick.zoom', this.zoomOut.bind(this));
  }

  protected initBrush(): void {
    const isBrushActive = this.options.zoomEvents.mouse.zoom.isActive;
    if(isBrushActive === false) {
      return;
    }
    switch(this.options.zoomEvents.mouse.zoom.orientation) {
      case BrushOrientation.VERTICAL:
        this.brush = this.d3.brushY();
        break;
      case BrushOrientation.HORIZONTAL:
        this.brush = this.d3.brushX();
        break;
      case BrushOrientation.SQUARE:
      case BrushOrientation.RECTANGLE:
        this.brush = this.d3.brush();
        break;
      default:
        this.brush = this.d3.brushX();
    }
    const keyEvent = this.options.zoomEvents.mouse.zoom.keyEvent;
    this.brush.extent([
        [0, 0],
        [this.width, this.height]
      ])
      .handleSize(20)
      // TODO: brush selection is hidden if keyEvent is shift
      .filter(this.filterByKeyEvent(keyEvent))
      .on('start', this.onBrushStart.bind(this))
      .on('brush', this.onBrush.bind(this))
      .on('end', this.onBrushEnd.bind(this));

    this.chartContainer.call(this.brush);
  }

  protected filterByKeyEvent(key: KeyEvent): () => boolean {
    // TODO: refactor
    switch(key) {
      case KeyEvent.MAIN:
        return () => !this.d3.event.shiftKey;
      case KeyEvent.SHIFT:
        return () => this.d3.event.shiftKey;
      default:
        throw new Error(`Unknown type of KeyEvent: ${key}`);
    }
  }

  protected isD3EventKeyEqualOption(event: d3.D3ZoomEvent<any, any>, optionsKeyEvent: KeyEvent): boolean {
    if(!event || !event.sourceEvent) {
      return false;
    }
    const isShiftKey = event.sourceEvent.shiftKey;
    const isOptionShift = optionsKeyEvent === KeyEvent.SHIFT;
    return isShiftKey === isOptionShift;
  }

  protected initPan(): void {
    if(
      this.options.zoomEvents.mouse.pan.isActive === false &&
      this.options.zoomEvents.scroll.pan.isActive === false &&
      this.options.zoomEvents.scroll.zoom.isActive === false
    ) {
      return;
    }
    if(this.options.zoomEvents.mouse.zoom.isActive === false) {
      // init cumstom overlay to handle all events
      this.customOverlay = this.chartContainer.append('rect')
        .attr('class', 'custom-overlay')
        .attr('width', this.width)
        .attr('height', this.height)
        .attr('x', 0)
        .attr('y', 0)
        .attr('pointer-events', 'all')
        .attr('cursor', 'crosshair')
        .attr('fill', 'none');
    }

    this.initScaleX = this.xScale.copy();
    this.initScaleY = this.yScale.copy();
    if(this.options.axis.y1.isActive === true) {
      this.initScaleY1 = this.y1Scale.copy();
    }
    const pan = this.d3.zoom()
      .on('zoom', this.onPanning.bind(this))
      .on('end', this.onPanningEnd.bind(this));

    this.chartContainer.call(pan);
  }

  protected renderClipPath(): void {
    this.clipPath = this.chartContainer.append('defs').append('SVG:clipPath')
      .attr('id', this.rectClipId)
      .append('SVG:rect')
      .attr('width', this.width)
      .attr('height', this.height)
      .attr('x', 0)
      .attr('y', 0);
  }

  protected renderLegend(): void {
    if(this.options.renderLegend === false) {
      return;
    }
    if(this.series.length > 0) {
      let legendRow = this.chartContainer
        .append('g')
        .attr('class', 'legend-row');
      for(let idx = 0; idx < this.series.length; idx++) {
        if(includes(this.seriesTargetsWithBounds, this.series[idx].target)) {
          continue;
        }
        let node = legendRow.selectAll('text').node();
        let rowWidth = 0;
        if(node !== null) {
          rowWidth = legendRow.node().getBBox().width + 25;
        }

        const isChecked = this.series[idx].visible !== false;
        legendRow.append('foreignObject')
          .attr('x', rowWidth)
          .attr('y', this.legendRowPositionY - 12)
          .attr('width', 13)
          .attr('height', 15)
          .html(`<form><input type=checkbox ${isChecked? 'checked' : ''} /></form>`)
          .on('click', () => {
            this.options.eventsCallbacks.onLegendClick(idx);
          });

        legendRow.append('text')
          .attr('x', rowWidth + 20)
          .attr('y', this.legendRowPositionY)
          .attr('class', `metric-legend-${idx}`)
          .style('font-size', '12px')
          .style('fill', this.getSerieColor(idx))
          .text(this.series[idx].target)
          .on('click', () => {
            this.options.eventsCallbacks.onLegendLabelClick(idx);
          });
      }
    }
  }

  protected renderYLabel(): void {
    if(this.options.labelFormat === undefined || this.options.labelFormat.yAxis === undefined) {
      return;
    }
    this.chartContainer.append('text')
      .attr('y', 0 - this.margin.left)
      .attr('x', 0 - (this.height / 2))
      .attr('dy', '1em')
      .attr('class', 'y-axis-label')
      .attr('transform', 'rotate(-90)')
      .style('text-anchor', 'middle')
      .style('font-size', '14px')
      .style('fill', 'currentColor')
      .text(this.options.labelFormat.yAxis);
  }

  protected renderXLabel(): void {
    if(this.options.labelFormat === undefined || this.options.labelFormat.xAxis === undefined) {
      return;
    }
    let yPosition = this.height + this.margin.top + this.margin.bottom - 35;
    if(this.series.length === 0) {
      yPosition += 20;
    }
    this.chartContainer.append('text')
      .attr('class', 'x-axis-label')
      .attr('x', this.width / 2)
      .attr('y', yPosition)
      .style('text-anchor', 'middle')
      .style('font-size', '14px')
      .style('fill', 'currentColor')
      .text(this.options.labelFormat.xAxis);
  }

  protected renderNoDataPointsMessage(): void {
    this.chartContainer.append('text')
      .attr('class', 'alert-text')
      .attr('x', this.width / 2)
      .attr('y', this.height / 2)
      .style('text-anchor', 'middle')
      .style('font-size', '14px')
      .style('fill', 'currentColor')
      .text('No data points');
  }

  protected onPanning(): void {
    const event = this.d3.event;
    if(event.sourceEvent === null || event.sourceEvent === undefined) {
      return;
    }
    this.rescaleMetricAndAxis(event);

    if(this.options.eventsCallbacks !== undefined && this.options.eventsCallbacks.panning !== undefined) {
      this.options.eventsCallbacks.panning({
        ranges: [this.state.xValueRange, this.state.yValueRange, this.state.y1ValueRange],
        d3Event: event
      });
    } else {
      console.log('on panning, but there is no callback');
    }
  }

  public rescaleMetricAndAxis(event: d3.D3ZoomEvent<any, any>): void {
    this.isPanning = true;
    this.onMouseOut();

    this.onPanningRescale(event);

    const shouldClearState = false;
    this.clearScaleCache(shouldClearState);
    this.renderYAxis();
    this.renderXAxis();

    // metrics-rect wrapper is required for panning
    this.chartContainer.select('.metrics-rect')
      .attr('transform', `translate(${this.state.transform.x},${this.state.transform.y}), scale(${this.state.transform.k})`);
  }

  protected onPanningRescale(event: d3.D3ZoomEvent<any, any>): void {
    // rescale metrics and axis on mouse and scroll panning
    const eventType = event.sourceEvent.type; // 'wheel' or 'mousemove'
    const scrollPanOptions = this.options.zoomEvents.scroll.pan;
    const scrollZoomOptions = this.options.zoomEvents.scroll.zoom;
    // TODO: maybe use switch and move it to onPanning
    if(eventType === 'wheel') {
      if(scrollPanOptions.isActive === true && this.isD3EventKeyEqualOption(event, scrollPanOptions.keyEvent)) {
        this.onScrollPanningRescale(event);
        return;
      }
      if(scrollZoomOptions.isActive === true && this.isD3EventKeyEqualOption(event, scrollZoomOptions.keyEvent)) {
        this.state.transform = { k: event.transform.k };
      }
    }

    const panOrientation = this.options.zoomEvents.mouse.pan.orientation;
    if(panOrientation === PanOrientation.HORIZONTAL || panOrientation === PanOrientation.BOTH) {
      this.state.transform = { x: event.transform.x };
      const rescaleX = this.d3.event.transform.rescaleX(this.initScaleX);
      this.xAxisElement.call(this.d3.axisBottom(this.xScale).scale(rescaleX));
      this.state.xValueRange = [rescaleX.invert(0), rescaleX.invert(this.width)];
    }
    if(panOrientation === PanOrientation.VERTICAL || panOrientation === PanOrientation.BOTH) {
      this.state.transform = { y: event.transform.y };
      const rescaleY = this.d3.event.transform.rescaleY(this.initScaleY);
      this.yAxisElement.call(this.d3.axisLeft(this.yScale).scale(rescaleY));
      this.state.yValueRange = [rescaleY.invert(0), rescaleY.invert(this.height)];
      if(this.y1AxisElement) {
        const rescaleY1 = this.d3.event.transform.rescaleY(this.initScaleY1);
        this.y1AxisElement.call(this.d3.axisLeft(this.y1Scale).scale(rescaleY1));
        this.state.y1ValueRange = [rescaleY1.invert(0), rescaleY1.invert(this.height)];
        // TODO: y1 axis jumps on panning
        this.y1AxisElement.selectAll('line').attr('x2', 2);
        this.y1AxisElement.selectAll('text').attr('x', 5);
      }
    }
  }

  protected onScrollPanningRescale(event: d3.D3ZoomEvent<any, any>): void {
    const scrollPanOptions = this.options.zoomEvents.scroll.pan;
    // TODO: event.transform.y / x depends on mouse position, so we use hardcoded const, which should be removed
    const transformStep = scrollPanOptions.panStep;
    const scrollPanOrientation = scrollPanOptions.orientation;
    switch(scrollPanOrientation) {
      case ScrollPanOrientation.HORIZONTAL:
        // @ts-ignore
        const signX = Math.sign(event.transform.x);
        const transformX = this.absXScale.invert(Math.abs(transformStep));
        let rangeX = this.state.xValueRange;
        if(this.state.xValueRange === undefined) {
          rangeX = [this.maxValueX, this.minValueX];
        }
        this.state.xValueRange = [rangeX[0] + signX * transformX, rangeX[1] + signX * transformX];
        const translateX = this.state.transform.x + signX * transformStep;
        this.state.transform = { x: translateX };
        break;
      case ScrollPanOrientation.VERTICAL:
        const deltaY = Math.min(Math.abs(event.sourceEvent.deltaY), this.height * 0.1);
        // @ts-ignore
        let signY = Math.sign(event.transform.y);
        if(this.options.axis.y.invert === true) {
          signY = -signY;
        }
        let rangeY = this.state.yValueRange || [this.maxValue, this.minValue];
        const transformY = this.absYScale.invert(deltaY);
        this.deltaYTransform = this.deltaYTransform + deltaY;
        // TODO: not hardcoded bounds
        if(this.deltaYTransform > this.height * 0.9) {
          return;
        }
        this.state.yValueRange = [rangeY[0] - signY * transformY, rangeY[1] - signY * transformY];
        const translateY = this.state.transform.y + signY * deltaY;
        this.state.transform = { y: translateY };
        // TODO: add y1 rescale
        break;
      default:
        throw new Error(`Unknown type of scroll pan orientation: ${scrollPanOrientation}`);
    }
  }

  protected onPanningEnd(): void {
    this.isPanning = false;
    this.deltaYTransform = 0;
    this.onMouseOut();
    if(this.options.eventsCallbacks !== undefined && this.options.eventsCallbacks.panningEnd !== undefined) {
      this.options.eventsCallbacks.panningEnd([this.state.xValueRange, this.state.yValueRange, this.state.y1ValueRange]);
    } else {
      console.log('on panning end, but there is no callback');
    }
  }

  protected onBrush(): void {
    const selection = this.d3.event.selection;
    if(this.options.zoomEvents.mouse.zoom.orientation !== BrushOrientation.SQUARE || selection === null) {
      return;
    }
    const selectionAtts = this.getSelectionAttrs(selection);
    if(selectionAtts === undefined) {
      return;
    }
    this.chartContainer.select('.selection')
      .attr('x', selectionAtts.x)
      .attr('y', selectionAtts.y)
      .attr('width', selectionAtts.width)
      .attr('height', selectionAtts.height);
  }

  protected getSelectionAttrs(selection: number[][]): SvgElementAttributes | undefined {
    if(this.brushStartSelection === null || selection === undefined || selection === null) {
      return undefined;
    }
    const startX = this.brushStartSelection[0];
    const startY = this.brushStartSelection[1];
    const x0 = selection[0][0];
    const x1 = selection[1][0];
    const y0 = selection[0][1];
    const y1 = selection[1][1];
    const xRange = x1 - x0;
    const yRange = y1 - y0;
    const minWH = Math.min(xRange, yRange);
    const x = x0 === startX ? startX : startX - minWH;
    const y = y0 === startY ? startY : startY - minWH;
    return {
      x, y, width: minWH, height: minWH
    }
  }

  protected onBrushStart(): void {
    // TODO: move to state
    this.isBrushing === true;
    const selection = this.d3.event.selection;
    if(selection !== null && selection.length > 0) {
      this.brushStartSelection = this.d3.event.selection[0];
    }
    this.onMouseOut();
  }

  protected onBrushEnd(): void {
    const extent = this.d3.event.selection;
    this.isBrushing === false;
    if(extent === undefined || extent === null || extent.length < 2) {
      return;
    }
    this.chartContainer
      .call(this.brush.move, null);

    let xRange: [number, number];
    let yRange: [number, number];
    switch(this.options.zoomEvents.mouse.zoom.orientation) {
      case BrushOrientation.HORIZONTAL:
        const startTimestamp = this.xScale.invert(extent[0]);
        const endTimestamp = this.xScale.invert(extent[1]);
        if(Math.abs(endTimestamp - startTimestamp) < this.timeInterval) {
          return;
        }
        xRange = [startTimestamp, endTimestamp];
        this.state.xValueRange = xRange;
        break;
      case BrushOrientation.VERTICAL:
        const upperY = this.yScale.invert(extent[0]);
        const bottomY = this.yScale.invert(extent[1]);
        // TODO: add min zoom y
        yRange = [upperY, bottomY];
        this.state.yValueRange = yRange;
        break;
      case BrushOrientation.RECTANGLE:
        const bothStartTimestamp = this.xScale.invert(extent[0][0]);
        const bothEndTimestamp = this.xScale.invert(extent[1][0]);
        const bothUpperY = this.yScale.invert(extent[0][1]);
        const bothBottomY = this.yScale.invert(extent[1][1]);
        xRange = [bothStartTimestamp, bothEndTimestamp];
        yRange = [bothUpperY, bothBottomY];
        this.state.xValueRange = xRange;
        this.state.yValueRange = yRange;
        break;
      case BrushOrientation.SQUARE:
        const selectionAtts = this.getSelectionAttrs(extent);
        if(selectionAtts === undefined) {
          break;
        }
        const scaledX0 = this.xScale.invert(selectionAtts.x);
        const scaledX1 = this.xScale.invert(selectionAtts.x + selectionAtts.width);
        const scaledY0 = this.yScale.invert(selectionAtts.y);
        const scaledY1 = this.yScale.invert(selectionAtts.y + selectionAtts.height);
        xRange = [scaledX0, scaledX1];
        yRange = [scaledY0, scaledY1];
        this.state.xValueRange = xRange;
        this.state.yValueRange = yRange;
        this.brushStartSelection = null;
    }

    if(this.options.eventsCallbacks !== undefined && this.options.eventsCallbacks.zoomIn !== undefined) {
      this.options.eventsCallbacks.zoomIn([xRange, yRange]);
    } else {
      console.log('zoom in, but there is no callback');
    }
  }

  protected zoomOut(): void {
    if(this.isOutOfChart() === true) {
      return;
    }
    let xAxisMiddleValue: number = this.xScale.invert(this.width / 2);
    let yAxisMiddleValue: number = this.yScale.invert(this.height / 2);
    const centers = {
      x: xAxisMiddleValue,
      y: yAxisMiddleValue
    }
    if(this.options.eventsCallbacks !== undefined && this.options.eventsCallbacks.zoomOut !== undefined) {
      this.options.eventsCallbacks.zoomOut(centers);
    } else {
      console.log('zoom out, but there is no callback');
    }
  }

  get absXScale(): d3.ScaleLinear<number, number> {
    const domain = [0, Math.abs(this.maxValueX - this.minValueX)];
    return this.d3.scaleLinear()
      .domain(domain)
      .range([0, this.width]);
  }

  get absYScale(): d3.ScaleLinear<number, number> {
    const domain = [0, Math.abs(this.maxValue - this.minValue)];
    return this.d3.scaleLinear()
      .domain(domain)
      .range([0, this.height]);
  }

  get xScale(): d3.ScaleLinear<number, number> {
    if(this._xScale === null) {
      const domain = this.state.xValueRange || [this.minValueX, this.maxValueX];
      this._xScale = this.d3.scaleLinear()
        .domain(domain)
        .range([0, this.width]);
    }
    return this._xScale;
  }

  get yScale(): d3.ScaleLinear<number, number> {
    if(this._yScale === null) {
      let domain = this.state.yValueRange || [this.maxValue, this.minValue];
      domain = sortBy(domain) as [number, number];
      if(this.options.axis.y.invert === true) {
        domain = reverse(domain);
      }
      this._yScale = this.d3.scaleLinear()
        .domain(domain)
        .range([this.height, 0]); // inversed, because d3 y-axis goes from top to bottom
    }
    return this._yScale;
  }

  protected get y1Scale(): d3.ScaleLinear<number, number> {
    if(this.isSeriesUnavailable || this.options.axis.y1 === undefined || this.options.axis.y1.isActive === false) {
      return null;
    }
    // scale for y1 axis(right y axis)
    if(this._y1Scale === null) {
      let domain = this.state.y1ValueRange || [this.y1MaxValue, this.y1MinValue];
      domain = sortBy(domain) as [number, number];
      if(this.options.axis.y1.invert === true) {
        domain = reverse(domain);
      }
      this._y1Scale = this.d3.scaleLinear()
        .domain(domain)
        .range([this.height, 0]); // inversed, because d3 y-axis goes from top to bottom
    }
    return this._y1Scale;
  }

  filterSerieByYAxisOrientation(serie: T, orientation: yAxisOrientation): boolean {
    if(serie.yOrientation === undefined || serie.yOrientation === yAxisOrientation.BOTH) {
      return true;
    }
    return serie.yOrientation === orientation;
  }

  get minValue(): number {
    // y min value
    if(this.isSeriesUnavailable) {
      return DEFAULT_AXIS_RANGE[0];
    }
    if(this.options.axis.y !== undefined && this.options.axis.y.range !== undefined) {
      return min(this.options.axis.y.range);
    }
    const minValue = min(
      this.series
        .filter(serie => serie.visible !== false && this.filterSerieByYAxisOrientation(serie, yAxisOrientation.LEFT))
        .map(
          serie => minBy<number[]>(serie.datapoints, dp => dp[0])[0]
        )
    );
    return minValue;
  }

  get maxValue(): number {
    // y max value
    if(this.isSeriesUnavailable) {
      return DEFAULT_AXIS_RANGE[1];
    }
    if(this.options.axis.y !== undefined && this.options.axis.y.range !== undefined) {
      return max(this.options.axis.y.range);
    }
    const maxValue = max(
      this.series
        .filter(serie => serie.visible !== false && this.filterSerieByYAxisOrientation(serie, yAxisOrientation.LEFT))
        .map(
          serie => maxBy<number[]>(serie.datapoints, dp => dp[0])[0]
        )
    );
    return maxValue;
  }

  get y1MinValue(): number {
    // TODO: remove duplicates
    if(this.isSeriesUnavailable || this.options.axis.y1 === undefined || this.options.axis.y1.isActive === false) {
      return DEFAULT_AXIS_RANGE[0];
    }
    if(this.options.axis.y1.range !== undefined) {
      return min(this.options.axis.y1.range);
    }
    const minValue = min(
      this.series
        .filter(serie => serie.visible !== false && this.filterSerieByYAxisOrientation(serie, yAxisOrientation.RIGHT))
        .map(
          serie => minBy<number[]>(serie.datapoints, dp => dp[0])[0]
        )
    );
    return minValue;
  }

  get y1MaxValue(): number {
    if(this.isSeriesUnavailable || this.options.axis.y1 === undefined || this.options.axis.y1.isActive === false) {
      return DEFAULT_AXIS_RANGE[1];
    }
    if(this.options.axis.y1 !== undefined && this.options.axis.y1.range !== undefined) {
      return max(this.options.axis.y1.range);
    }
    const maxValue = max(
      this.series
        .filter(serie => serie.visible !== false && this.filterSerieByYAxisOrientation(serie, yAxisOrientation.RIGHT))
        .map(
          serie => maxBy<number[]>(serie.datapoints, dp => dp[0])[0]
        )
    );
    return maxValue;
  }

  get minValueX(): number {
    if(this.isSeriesUnavailable) {
      return DEFAULT_AXIS_RANGE[0];
    }

    if(this.options.axis.x !== undefined && this.options.axis.x.range !== undefined) {
      return min(this.options.axis.x.range)
    }
    const minValue = min(
      this.series
        .filter(serie => serie.visible !== false)
        .map(
          serie => minBy<number[]>(serie.datapoints, dp => dp[1])[1]
        )
    );
    return minValue;
  }

  get maxValueX(): number {
    if(this.isSeriesUnavailable) {
      return DEFAULT_AXIS_RANGE[1];
    }
    if(this.options.axis.x !== undefined && this.options.axis.x.range !== undefined) {
      return max(this.options.axis.x.range)
    }
    const maxValue = max(
      this.series
        .filter(serie => serie.visible !== false)
        .map(
          serie => maxBy<number[]>(serie.datapoints, dp => dp[1])[1]
        )
    );
    return maxValue;
  }

  getd3TimeRangeEvery(count: number): d3.TimeInterval {
    if(this.options.timeInterval === undefined || this.options.timeInterval.timeFormat === undefined) {
      return this.d3.timeMinute.every(count);
    }
    switch(this.options.timeInterval.timeFormat) {
      case TimeFormat.SECOND:
        return this.d3.utcSecond.every(count);
      case TimeFormat.MINUTE:
        return this.d3.utcMinute.every(count);
      case TimeFormat.HOUR:
        return this.d3.utcHour.every(count);
      case TimeFormat.DAY:
        return this.d3.utcDay.every(count);
      case TimeFormat.MONTH:
        return this.d3.utcMonth.every(count);
      case TimeFormat.YEAR:
        return this.d3.utcYear.every(count);
      default:
        return this.d3.utcMinute.every(count);
    }
  }

  get serieTimestampRange(): number | undefined {
    if(this.series.length === 0) {
      return undefined;
    }
    const startTimestamp = first(this.series[0].datapoints)[1];
    const endTimestamp = last(this.series[0].datapoints)[1];
    return (endTimestamp - startTimestamp) / 1000;
  }

  getAxisTicksFormatter(axisOptions: AxisOption): (d: any, i: number) => any {
    // TODO: ticksCount === 0 -> suspicious option
    if(axisOptions.ticksCount === 0) {
      return (d) => '';
    }
    switch(axisOptions.format) {
      case AxisFormat.TIME:
        // TODO: customize time format?
        return this.d3.timeFormat('%m/%d %H:%M');
      case AxisFormat.NUMERIC:
        return (d) => d;
      case AxisFormat.STRING:
        // TODO: add string/symbol format
        throw new Error(`Not supported AxisFormat type ${axisOptions.format} yet`);
      case AxisFormat.CUSTOM:
        if(axisOptions.valueFormatter === undefined) {
          console.warn(`Value formatter for axis is not defined. Path options.axis.{?}.valueFormatter`);
          return (d) => d;
        }
        return (d, i) => { 
          if(axisOptions.colorFormatter !== undefined) {
            this.yAxisTicksColors.push(axisOptions.colorFormatter(d, i))
          }
          return axisOptions.valueFormatter(d, i)
        };
      default:
        throw new Error(`Unknown time format for axis: ${axisOptions.format}`);
    }
  }

  get timeInterval(): number {
    if(this.series !== undefined && this.series.length > 0 && this.series[0].datapoints.length > 1) {
      const interval = this.series[0].datapoints[1][1] - this.series[0].datapoints[0][1];
      return interval;
    }
    if(this.options.timeInterval !== undefined && this.options.timeInterval.count !== undefined) {
      //TODO: timeFormat to timestamp
      return this.options.timeInterval.count * MILISECONDS_IN_MINUTE;
    }
    return MILISECONDS_IN_MINUTE;
  }

  get xTickTransform(): string {
    if(this.options.tickFormat === undefined || this.options.tickFormat.xTickOrientation === undefined) {
      return '';
    }
    switch (this.options.tickFormat.xTickOrientation) {
      case TickOrientation.VERTICAL:
        return 'translate(-10px, 50px) rotate(-90deg)';
      case TickOrientation.HORIZONTAL:
        return '';
      case TickOrientation.DIAGONAL:
        return 'translate(-30px, 30px) rotate(-45deg)';
      default:
        return '';
    }
  }

  get extraMargin(): Margin {
    let optionalMargin = { top: 0, right: 0, bottom: 0, left: 0 };
    if(this.options.tickFormat !== undefined && this.options.tickFormat.xTickOrientation !== undefined) {
      switch (this.options.tickFormat.xTickOrientation) {
        case TickOrientation.VERTICAL:
          optionalMargin.bottom += 80;
          break;
        case TickOrientation.HORIZONTAL:
          break;
        case TickOrientation.DIAGONAL:
          optionalMargin.left += 15;
          optionalMargin.bottom += 50;
          optionalMargin.right += 10;
          break;
      }
    }
    if(this.options.labelFormat !== undefined) {
      if(this.options.labelFormat.xAxis !== undefined && this.options.labelFormat.xAxis.length > 0) {
        optionalMargin.bottom += 20;
      }
      if(this.options.labelFormat.yAxis !== undefined && this.options.labelFormat.yAxis.length > 0) {
        optionalMargin.left += 20;
      }
    }
    if(this.series.length > 0) {
      optionalMargin.bottom += 25;
    }
    return optionalMargin;
  }

  get width(): number {
    return this.d3Node.node().clientWidth - this.margin.left - this.margin.right;
  }

  get height(): number {
    return this.d3Node.node().clientHeight - this.margin.top - this.margin.bottom;
  }

  get legendRowPositionY(): number {
    return this.height + this.margin.bottom - 5;
  }

  get margin(): Margin {
    if(this.options.margin !== undefined) {
      return this.options.margin;
    }
    return mergeWith({}, DEFAULT_MARGIN, this.extraMargin, add);
  }

  get isSeriesUnavailable(): boolean {
    // TODO: Use one && throw error
    return this.series === undefined || this.series.length === 0 ||
      max(this.series.map(serie => serie.datapoints.length)) === 0;
  }

  formatedBound(alias: string, target: string): string {
    const confidenceMetric = replace(alias, '$__metric_name', target);
    return confidenceMetric;
  }

  protected clearScaleCache(shouldClearState = true): void {
    this._xScale = null;
    this._yScale = null;
    this._y1Scale = null;
    if(shouldClearState) {
      this.state.xValueRange = undefined;
      this.state.yValueRange = undefined;
      this.state.y1ValueRange = undefined;
      this.state.transform = { x: 0, y: 0, k: 1 };
    }
  }

  protected getSerieColor(idx: number): string {
    if(this.series[idx] === undefined) {
      throw new Error(
        `Can't get color for unexisting serie: ${idx}, there are only ${this.series.length} series`
      );
    }
    let serieColor = this.series[idx].color;
    if(serieColor === undefined) {
      serieColor = palette[idx % palette.length];
    }
    return serieColor;
  }

  protected get seriesTargetsWithBounds(): any[] {
    if(
      this.options.bounds === undefined ||
      this.options.bounds.upper === undefined ||
      this.options.bounds.lower === undefined
    ) {
      return [];
    }
    let series = [];
    this.series.forEach(serie => {
      series.push(this.formatedBound(this.options.bounds.upper, serie.target));
      series.push(this.formatedBound(this.options.bounds.lower, serie.target));
    });
    return series;
  }

  protected get visibleSeries(): any[] {
    return this.series.filter(serie => serie.visible !== false);
  }

  protected get rectClipId(): string {
    if(this._clipPathUID.length === 0) {
      this._clipPathUID = uid();
    }
    return this._clipPathUID;
  }

  isOutOfChart(): boolean {
    const event = this.d3.mouse(this.chartContainer.node());
    const eventX = event[0];
    const eventY = event[1];
    if(
      eventY > this.height + 1 || eventY < -1 ||
      eventX > this.width || eventX < 0
    ) {
      return true;
    }
    return false;
  }
}

export {
  ChartwerkPod, VueChartwerkPodMixin,
  Margin, TimeSerie, Options, TickOrientation, TimeFormat, BrushOrientation, PanOrientation,
  AxisFormat, yAxisOrientation, CrosshairOrientation, ScrollPanOrientation, KeyEvent,
  palette
};

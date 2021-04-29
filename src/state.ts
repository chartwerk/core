import { Options, TimeFormat, TickOrientation, AxisFormat } from './types';

import lodashGet from 'lodash/get';
import cloneDeep from 'lodash/cloneDeep';


const DEFAULT_TRANSFORM = {
  x: 0,
  y: 0,
  k: 1
}

export class PodState {
  private _xValueRange: [number, number] | undefined = undefined;
  private _yValueRange: [number, number] | undefined = undefined;
  private _y1ValueRange: [number, number] | undefined = undefined;
  private _transform: { x: number, y: number, k: number } = cloneDeep(DEFAULT_TRANSFORM);

  constructor(
    options: Options
  ) {
    this._xValueRange = lodashGet(options, 'axis.x.range');
    this._yValueRange = lodashGet(options, 'axis.y.range');
    this._y1ValueRange = lodashGet(options, 'axis.y1.range');
  }

  get xValueRange(): [number, number] | undefined {
    return this._xValueRange;
  }

  get yValueRange(): [number, number] | undefined {
    return this._yValueRange;
  }

  get y1ValueRange(): [number, number] | undefined {
    return this._y1ValueRange;
  }

  get transform(): { x?: number, y?: number, k?: number } {
    return this._transform;
  }

  set xValueRange(range: [number, number]) {
    this._xValueRange = range;
  }

  set yValueRange(range: [number, number]) {
    this._yValueRange = range;
  }

  set y1ValueRange(range: [number, number]) {
    this._y1ValueRange = range;
  }

  set transform(transform: { x?: number, y?: number, k?: number }) {
    this._transform.x = transform.x || this._transform.x;
    this._transform.y = transform.y || this._transform.y;
    this._transform.k = transform.k || this._transform.k;
  }
}

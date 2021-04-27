import { Options, TimeFormat, TickOrientation, AxisFormat } from './types';

import lodashGet from 'lodash/get';


const DEFAULT_TRANSFORM = {
  x: 0,
  y: 0,
  k: 1
}

export class PodState {
  private _xValueRange: [number, number] | undefined = undefined;
  private _yValueRange: [number, number] | undefined = undefined;
  private _y1ValueRange: [number, number] | undefined = undefined;
  private _transform: { x: number, y: number, k: number } = DEFAULT_TRANSFORM;

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

  set xValueRange(range: [number, number]) {
    this._xValueRange = range;
  }

  set yValueRange(range: [number, number]) {
    this._yValueRange = range;
  }

  set y1ValueRange(range: [number, number]) {
    this._y1ValueRange = range;
  }
}

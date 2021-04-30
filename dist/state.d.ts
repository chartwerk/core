import { Options } from './types';
export declare class PodState {
    private _xValueRange;
    private _yValueRange;
    private _y1ValueRange;
    private _transform;
    constructor(options: Options);
    get xValueRange(): [number, number] | undefined;
    get yValueRange(): [number, number] | undefined;
    get y1ValueRange(): [number, number] | undefined;
    get transform(): {
        x?: number;
        y?: number;
        k?: number;
    };
    set xValueRange(range: [number, number]);
    set yValueRange(range: [number, number]);
    set y1ValueRange(range: [number, number]);
    set transform(transform: {
        x?: number;
        y?: number;
        k?: number;
    });
}

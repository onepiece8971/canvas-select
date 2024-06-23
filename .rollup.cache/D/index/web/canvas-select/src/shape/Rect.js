import Shape from './Shape';
export default class Rect extends Shape {
    constructor(item, index) {
        super(item, index);
        this.type = 1;
    }
    get ctrlsData() {
        const [[x0, y0], [x1, y1]] = this.coor;
        return [
            [x0, y0],
            [x0 + (x1 - x0) / 2, y0],
            [x1, y0],
            [x1, y0 + (y1 - y0) / 2],
            [x1, y1],
            [x0 + (x1 - x0) / 2, y1],
            [x0, y1],
            [x0, y0 + (y1 - y0) / 2],
        ];
    }
}
//# sourceMappingURL=Rect.js.map
import Shape from './Shape';
export default class Line extends Shape {
    constructor(item, index) {
        super(item, index);
        this.type = 4;
    }
    get ctrlsData() {
        return this.coor.length > 1 ? this.coor : [];
    }
}
//# sourceMappingURL=Line.js.map
import Shape from './Shape';
export default class Polygon extends Shape {
    constructor(item, index) {
        super(item, index);
        this.type = 2;
    }
    get ctrlsData() {
        return this.coor.length > 2 ? this.coor : [];
    }
}
//# sourceMappingURL=Polygon.js.map
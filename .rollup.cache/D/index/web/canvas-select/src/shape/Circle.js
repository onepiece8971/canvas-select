import Shape from './Shape';
export default class Circle extends Shape {
    constructor(item, index) {
        super(item, index);
        this.type = 5;
        this.radius = 0;
        this.radius = item.radius || this.radius;
    }
    get ctrlsData() {
        const [x, y] = this.coor;
        return [
            [x, y - this.radius],
            [x + this.radius, y],
            [x, y + this.radius],
            [x - this.radius, y]
        ];
    }
}
//# sourceMappingURL=Circle.js.map
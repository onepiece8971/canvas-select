import { createUuid } from "../tools";
export default class Shape {
    constructor(item, index) {
        /** 标签 */
        this.label = '';
        /** 是否隐藏标签 */
        this.hideLabel = false;
        /** 坐标 */
        this.coor = [];
        /** 边线颜色 */
        this.strokeStyle = '#000';
        /** 填充颜色 */
        this.fillStyle = '#fff';
        /** 边线宽度 */
        this.lineWidth = 1;
        /** 标签填充颜色 */
        this.labelFillStyle = '#000';
        /** 标签文字颜色 */
        this.textFillStyle = '#fff';
        /** 标签文字字体 */
        this.labelFont = '14px Microsoft YaHei';
        /** 1 矩形，2 多边形，3 点，4 折线，5 圆 */
        this.type = 1; // 形状
        /** 当前是否处于活动状态 */
        this.active = false;
        /** 当前是否处于创建状态 */
        this.creating = false;
        /** 当前是否处于拖拽状态 */
        this.dragging = false;
        /** 唯一标识 */
        this.uuid = createUuid();
        /** 向上展示label */
        this.labelUp = false;
        this.index = index;
        Object.assign(this, item);
    }
}
//# sourceMappingURL=Shape.js.map
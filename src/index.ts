'use strict';
import Rect from './shape/Rect';
import Polygon from './shape/Polygon';
import Dot from './shape/Dot';
import EventBus from './EventBus';
import Line from './shape/Line';
import Circle from './shape/Circle';
import pkg from '../package.json';
import { isNested } from "./tools";

export type Point = [number, number];
export type AllShape = Rect | Polygon | Dot | Line | Circle;
enum Shape {
    None,
    Rect,
    Polygon,
    Dot,
    Line,
    Circle
}
class CanvasSelect extends EventBus {
    /** 当前版本 */
    version = pkg.version;
    /** 只读模式，画布不允许任何交互 */
    lock: boolean = false;
    /** 只读模式，仅支持查看 */
    readonly: boolean = false;
    /** 最小矩形宽度 */
    MIN_WIDTH = 10;
    /** 最小矩形高度 */
    MIN_HEIGHT = 10;
    /** 最小圆形半径 */
    MIN_RADIUS = 5;
    /** 边线颜色 */
    strokeStyle = '#0f0';
    /** 填充颜色 */
    fillStyle = 'rgba(0, 0, 255,0.1)';
    /** 边线宽度 */
    lineWidth = 1;
    /** 当前选中的标注边线颜色 */
    activeStrokeStyle = '#f00';
    /** 当前选中的标注填充颜色 */
    activeFillStyle = 'rgba(255, 0, 0,0.1)';
    /** 控制点边线颜色 */
    ctrlStrokeStyle = '#000';
    /** 控制点填充颜色 */
    ctrlFillStyle = '#fff';
    /** 控制点半径 */
    ctrlRadius = 3;
    /** 是否隐藏标签 */
    hideLabel = false;
    /** 标签背景填充颜色 */
    labelFillStyle = '#fff';
    /** 标签字体 */
    labelFont = '10px sans-serif';
    /** 标签文字颜色 */
    textFillStyle = '#000';
    /** 标签字符最大长度，超出使用省略号 */
    labelMaxLen = 10;
    /** 画布宽度 */
    WIDTH = 0;
    /** 画布高度 */
    HEIGHT = 0;

    canvas: HTMLCanvasElement;

    ctx: CanvasRenderingContext2D;
    /** 所有标注数据 */
    dataset: AllShape[] = [];

    offScreen: HTMLCanvasElement;

    offScreenCtx: CanvasRenderingContext2D;
    /** 记录锚点距离 */
    remmber: number[][];
    /** 记录鼠标位置 */
    mouse: Point;
    /** 记录背景图鼠标位移 */
    remmberOrigin: number[] = [0, 0];
    /** 0 不创建，1 矩形，2 多边形，3 点，4 折线，5 圆 */
    createType: Shape = Shape.None; //
    /** 控制点索引 */
    ctrlIndex = -1;
    /** 背景图片 */
    image: HTMLImageElement = new Image();
    /** 图片原始宽度 */
    IMAGE_ORIGIN_WIDTH: number;
    /** 图片缩放宽度 */
    IMAGE_WIDTH = 0;
    /** 图片原始高度 */
    IMAGE_ORIGIN_HEIGHT = 0;
    /** 图片缩放高度 */
    IMAGE_HEIGHT = 0;
    /** 原点x */
    originX = 0;
    /** 原点y */
    originY = 0;
    /** 缩放步长 */
    scaleStep = 0;
    /** 滚动缩放 */
    scrollZoom = true;

    private timer: any;
    /** 最小touch双击时间 */
    dblTouch = 300;
    /** 记录touch双击开始时间 */
    dblTouchStore = 0; //
    /** 这个选项可以帮助浏览器进行内部优化 */
    alpha = true;
    /** 专注模式 */
    focusMode = false;
    /** 记录当前事件 */
    private evt: MouseEvent | TouchEvent | KeyboardEvent;
    /** 触控缩放时记录上一次两点距离 */
    scaleTouchStore = 0;
    /** 当前是否为双指触控 */
    isTouch2 = false;
    isMobile = navigator.userAgent.includes('Mobile');
    /** 向上展示label */
    labelUp = false;
    private ctrlKey = false;
    /**
     * @param el Valid CSS selector string, or DOM
     * @param src image src
     */
    constructor(el: HTMLCanvasElement | string, src?: string) {
        super();
    }

}

export default CanvasSelect
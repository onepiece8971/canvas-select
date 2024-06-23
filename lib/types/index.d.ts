import Rect from './shape/Rect';
import Polygon from './shape/Polygon';
import Dot from './shape/Dot';
import EventBus from './EventBus';
import Line from './shape/Line';
import Circle from './shape/Circle';
export type Point = [number, number];
export type AllShape = Rect | Polygon | Dot | Line | Circle;
declare enum Shape {
    None = 0,
    Rect = 1,
    Polygon = 2,
    Dot = 3,
    Line = 4,
    Circle = 5
}
declare class CanvasSelect extends EventBus {
    /** 当前版本 */
    version: string;
    /** 只读模式，画布不允许任何交互 */
    lock: boolean;
    /** 只读模式，仅支持查看 */
    readonly: boolean;
    /** 最小矩形宽度 */
    MIN_WIDTH: number;
    /** 最小矩形高度 */
    MIN_HEIGHT: number;
    /** 最小圆形半径 */
    MIN_RADIUS: number;
    /** 边线颜色 */
    strokeStyle: string;
    /** 填充颜色 */
    fillStyle: string;
    /** 边线宽度 */
    lineWidth: number;
    /** 当前选中的标注边线颜色 */
    activeStrokeStyle: string;
    /** 当前选中的标注填充颜色 */
    activeFillStyle: string;
    /** 控制点边线颜色 */
    ctrlStrokeStyle: string;
    /** 控制点填充颜色 */
    ctrlFillStyle: string;
    /** 控制点半径 */
    ctrlRadius: number;
    /** 是否隐藏标签 */
    hideLabel: boolean;
    /** 标签背景填充颜色 */
    labelFillStyle: string;
    /** 标签字体 */
    labelFont: string;
    /** 标签文字颜色 */
    textFillStyle: string;
    /** 标签字符最大长度，超出使用省略号 */
    labelMaxLen: number;
    /** 画布宽度 */
    WIDTH: number;
    /** 画布高度 */
    HEIGHT: number;
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    /** 所有标注数据 */
    dataset: AllShape[];
    offScreen: HTMLCanvasElement;
    offScreenCtx: CanvasRenderingContext2D;
    /** 记录锚点距离 */
    remmber: number[][];
    /** 记录鼠标位置 */
    mouse: Point;
    /** 记录背景图鼠标位移 */
    remmberOrigin: number[];
    /** 0 不创建，1 矩形，2 多边形，3 点，4 折线，5 圆 */
    createType: Shape;
    /** 控制点索引 */
    ctrlIndex: number;
    /** 背景图片 */
    image: HTMLImageElement;
    /** 图片原始宽度 */
    IMAGE_ORIGIN_WIDTH: number;
    /** 图片缩放宽度 */
    IMAGE_WIDTH: number;
    /** 图片原始高度 */
    IMAGE_ORIGIN_HEIGHT: number;
    /** 图片缩放高度 */
    IMAGE_HEIGHT: number;
    /** 原点x */
    originX: number;
    /** 原点y */
    originY: number;
    /** 缩放步长 */
    scaleStep: number;
    /** 滚动缩放 */
    scrollZoom: boolean;
    private timer;
    /** 最小touch双击时间 */
    dblTouch: number;
    /** 记录touch双击开始时间 */
    dblTouchStore: number;
    /** 这个选项可以帮助浏览器进行内部优化 */
    alpha: boolean;
    /** 专注模式 */
    focusMode: boolean;
    /** 记录当前事件 */
    private evt;
    /** 触控缩放时记录上一次两点距离 */
    scaleTouchStore: number;
    /** 当前是否为双指触控 */
    isTouch2: boolean;
    isMobile: boolean;
    /** 向上展示label */
    labelUp: boolean;
    private ctrlKey;
    /**
     * @param el Valid CSS selector string, or DOM
     * @param src image src
     */
    constructor(el: HTMLCanvasElement | string, src?: string);
}
export default CanvasSelect;

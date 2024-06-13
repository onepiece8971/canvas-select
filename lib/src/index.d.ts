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
export default class CanvasSelect extends EventBus {
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
    /** 当前当前选中的标注 */
    get activeShape(): any;
    /** 当前缩放比例 */
    get scale(): number;
    /** 图片最小边尺寸 */
    get imageMin(): number;
    /** 图片原始最大边尺寸 */
    get imageOriginMax(): number;
    /** 合成事件 */
    private mergeEvent;
    private handleLoad;
    private handleContextmenu;
    private handleMousewheel;
    private handleMouseDown;
    private handleMouseMove;
    private handleMouseUp;
    private handleDblclick;
    private handleKeydown;
    private handleKeyup;
    /** 初始化配置 */
    initSetting(): void;
    /** 初始化事件 */
    initEvents(): void;
    /**
     * 添加/切换图片
     * @param url 图片链接
     */
    setImage(url: string): void;
    /**
     * 设置数据
     * @param data Array
     */
    setData(data: AllShape[]): void;
    /**
     * 判断是否在标注实例上
     * @param mousePoint 点击位置
     * @returns
     */
    hitOnShape(mousePoint: Point): [number, AllShape];
    /**
     * 判断鼠标是否在背景图内部
     * @param e MouseEvent
     * @returns 布尔值
     */
    isInBackground(e: MouseEvent | TouchEvent): boolean;
    /**
     * 判断是否在矩形内
     * @param point 坐标
     * @param coor 区域坐标
     * @returns 布尔值
     */
    isPointInRect(point: Point, coor: Point[]): boolean;
    /**
     * 判断是否在多边形内
     * @param point 坐标
     * @param coor 区域坐标
     * @returns 布尔值
     */
    isPointInPolygon(point: Point, coor: Point[]): boolean;
    /**
     * 判断是否在圆内
     * @param point 坐标
     * @param center 圆心
     * @param r 半径
     * @param needScale 是否为圆形点击检测
     * @returns 布尔值
     */
    isPointInCircle(point: Point, center: Point, r: number): boolean;
    /**
     * 判断是否在折线内
     * @param point 坐标
     * @param coor 区域坐标
     * @returns 布尔值
     */
    isPointInLine(point: Point, coor: Point[]): boolean;
    /**
       * 判断是图形是否属于嵌套关系 (目前只支持矩形和多边形)
       * @param shape1 标注实例
       * @param shape2 标注实例
       * @returns 布尔值
       */
    isNested(shape1: Rect | Polygon, shape2: Rect | Polygon): boolean;
    /**
     * 绘制矩形
     * @param shape 标注实例
     * @returns
     */
    drawRect(shape: Rect): void;
    /**
     * 绘制多边形
     * @param shape 标注实例
     */
    drawPolygon(shape: Polygon): void;
    /**
     * 绘制点
     * @param shape 标注实例
     */
    drawDot(shape: Dot): void;
    /**
     * 绘制圆
     * @param shape 标注实例
     */
    drawCirle(shape: Circle): void;
    /**
     * 绘制折线
     * @param shape 标注实例
     */
    drawLine(shape: Line): void;
    /**
     * 绘制控制点
     * @param point 坐标
     */
    drawCtrl(point: Point): void;
    /**
     * 绘制控制点列表
     * @param shape 标注实例
     */
    drawCtrlList(shape: Rect | Polygon | Line): void;
    /**
     * 绘制label
     * @param point 位置
     * @param label 文本
     */
    drawLabel(point: Point, shape: AllShape): void;
    /**
     * 更新画布
     */
    update(): void;
    /**
     * 删除指定矩形
     * @param index number
     */
    deleteByIndex(index: number): void;
    /**
     * 计算缩放步长
     */
    calcStep(flag?: string): void;
    /**
     * 缩放
     * @param type true放大5%，false缩小5%
     * @param center 缩放中心 center|mouse
     * @param pure 不绘制
     */
    setScale(type: boolean, byMouse?: boolean, pure?: boolean): void;
    /**
     * 适配背景图
     */
    fitZoom(): void;
    /**
     * 设置专注模式
     * @param type {boolean}
     */
    setFocusMode(type: boolean): void;
    /**
     * 销毁
     */
    destroy(): void;
    /**
     * 重新设置画布大小
     */
    resize(): void;
}
export {};

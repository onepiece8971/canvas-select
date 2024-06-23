import Rect from './shape/Rect';
import Polygon from './shape/Polygon';
import Dot from './shape/Dot';
import EventBus from './EventBus';
import Line from './shape/Line';
import Circle from './shape/Circle';
import { isNested } from "./tools";
var Shape;
(function (Shape) {
    Shape[Shape["None"] = 0] = "None";
    Shape[Shape["Rect"] = 1] = "Rect";
    Shape[Shape["Polygon"] = 2] = "Polygon";
    Shape[Shape["Dot"] = 3] = "Dot";
    Shape[Shape["Line"] = 4] = "Line";
    Shape[Shape["Circle"] = 5] = "Circle";
})(Shape || (Shape = {}));
export default class CanvasSelect extends EventBus {
    /**
     * @param el Valid CSS selector string, or DOM
     * @param src image src
     */
    constructor(el, src) {
        super();
        /** 只读模式，画布不允许任何交互 */
        this.lock = false;
        /** 只读模式，仅支持查看 */
        this.readonly = false;
        /** 最小矩形宽度 */
        this.MIN_WIDTH = 10;
        /** 最小矩形高度 */
        this.MIN_HEIGHT = 10;
        /** 最小圆形半径 */
        this.MIN_RADIUS = 5;
        /** 边线颜色 */
        this.strokeStyle = '#0f0';
        /** 填充颜色 */
        this.fillStyle = 'rgba(0, 0, 255,0.1)';
        /** 边线宽度 */
        this.lineWidth = 1;
        /** 当前选中的标注边线颜色 */
        this.activeStrokeStyle = '#f00';
        /** 当前选中的标注填充颜色 */
        this.activeFillStyle = 'rgba(255, 0, 0,0.1)';
        /** 控制点边线颜色 */
        this.ctrlStrokeStyle = '#000';
        /** 控制点填充颜色 */
        this.ctrlFillStyle = '#fff';
        /** 控制点半径 */
        this.ctrlRadius = 3;
        /** 是否隐藏标签 */
        this.hideLabel = false;
        /** 标签背景填充颜色 */
        this.labelFillStyle = '#fff';
        /** 标签字体 */
        this.labelFont = '10px sans-serif';
        /** 标签文字颜色 */
        this.textFillStyle = '#000';
        /** 标签字符最大长度，超出使用省略号 */
        this.labelMaxLen = 10;
        /** 画布宽度 */
        this.WIDTH = 0;
        /** 画布高度 */
        this.HEIGHT = 0;
        /** 所有标注数据 */
        this.dataset = [];
        /** 记录锚点距离 */
        this.remmber = [];
        /** 记录鼠标位置 */
        this.mouse = [0, 0];
        /** 记录背景图鼠标位移 */
        this.remmberOrigin = [0, 0];
        /** 0 不创建，1 矩形，2 多边形，3 点，4 折线，5 圆 */
        this.createType = Shape.None; //
        /** 控制点索引 */
        this.ctrlIndex = -1;
        /** 背景图片 */
        this.image = new Image();
        /** 图片原始宽度 */
        this.IMAGE_ORIGIN_WIDTH = 0;
        /** 图片缩放宽度 */
        this.IMAGE_WIDTH = 0;
        /** 图片原始高度 */
        this.IMAGE_ORIGIN_HEIGHT = 0;
        /** 图片缩放高度 */
        this.IMAGE_HEIGHT = 0;
        /** 原点x */
        this.originX = 0;
        /** 原点y */
        this.originY = 0;
        /** 缩放步长 */
        this.scaleStep = 0;
        /** 滚动缩放 */
        this.scrollZoom = true;
        /** 最小touch双击时间 */
        this.dblTouch = 300;
        /** 记录touch双击开始时间 */
        this.dblTouchStore = 0; //
        /** 这个选项可以帮助浏览器进行内部优化 */
        this.alpha = true;
        /** 专注模式 */
        this.focusMode = false;
        /** 记录当前事件 */
        this.evt = null;
        /** 触控缩放时记录上一次两点距离 */
        this.scaleTouchStore = 0;
        /** 当前是否为双指触控 */
        this.isTouch2 = false;
        this.isMobile = navigator.userAgent.includes('Mobile');
        /** 向上展示label */
        this.labelUp = false;
        this.ctrlKey = false;
        this.handleLoad = this.handleLoad.bind(this);
        this.handleContextmenu = this.handleContextmenu.bind(this);
        this.handleMousewheel = this.handleMousewheel.bind(this);
        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleMouseUp = this.handleMouseUp.bind(this);
        this.handleDblclick = this.handleDblclick.bind(this);
        this.handleKeyup = this.handleKeyup.bind(this);
        this.handleKeydown = this.handleKeydown.bind(this);
        const container = typeof el === 'string' ? document.querySelector(el) : el;
        if (container instanceof HTMLCanvasElement) {
            this.canvas = container;
            this.offScreen = document.createElement('canvas');
            this.initSetting();
            this.initEvents();
            src && this.setImage(src);
        }
        else {
            console.warn('HTMLCanvasElement is required!');
        }
    }
    /** 当前当前选中的标注 */
    get activeShape() {
        return this.dataset.find(x => x.active) || {};
    }
    /** 当前缩放比例 */
    get scale() {
        if (this.IMAGE_ORIGIN_WIDTH && this.IMAGE_WIDTH) {
            return this.IMAGE_WIDTH / this.IMAGE_ORIGIN_WIDTH;
        }
        return 1;
    }
    /** 图片最小边尺寸 */
    get imageMin() {
        return Math.min(this.IMAGE_WIDTH, this.IMAGE_HEIGHT);
    }
    /** 图片原始最大边尺寸 */
    get imageOriginMax() {
        return Math.max(this.IMAGE_ORIGIN_WIDTH, this.IMAGE_ORIGIN_HEIGHT);
    }
    /** 合成事件 */
    mergeEvent(e) {
        let mouseX = 0;
        let mouseY = 0;
        let mouseCX = 0;
        let mouseCY = 0;
        if (this.isMobile) {
            const { clientX, clientY } = e.touches[0];
            const target = e.target;
            const { left, top } = target.getBoundingClientRect();
            mouseX = Math.round(clientX - left);
            mouseY = Math.round(clientY - top);
            if (e.touches.length === 2) {
                const { clientX: clientX1 = 0, clientY: clientY1 = 0 } = e.touches[1] || {};
                mouseCX = Math.round(Math.abs((clientX1 - clientX) / 2 + clientX) - left);
                mouseCY = Math.round(Math.abs((clientY1 - clientY) / 2 + clientY) - top);
            }
        }
        else {
            mouseX = e.offsetX;
            mouseY = e.offsetY;
        }
        return Object.assign(Object.assign({}, e), { mouseX, mouseY, mouseCX, mouseCY });
    }
    handleLoad() {
        this.emit('load', this.image.src);
        this.IMAGE_ORIGIN_WIDTH = this.IMAGE_WIDTH = this.image.width;
        this.IMAGE_ORIGIN_HEIGHT = this.IMAGE_HEIGHT = this.image.height;
        this.fitZoom();
    }
    handleContextmenu(e) {
        e.preventDefault();
        this.evt = e;
        if (this.lock)
            return;
    }
    handleMousewheel(e) {
        e.stopPropagation();
        this.evt = e;
        if (this.lock || !this.scrollZoom)
            return;
        const { mouseX, mouseY } = this.mergeEvent(e);
        this.mouse = [mouseX, mouseY];
        this.setScale(e.deltaY < 0, true);
    }
    handleMouseDown(e) {
        e.stopPropagation();
        this.evt = e;
        if (this.lock)
            return;
        const { mouseX, mouseY, mouseCX, mouseCY } = this.mergeEvent(e);
        const offsetX = Math.round(mouseX / this.scale);
        const offsetY = Math.round(mouseY / this.scale);
        this.mouse = this.isMobile && e.touches.length === 2 ? [mouseCX, mouseCY] : [mouseX, mouseY];
        this.remmberOrigin = [mouseX - this.originX, mouseY - this.originY];
        if ((!this.isMobile && e.buttons === 1) || (this.isMobile && e.touches.length === 1)) { // 鼠标左键
            const ctrls = this.activeShape.ctrlsData || [];
            this.ctrlIndex = ctrls.findIndex((coor) => this.isPointInCircle(this.mouse, coor, this.ctrlRadius));
            if (this.ctrlIndex > -1 && !this.readonly) { // 点击到控制点
                const [x0, y0] = ctrls[this.ctrlIndex];
                if (this.activeShape.type === Shape.Polygon && this.activeShape.coor.length > 2 && this.ctrlIndex === 0) {
                    this.handleDblclick(e);
                }
                this.remmber = [[offsetX - x0, offsetY - y0]];
            }
            else if (this.isInBackground(e)) {
                if (this.activeShape.creating && !this.readonly) { // 创建中
                    if ([Shape.Polygon, Shape.Line].includes(this.activeShape.type)) {
                        const [x, y] = this.activeShape.coor[this.activeShape.coor.length - 1];
                        if (x !== offsetX && y !== offsetY) {
                            const nx = Math.round(offsetX - this.originX / this.scale);
                            const ny = Math.round(offsetY - this.originY / this.scale);
                            this.activeShape.coor.push([nx, ny]);
                        }
                    }
                }
                else if (this.createType !== Shape.None && !this.readonly && !this.ctrlKey) { // 开始创建
                    let newShape;
                    const nx = Math.round(offsetX - this.originX / this.scale);
                    const ny = Math.round(offsetY - this.originY / this.scale);
                    const curPoint = [nx, ny];
                    switch (this.createType) {
                        case Shape.Rect:
                            newShape = new Rect({ coor: [curPoint, curPoint] }, this.dataset.length);
                            newShape.creating = true;
                            break;
                        case Shape.Polygon:
                            newShape = new Polygon({ coor: [curPoint] }, this.dataset.length);
                            newShape.creating = true;
                            break;
                        case Shape.Dot:
                            newShape = new Dot({ coor: curPoint }, this.dataset.length);
                            this.emit('add', newShape);
                            break;
                        case Shape.Line:
                            newShape = new Line({ coor: [curPoint] }, this.dataset.length);
                            newShape.creating = true;
                            break;
                        case Shape.Circle:
                            newShape = new Circle({ coor: curPoint }, this.dataset.length);
                            newShape.creating = true;
                            break;
                        default:
                            break;
                    }
                    this.dataset.forEach((sp) => { sp.active = false; });
                    newShape.active = true;
                    this.dataset.push(newShape);
                }
                else {
                    // 是否点击到形状
                    const [hitShapeIndex, hitShape] = this.hitOnShape(this.mouse);
                    if (hitShapeIndex > -1) {
                        hitShape.dragging = true;
                        this.dataset.forEach((item, i) => item.active = i === hitShapeIndex);
                        this.dataset.splice(hitShapeIndex, 1);
                        this.dataset.push(hitShape);
                        if (!this.readonly) {
                            this.remmber = [];
                            if ([Shape.Dot, Shape.Circle].includes(hitShape.type)) {
                                const [x, y] = hitShape.coor;
                                this.remmber = [[offsetX - x, offsetY - y]];
                            }
                            else {
                                hitShape.coor.forEach((pt) => {
                                    this.remmber.push([offsetX - pt[0], offsetY - pt[1]]);
                                });
                            }
                        }
                        this.emit('select', hitShape);
                    }
                    else {
                        this.activeShape.active = false;
                        this.dataset.sort((a, b) => a.index - b.index);
                        this.emit('select', null);
                    }
                }
                this.update();
            }
        }
    }
    handleMouseMove(e) {
        e.stopPropagation();
        this.evt = e;
        if (this.lock)
            return;
        const { mouseX, mouseY, mouseCX, mouseCY } = this.mergeEvent(e);
        const offsetX = Math.round(mouseX / this.scale);
        const offsetY = Math.round(mouseY / this.scale);
        this.mouse = this.isMobile && e.touches.length === 2 ? [mouseCX, mouseCY] : [mouseX, mouseY];
        if (((!this.isMobile && e.buttons === 1) || (this.isMobile && e.touches.length === 1)) && this.activeShape.type) {
            if (this.ctrlIndex > -1 && this.remmber.length && (this.isInBackground(e) || this.activeShape.type === Shape.Circle)) {
                const [[x, y]] = this.remmber;
                // resize矩形
                if (this.activeShape.type === Shape.Rect) {
                    const [[x0, y0], [x1, y1]] = this.activeShape.coor;
                    let coor = [];
                    switch (this.ctrlIndex) {
                        case 0:
                            coor = [[offsetX - x, offsetY - y], [x1, y1]];
                            break;
                        case 1:
                            coor = [[x0, offsetY - y], [x1, y1]];
                            break;
                        case 2:
                            coor = [[x0, offsetY - y], [offsetX - x, y1]];
                            break;
                        case 3:
                            coor = [[x0, y0], [offsetX - x, y1]];
                            break;
                        case 4:
                            coor = [[x0, y0], [offsetX - x, offsetY - y]];
                            break;
                        case 5:
                            coor = [[x0, y0], [x1, offsetY - y]];
                            break;
                        case 6:
                            coor = [[offsetX - x, y0], [x1, offsetY - y]];
                            break;
                        case 7:
                            coor = [[offsetX - x, y0], [x1, y1]];
                            break;
                        default:
                            break;
                    }
                    let [[a0, b0], [a1, b1]] = coor;
                    if (a0 < 0 ||
                        a1 < 0 ||
                        b0 < 0 ||
                        b1 < 0 ||
                        a1 > this.IMAGE_ORIGIN_WIDTH ||
                        b1 > this.IMAGE_ORIGIN_HEIGHT) {
                        // 偶然触发 超出边界处理
                        a0 < 0 && (a0 = 0);
                        a1 < 0 && (a1 = 0);
                        b0 < 0 && (b0 = 0);
                        b1 < 0 && (b1 = 0);
                        if (a1 > this.IMAGE_ORIGIN_WIDTH) {
                            a1 = this.IMAGE_ORIGIN_WIDTH;
                        }
                        if (b1 > this.IMAGE_ORIGIN_HEIGHT) {
                            b1 = this.IMAGE_ORIGIN_HEIGHT;
                        }
                    }
                    if (a1 - a0 >= this.MIN_WIDTH && b1 - b0 >= this.MIN_HEIGHT) {
                        this.activeShape.coor = [[a0, b0], [a1, b1]];
                    }
                    else {
                        this.emit('warn', `Width cannot be less than ${this.MIN_WIDTH},Height cannot be less than${this.MIN_HEIGHT}。`);
                    }
                }
                else if ([Shape.Polygon, Shape.Line].includes(this.activeShape.type)) {
                    const nx = Math.round(offsetX - this.originX / this.scale);
                    const ny = Math.round(offsetY - this.originY / this.scale);
                    const newPoint = [nx, ny];
                    this.activeShape.coor.splice(this.ctrlIndex, 1, newPoint);
                }
                else if (this.activeShape.type === Shape.Circle) {
                    const nx = Math.round(offsetX - this.originX / this.scale);
                    const newRadius = nx - this.activeShape.coor[0];
                    if (newRadius >= this.MIN_RADIUS)
                        this.activeShape.radius = newRadius;
                }
            }
            else if (this.activeShape.dragging && !this.readonly) { // 拖拽
                let coor = [];
                let noLimit = true;
                const w = this.IMAGE_ORIGIN_WIDTH || this.WIDTH;
                const h = this.IMAGE_ORIGIN_HEIGHT || this.HEIGHT;
                if ([Shape.Dot, Shape.Circle].includes(this.activeShape.type)) {
                    const [t1, t2] = this.remmber[0];
                    const x = offsetX - t1;
                    const y = offsetY - t2;
                    if (x < 0 || x > w || y < 0 || y > h)
                        noLimit = false;
                    coor = [x, y];
                }
                else {
                    for (let i = 0; i < this.activeShape.coor.length; i++) {
                        const tar = this.remmber[i];
                        const x = offsetX - tar[0];
                        const y = offsetY - tar[1];
                        if (x < 0 || x > w || y < 0 || y > h)
                            noLimit = false;
                        coor.push([x, y]);
                    }
                }
                if (noLimit)
                    this.activeShape.coor = coor;
            }
            else if (this.activeShape.creating && this.isInBackground(e)) {
                const x = Math.round(offsetX - this.originX / this.scale);
                const y = Math.round(offsetY - this.originY / this.scale);
                // 创建矩形
                if (this.activeShape.type === Shape.Rect) {
                    this.activeShape.coor.splice(1, 1, [x, y]);
                }
                else if (this.activeShape.type === Shape.Circle) {
                    const [x0, y0] = this.activeShape.coor;
                    const r = Math.sqrt(Math.pow((x0 - x), 2) + Math.pow((y0 - y), 2));
                    this.activeShape.radius = r;
                }
            }
            this.update();
        }
        else if ([Shape.Polygon, Shape.Line].includes(this.activeShape.type) && this.activeShape.creating) {
            // 多边形添加点
            this.update();
        }
        else if ((!this.isMobile && e.buttons === 2 && e.which === 3) || (this.isMobile && e.touches.length === 1 && !this.isTouch2)) {
            // 拖动背景
            this.originX = Math.round(mouseX - this.remmberOrigin[0]);
            this.originY = Math.round(mouseY - this.remmberOrigin[1]);
            this.update();
        }
        else if (this.isMobile && e.touches.length === 2) {
            this.isTouch2 = true;
            const touch0 = e.touches[0];
            const touch1 = e.touches[1];
            const cur = this.scaleTouchStore;
            this.scaleTouchStore = Math.abs((touch1.clientX - touch0.clientX) * (touch1.clientY - touch0.clientY));
            this.setScale(this.scaleTouchStore > cur, true);
        }
    }
    handleMouseUp(e) {
        e.stopPropagation();
        this.evt = e;
        if (this.lock)
            return;
        if (this.isMobile) {
            if (e.touches.length === 0) {
                this.isTouch2 = false;
            }
            if ((Date.now() - this.dblTouchStore) < this.dblTouch) {
                this.handleDblclick(e);
                return;
            }
            this.dblTouchStore = Date.now();
        }
        this.remmber = [];
        if (this.activeShape.type !== Shape.None && !this.ctrlKey) {
            this.activeShape.dragging = false;
            if (this.activeShape.creating) {
                if (this.activeShape.type === Shape.Rect) {
                    const [[x0, y0], [x1, y1]] = this.activeShape.coor;
                    if (Math.abs(x0 - x1) < this.MIN_WIDTH || Math.abs(y0 - y1) < this.MIN_HEIGHT) {
                        this.dataset.pop();
                        this.emit('warn', `Width cannot be less than ${this.MIN_WIDTH},Height cannot be less than ${this.MIN_HEIGHT}`);
                    }
                    else {
                        this.activeShape.coor = [[Math.min(x0, x1), Math.min(y0, y1)], [Math.max(x0, x1), Math.max(y0, y1)]];
                        this.activeShape.creating = false;
                        this.emit('add', this.activeShape);
                    }
                }
                else if (this.activeShape.type === Shape.Circle) {
                    if (this.activeShape.radius < this.MIN_RADIUS) {
                        this.dataset.pop();
                        this.emit('warn', `Radius cannot be less than ${this.MIN_WIDTH}`);
                    }
                    else {
                        this.activeShape.creating = false;
                        this.emit('add', this.activeShape);
                    }
                }
                this.update();
            }
        }
    }
    handleDblclick(e) {
        e.stopPropagation();
        this.evt = e;
        if (this.lock)
            return;
        if ([Shape.Polygon, Shape.Line].includes(this.activeShape.type)) {
            const canPolygon = this.activeShape.type === Shape.Polygon && this.activeShape.coor.length > 2;
            const canLine = this.activeShape.type === Shape.Line && this.activeShape.coor.length > 1;
            if (canPolygon || canLine) {
                this.emit('add', this.activeShape);
                this.activeShape.creating = false;
                this.update();
            }
        }
    }
    handleKeydown(e) {
        if (e.key === 'Control') {
            this.ctrlKey = true;
        }
    }
    handleKeyup(e) {
        if (e.key === 'Control') {
            this.ctrlKey = false;
        }
        this.evt = e;
        if (this.lock || this.readonly)
            return;
        if (this.activeShape.type) {
            if ([Shape.Polygon, Shape.Line].includes(this.activeShape.type) && e.key === 'Escape') {
                if (this.activeShape.coor.length > 1 && this.activeShape.creating) {
                    this.activeShape.coor.pop();
                }
                else {
                    this.deleteByIndex(this.activeShape.index);
                }
                this.update();
            }
            else if (e.key === 'Delete') {
                this.deleteByIndex(this.activeShape.index);
            }
        }
    }
    /** 初始化配置 */
    initSetting() {
        const dpr = window.devicePixelRatio || 1;
        this.canvas.style.userSelect = 'none';
        this.ctx = this.ctx || this.canvas.getContext('2d', { alpha: this.alpha });
        this.WIDTH = Math.round(this.canvas.clientWidth);
        this.HEIGHT = Math.round(this.canvas.clientHeight);
        this.canvas.width = this.WIDTH * dpr;
        this.canvas.height = this.HEIGHT * dpr;
        this.canvas.style.width = this.WIDTH + 'px';
        this.canvas.style.height = this.HEIGHT + 'px';
        this.offScreen.width = this.WIDTH;
        this.offScreen.height = this.HEIGHT;
        this.offScreenCtx = this.offScreenCtx || this.offScreen.getContext('2d', { willReadFrequently: true });
        this.ctx.scale(dpr, dpr);
    }
    /** 初始化事件 */
    initEvents() {
        this.image.addEventListener('load', this.handleLoad);
        this.canvas.addEventListener('touchstart', this.handleMouseDown);
        this.canvas.addEventListener('touchmove', this.handleMouseMove);
        this.canvas.addEventListener('touchend', this.handleMouseUp);
        this.canvas.addEventListener('contextmenu', this.handleContextmenu);
        this.canvas.addEventListener('mousewheel', this.handleMousewheel);
        this.canvas.addEventListener('mousedown', this.handleMouseDown);
        this.canvas.addEventListener('mousemove', this.handleMouseMove);
        this.canvas.addEventListener('mouseup', this.handleMouseUp);
        this.canvas.addEventListener('dblclick', this.handleDblclick);
        document.body.addEventListener('keydown', this.handleKeydown, true);
        document.body.addEventListener('keyup', this.handleKeyup, true);
    }
    /**
     * 添加/切换图片
     * @param url 图片链接
     */
    setImage(url) {
        this.image.src = url;
    }
    /**
     * 设置数据
     * @param data Array
     */
    setData(data) {
        setTimeout(() => {
            const initdata = [];
            data.forEach((item, index) => {
                if (Object.prototype.toString.call(item).includes('Object')) {
                    let shape;
                    switch (item.type) {
                        case Shape.Rect:
                            shape = new Rect(item, index);
                            break;
                        case Shape.Polygon:
                            shape = new Polygon(item, index);
                            break;
                        case Shape.Dot:
                            shape = new Dot(item, index);
                            break;
                        case Shape.Line:
                            shape = new Line(item, index);
                            break;
                        case Shape.Circle:
                            shape = new Circle(item, index);
                            break;
                        default:
                            shape = new Rect(item, index);
                            console.warn('Invalid shape', item);
                            break;
                    }
                    [Shape.Rect, Shape.Polygon, Shape.Dot, Shape.Line, Shape.Circle].includes(item.type) && initdata.push(shape);
                }
                else {
                    console.warn('Shape must be an enumerable Object.', item);
                }
            });
            this.dataset = initdata;
            this.update();
        });
    }
    /**
     * 判断是否在标注实例上
     * @param mousePoint 点击位置
     * @returns
     */
    hitOnShape(mousePoint) {
        let hitShapeIndex = -1;
        let hitShape;
        for (let i = this.dataset.length - 1; i > -1; i--) {
            const shape = this.dataset[i];
            if ((shape.type === Shape.Dot && this.isPointInCircle(mousePoint, shape.coor, this.ctrlRadius)) ||
                (shape.type === Shape.Circle && this.isPointInCircle(mousePoint, shape.coor, shape.radius * this.scale)) ||
                (shape.type === Shape.Rect && this.isPointInRect(mousePoint, shape.coor)) ||
                (shape.type === Shape.Polygon && this.isPointInPolygon(mousePoint, shape.coor)) ||
                (shape.type === Shape.Line && this.isPointInLine(mousePoint, shape.coor))) {
                if (this.focusMode && !shape.active)
                    continue;
                hitShapeIndex = i;
                hitShape = shape;
                break;
            }
        }
        return [hitShapeIndex, hitShape];
    }
    /**
     * 判断鼠标是否在背景图内部
     * @param e MouseEvent
     * @returns 布尔值
     */
    isInBackground(e) {
        const { mouseX, mouseY } = this.mergeEvent(e);
        return mouseX >= this.originX &&
            mouseY >= this.originY &&
            mouseX <= this.originX + this.IMAGE_ORIGIN_WIDTH * this.scale &&
            mouseY <= this.originY + this.IMAGE_ORIGIN_HEIGHT * this.scale;
    }
    /**
     * 判断是否在矩形内
     * @param point 坐标
     * @param coor 区域坐标
     * @returns 布尔值
     */
    isPointInRect(point, coor) {
        const [x, y] = point;
        const [[x0, y0], [x1, y1]] = coor.map((a) => a.map((b) => b * this.scale));
        return x0 + this.originX <= x &&
            x <= x1 + this.originX &&
            y0 + this.originY <= y &&
            y <= y1 + this.originY;
    }
    /**
     * 判断是否在多边形内
     * @param point 坐标
     * @param coor 区域坐标
     * @returns 布尔值
     */
    isPointInPolygon(point, coor) {
        this.offScreenCtx.save();
        this.offScreenCtx.clearRect(0, 0, this.WIDTH, this.HEIGHT);
        this.offScreenCtx.translate(this.originX, this.originY);
        this.offScreenCtx.beginPath();
        coor.forEach((pt, i) => {
            const [x, y] = pt.map((a) => Math.round(a * this.scale));
            if (i === 0) {
                this.offScreenCtx.moveTo(x, y);
            }
            else {
                this.offScreenCtx.lineTo(x, y);
            }
        });
        this.offScreenCtx.closePath();
        this.offScreenCtx.fill();
        const areaData = this.offScreenCtx.getImageData(0, 0, this.WIDTH, this.HEIGHT);
        const index = (point[1] - 1) * this.WIDTH * 4 + point[0] * 4;
        this.offScreenCtx.restore();
        return areaData.data[index + 3] !== 0;
    }
    /**
     * 判断是否在圆内
     * @param point 坐标
     * @param center 圆心
     * @param r 半径
     * @param needScale 是否为圆形点击检测
     * @returns 布尔值
     */
    isPointInCircle(point, center, r) {
        const [x, y] = point;
        const [x0, y0] = center.map((a) => a * this.scale);
        const distance = Math.sqrt(Math.pow((x0 + this.originX - x), 2) + Math.pow((y0 + this.originY - y), 2));
        return distance <= r;
    }
    /**
     * 判断是否在折线内
     * @param point 坐标
     * @param coor 区域坐标
     * @returns 布尔值
     */
    isPointInLine(point, coor) {
        this.offScreenCtx.save();
        this.offScreenCtx.clearRect(0, 0, this.WIDTH, this.HEIGHT);
        this.offScreenCtx.translate(this.originX, this.originY);
        this.offScreenCtx.lineWidth = 5;
        this.offScreenCtx.beginPath();
        coor.forEach((pt, i) => {
            const [x, y] = pt.map((a) => Math.round(a * this.scale));
            if (i === 0) {
                this.offScreenCtx.moveTo(x, y);
            }
            else {
                this.offScreenCtx.lineTo(x, y);
            }
        });
        this.offScreenCtx.stroke();
        const areaData = this.offScreenCtx.getImageData(0, 0, this.WIDTH, this.HEIGHT);
        const index = (point[1] - 1) * this.WIDTH * 4 + point[0] * 4;
        this.offScreenCtx.restore();
        return areaData.data[index + 3] !== 0;
    }
    /**
       * 判断是图形是否属于嵌套关系 (目前只支持矩形和多边形)
       * @param shape1 标注实例
       * @param shape2 标注实例
       * @returns 布尔值
       */
    isNested(shape1, shape2) {
        return isNested(shape1, shape2);
    }
    /**
     * 绘制矩形
     * @param shape 标注实例
     * @returns
     */
    drawRect(shape) {
        if (shape.coor.length !== 2)
            return;
        const { strokeStyle, fillStyle, active, creating, coor, lineWidth } = shape;
        const [[x0, y0], [x1, y1]] = coor.map((a) => a.map((b) => Math.round(b * this.scale)));
        this.ctx.save();
        this.ctx.lineWidth = lineWidth || this.lineWidth;
        this.ctx.fillStyle = fillStyle || this.fillStyle;
        this.ctx.strokeStyle = (active || creating) ? this.activeStrokeStyle : (strokeStyle || this.strokeStyle);
        const w = x1 - x0;
        const h = y1 - y0;
        if (!creating)
            this.ctx.fillRect(x0, y0, w, h);
        this.ctx.strokeRect(x0, y0, w, h);
        this.ctx.restore();
        this.drawLabel(coor[0], shape);
    }
    /**
     * 绘制多边形
     * @param shape 标注实例
     */
    drawPolygon(shape) {
        const { strokeStyle, fillStyle, active, creating, coor, lineWidth } = shape;
        this.ctx.save();
        this.ctx.lineJoin = 'round';
        this.ctx.lineWidth = lineWidth || this.lineWidth;
        this.ctx.fillStyle = fillStyle || this.fillStyle;
        this.ctx.strokeStyle = (active || creating) ? this.activeStrokeStyle : (strokeStyle || this.strokeStyle);
        this.ctx.beginPath();
        coor.forEach((el, i) => {
            const [x, y] = el.map((a) => Math.round(a * this.scale));
            if (i === 0) {
                this.ctx.moveTo(x, y);
            }
            else {
                this.ctx.lineTo(x, y);
            }
        });
        if (creating) {
            const [x, y] = this.mouse || [];
            this.ctx.lineTo(x - this.originX, y - this.originY);
        }
        else if (coor.length > 2) {
            this.ctx.closePath();
        }
        this.ctx.fill();
        this.ctx.stroke();
        this.ctx.restore();
        this.drawLabel(coor[0], shape);
    }
    /**
     * 绘制点
     * @param shape 标注实例
     */
    drawDot(shape) {
        const { strokeStyle, fillStyle, active, coor, lineWidth } = shape;
        const [x, y] = coor.map((a) => a * this.scale);
        this.ctx.save();
        this.ctx.lineWidth = lineWidth || this.lineWidth;
        this.ctx.fillStyle = fillStyle || this.ctrlFillStyle;
        this.ctx.strokeStyle = active ? this.activeStrokeStyle : (strokeStyle || this.strokeStyle);
        this.ctx.beginPath();
        this.ctx.arc(x, y, this.ctrlRadius, 0, 2 * Math.PI, true);
        this.ctx.fill();
        this.ctx.arc(x, y, this.ctrlRadius, 0, 2 * Math.PI, true);
        this.ctx.stroke();
        this.ctx.restore();
        this.drawLabel(coor, shape);
    }
    /**
     * 绘制圆
     * @param shape 标注实例
     */
    drawCirle(shape) {
        const { strokeStyle, fillStyle, active, coor, creating, radius, ctrlsData, lineWidth } = shape;
        const [x, y] = coor.map((a) => a * this.scale);
        this.ctx.save();
        this.ctx.lineWidth = lineWidth || this.lineWidth;
        this.ctx.fillStyle = fillStyle || this.fillStyle;
        this.ctx.strokeStyle = (active || creating) ? this.activeStrokeStyle : (strokeStyle || this.strokeStyle);
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius * this.scale, 0, 2 * Math.PI, true);
        this.ctx.fill();
        this.ctx.arc(x, y, radius * this.scale, 0, 2 * Math.PI, true);
        this.ctx.stroke();
        this.ctx.restore();
        this.drawLabel(ctrlsData[0], shape);
    }
    /**
     * 绘制折线
     * @param shape 标注实例
     */
    drawLine(shape) {
        const { strokeStyle, active, creating, coor, lineWidth } = shape;
        this.ctx.save();
        this.ctx.lineJoin = 'round';
        this.ctx.lineWidth = lineWidth || this.lineWidth;
        this.ctx.strokeStyle = (active || creating) ? this.activeStrokeStyle : (strokeStyle || this.strokeStyle);
        this.ctx.beginPath();
        coor.forEach((el, i) => {
            const [x, y] = el.map((a) => Math.round(a * this.scale));
            if (i === 0) {
                this.ctx.moveTo(x, y);
            }
            else {
                this.ctx.lineTo(x, y);
            }
        });
        if (creating) {
            const [x, y] = this.mouse || [];
            this.ctx.lineTo(x - this.originX, y - this.originY);
        }
        this.ctx.stroke();
        this.ctx.restore();
        this.drawLabel(coor[0], shape);
    }
    /**
     * 绘制控制点
     * @param point 坐标
     */
    drawCtrl(point) {
        const [x, y] = point.map((a) => a * this.scale);
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.fillStyle = this.ctrlFillStyle;
        this.ctx.strokeStyle = this.ctrlStrokeStyle;
        this.ctx.arc(x, y, this.ctrlRadius, 0, 2 * Math.PI, true);
        this.ctx.fill();
        this.ctx.arc(x, y, this.ctrlRadius, 0, 2 * Math.PI, true);
        this.ctx.stroke();
        this.ctx.restore();
    }
    /**
     * 绘制控制点列表
     * @param shape 标注实例
     */
    drawCtrlList(shape) {
        shape.ctrlsData.forEach((point, i) => {
            if (shape.type === Shape.Circle) {
                if (i === 1)
                    this.drawCtrl(point);
            }
            else {
                this.drawCtrl(point);
            }
        });
    }
    /**
     * 绘制label
     * @param point 位置
     * @param label 文本
     */
    drawLabel(point, shape) {
        const { label = '', labelFillStyle = '', labelFont = '', textFillStyle = '', hideLabel, labelUp, lineWidth } = shape;
        const isHideLabel = typeof hideLabel === 'boolean' ? hideLabel : this.hideLabel;
        const isLabelUp = typeof labelUp === 'boolean' ? labelUp : this.labelUp;
        const currLineWidth = lineWidth || this.lineWidth;
        if (label.length && !isHideLabel) {
            this.ctx.font = labelFont || this.labelFont;
            const textPaddingLeft = 4;
            const textPaddingTop = 4;
            const newText = label.length < this.labelMaxLen + 1 ? label : `${label.slice(0, this.labelMaxLen)}...`;
            const text = this.ctx.measureText(newText);
            const font = parseInt(this.ctx.font) - 4;
            const labelWidth = text.width + textPaddingLeft * 2;
            const labelHeight = font + textPaddingTop * 2;
            const [x, y] = point.map((a) => a * this.scale);
            const toleft = (this.IMAGE_ORIGIN_WIDTH - point[0]) < labelWidth / this.scale;
            const toTop = (this.IMAGE_ORIGIN_HEIGHT - point[1]) < labelHeight / this.scale;
            const toTop2 = point[1] > labelHeight / this.scale;
            const isup = isLabelUp ? toTop2 : toTop;
            this.ctx.save();
            this.ctx.fillStyle = labelFillStyle || this.labelFillStyle;
            this.ctx.fillRect(toleft ? (x - text.width - textPaddingLeft - currLineWidth / 2) : (x + currLineWidth / 2), isup ? (y - labelHeight - currLineWidth / 2) : (y + currLineWidth / 2), labelWidth, labelHeight);
            this.ctx.fillStyle = textFillStyle || this.textFillStyle;
            this.ctx.fillText(newText, toleft ? (x - text.width) : (x + textPaddingLeft + currLineWidth / 2), isup ? (y - labelHeight + font + textPaddingTop) : (y + font + textPaddingTop + currLineWidth / 2), 180);
            this.ctx.restore();
        }
    }
    /**
     * 更新画布
     */
    update() {
        window.cancelAnimationFrame(this.timer);
        this.timer = window.requestAnimationFrame(() => {
            this.ctx.save();
            this.ctx.clearRect(0, 0, this.WIDTH, this.HEIGHT);
            this.ctx.translate(this.originX, this.originY);
            if (this.IMAGE_WIDTH && this.IMAGE_HEIGHT) {
                this.ctx.drawImage(this.image, 0, 0, this.IMAGE_WIDTH, this.IMAGE_HEIGHT);
            }
            const renderList = this.focusMode ? (this.activeShape.type ? [this.activeShape] : []) : this.dataset;
            for (let i = 0; i < renderList.length; i++) {
                const shape = renderList[i];
                if (shape.hide)
                    continue;
                switch (shape.type) {
                    case Shape.Rect:
                        this.drawRect(shape);
                        break;
                    case Shape.Polygon:
                        this.drawPolygon(shape);
                        break;
                    case Shape.Dot:
                        this.drawDot(shape);
                        break;
                    case Shape.Line:
                        this.drawLine(shape);
                        break;
                    case Shape.Circle:
                        this.drawCirle(shape);
                        break;
                    default:
                        break;
                }
            }
            if ([Shape.Rect, Shape.Polygon, Shape.Line, Shape.Circle].includes(this.activeShape.type) && !this.activeShape.hide) {
                this.drawCtrlList(this.activeShape);
            }
            this.ctx.restore();
            this.emit('updated', this.dataset);
        });
    }
    /**
     * 删除指定矩形
     * @param index number
     */
    deleteByIndex(index) {
        const num = this.dataset.findIndex((x) => x.index === index);
        if (num > -1) {
            this.emit('delete', this.dataset[num]);
            this.dataset.splice(num, 1);
            this.dataset.forEach((item, i) => { item.index = i; });
            this.update();
        }
    }
    /**
     * 计算缩放步长
     */
    calcStep(flag = '') {
        if (this.IMAGE_WIDTH < this.WIDTH && this.IMAGE_HEIGHT < this.HEIGHT) {
            if (flag === '' || flag === 'b') {
                this.setScale(true, false, true);
                this.calcStep('b');
            }
        }
        if (this.IMAGE_WIDTH > this.WIDTH || this.IMAGE_HEIGHT > this.HEIGHT) {
            if (flag === '' || flag === 's') {
                this.setScale(false, false, true);
                this.calcStep('s');
            }
        }
    }
    /**
     * 缩放
     * @param type true放大5%，false缩小5%
     * @param center 缩放中心 center|mouse
     * @param pure 不绘制
     */
    setScale(type, byMouse = false, pure = false) {
        if (this.lock)
            return;
        if ((!type && this.imageMin < 20) || (type && this.IMAGE_WIDTH > this.imageOriginMax * 100))
            return;
        if (type) {
            this.scaleStep++;
        }
        else {
            this.scaleStep--;
        }
        let realToLeft = 0;
        let realToRight = 0;
        const [x, y] = this.mouse || [];
        if (byMouse) {
            realToLeft = (x - this.originX) / this.scale;
            realToRight = (y - this.originY) / this.scale;
        }
        const abs = Math.abs(this.scaleStep);
        const width = this.IMAGE_WIDTH;
        this.IMAGE_WIDTH = Math.round(this.IMAGE_ORIGIN_WIDTH * Math.pow((this.scaleStep >= 0 ? 1.05 : 0.95), abs));
        this.IMAGE_HEIGHT = Math.round(this.IMAGE_ORIGIN_HEIGHT * Math.pow((this.scaleStep >= 0 ? 1.05 : 0.95), abs));
        if (byMouse) {
            this.originX = x - realToLeft * this.scale;
            this.originY = y - realToRight * this.scale;
        }
        else {
            const scale = this.IMAGE_WIDTH / width;
            this.originX = this.WIDTH / 2 - (this.WIDTH / 2 - this.originX) * scale;
            this.originY = this.HEIGHT / 2 - (this.HEIGHT / 2 - this.originY) * scale;
        }
        if (!pure) {
            this.update();
        }
    }
    /**
     * 适配背景图
     */
    fitZoom() {
        this.calcStep();
        if (this.IMAGE_HEIGHT / this.IMAGE_WIDTH >= this.HEIGHT / this.WIDTH) {
            this.IMAGE_WIDTH = this.IMAGE_ORIGIN_WIDTH / (this.IMAGE_ORIGIN_HEIGHT / this.HEIGHT);
            this.IMAGE_HEIGHT = this.HEIGHT;
        }
        else {
            this.IMAGE_WIDTH = this.WIDTH;
            this.IMAGE_HEIGHT = this.IMAGE_ORIGIN_HEIGHT / (this.IMAGE_ORIGIN_WIDTH / this.WIDTH);
        }
        this.originX = (this.WIDTH - this.IMAGE_WIDTH) / 2;
        this.originY = (this.HEIGHT - this.IMAGE_HEIGHT) / 2;
        this.update();
    }
    /**
     * 设置专注模式
     * @param type {boolean}
     */
    setFocusMode(type) {
        this.focusMode = type;
        this.update();
    }
    /**
     * 销毁
     */
    destroy() {
        this.image.removeEventListener('load', this.handleLoad);
        this.canvas.removeEventListener('contextmenu', this.handleContextmenu);
        this.canvas.removeEventListener('mousewheel', this.handleMousewheel);
        this.canvas.removeEventListener('mousedown', this.handleMouseDown);
        this.canvas.removeEventListener('touchend', this.handleMouseDown);
        this.canvas.removeEventListener('mousemove', this.handleMouseMove);
        this.canvas.removeEventListener('touchmove', this.handleMouseMove);
        this.canvas.removeEventListener('mouseup', this.handleMouseUp);
        this.canvas.removeEventListener('touchend', this.handleMouseUp);
        this.canvas.removeEventListener('dblclick', this.handleDblclick);
        document.body.removeEventListener('keydown', this.handleKeydown, true);
        document.body.removeEventListener('keyup', this.handleKeyup, true);
        this.canvas.width = this.WIDTH;
        this.canvas.height = this.HEIGHT;
        this.canvas.style.width = null;
        this.canvas.style.height = null;
        this.canvas.style.userSelect = null;
    }
    /**
     * 重新设置画布大小
     */
    resize() {
        this.canvas.width = null;
        this.canvas.height = null;
        this.canvas.style.width = null;
        this.canvas.style.height = null;
        this.initSetting();
        this.update();
    }
}
//# sourceMappingURL=index.js.map
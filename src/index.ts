export type AllShape = {
    type: 1
    coor: [number, number][]
} | {
    type: 2
    coor: [number, number][]
}

export default function CS(el: HTMLCanvasElement | string, src?: string) {
    console.log(el, src)
}
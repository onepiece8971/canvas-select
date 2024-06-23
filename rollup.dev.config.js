import babel from '@rollup/plugin-babel';
import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';
import json from '@rollup/plugin-json';

export default {
    input: "src/index.ts",
    output: {
        file: 'dist/index.min.js',
        format: 'umd',
        name: 'CanvasSelect',
        sourcemap: true,
    },
    plugins: [
      typescript(),
      babel({ babelHelpers: "bundled" }),
      terser(), 
      json()
    ],
}

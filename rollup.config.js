import babel from '@rollup/plugin-babel';
import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';
import json from '@rollup/plugin-json';

export default {
  input: 'src/index.ts',
  output: {
    exports: 'auto',
    file: 'lib/canvas-select.min.js',
    format: 'es',
    name: 'CanvasSelect',
    sourcemap: true,
  },
  plugins: [
    typescript({compilerOptions: { declaration: true, declarationDir: './types' } }),
    babel({ babelHelpers: 'bundled' }),
    terser(),
    json(),
  ],
};

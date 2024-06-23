import babel from '@rollup/plugin-babel';
import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';
import json from '@rollup/plugin-json';

export default {
  input: 'src/index.ts',
  output: {
    exports: 'auto',
    file: 'lib/index.min.js',
    format: 'umd',
    name: 'canvas-select',
    sourcemap: true,
  },
  plugins: [
    typescript({tsconfig: './tsconfig.json'}),
    babel({ babelHelpers: 'bundled' }),
    terser(),
    json(),
  ],
};

import babel from '@rollup/plugin-babel';
import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';
import json from '@rollup/plugin-json';
import banner2 from "rollup-plugin-banner2";

export default {
  input: 'src/index.ts',
  output: {
    file: 'lib/index.min.js',
    format: 'esm',
    sourcemap: true,
  },
  plugins: [
    typescript({tsconfig: './tsconfig.json'}),
    babel({ babelHelpers: 'bundled' }),
    terser(),
    json(),
    banner2(() => `'use client'\n`),
  ],
};

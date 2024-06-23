import pkg from './package.json' with { type: "json" }
import babel from '@rollup/plugin-babel';
import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';
import json from '@rollup/plugin-json';

export default {
    input: "src/index.ts",
    output: [
        {
            file: pkg.main,
            format: "cjs",
            sourcemap: true,
        },
        {
            file: pkg.module,
            format: "esm",
            sourcemap: true,
        },
    ],
    plugins: [
      typescript({ tsconfig: "./tsconfig.json" }),
      babel(),
      terser(), 
      json()
    ],
}

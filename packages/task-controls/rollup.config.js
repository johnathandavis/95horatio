import typescript from 'rollup-plugin-typescript2'
import pkg from './package.json'
import url from 'postcss-url';
import postcss from 'rollup-plugin-postcss';
import inlineSvg from 'rollup-plugin-inline-svg';
 

export default {
  input: 'src/index.ts',
  output: [
    {
      file: pkg.main,
      format: 'cjs',
    },
    {
      file: pkg.module,
      format: 'es',
    },
  ],
  external: [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.peerDependencies || {}),
  ],
  plugins: [
    postcss({
      extract: true,
      modules: false,
      to: "dist/",
      use: [],
      plugins: [
        url({
          url: "inline", // enable inline assets using base64 encoding
          maxSize: 10, // maximum file size to inline (in kilobytes)
          fallback: "copy", // fallback method to use if max size is exceeded
        }),
      ],
    }),
    inlineSvg({
      // Removes specified tags and its children. You can specify tags by setting removingTags query array.
      // default: false
      removeTags: false,
  
      // warning: this won't work unless you specify removeTags: true
      // default: ['title', 'desc', 'defs', 'style']
      removingTags: ['title', 'desc', 'defs', 'style'],
     
      // warns about present tags, ex: ['desc', 'defs', 'style']
      // default: []
      warnTags: [], 
 
      // Removes `width` and `height` attributes from <svg>.
      // default: true
      removeSVGTagAttrs: true,
  
      // Removes attributes from inside the <svg>.
      // default: []
      removingTagAttrs: [],
  
      // Warns to console about attributes from inside the <svg>.
      // default: []
      warnTagAttrs: []
    }),
    typescript({
      typescript: require('typescript'),
    }),
  ]
}
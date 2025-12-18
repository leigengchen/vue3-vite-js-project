
module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true
  },
  extends: [
    'eslint:recommended',
    'plugin:vue/vue3-recommended',
    // 忽略unplugin-auto-import/vite插件的eslint冲突
    './.eslintrc-auto-import.json'
  ],
  // overrides: [
  //   {
  //     env: {
  //       node: true
  //     },
  //     files: [
  //       '.eslintrc.{js,cjs}'
  //     ],
  //     parserOptions: {
  //       sourceType: 'script'
  //     }
  //   }
  // ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  plugins: [
    'vue'
  ],
  rules: {
    indent: ["error", 2],
    'no-unused-vars': 'warn',
    'no-console': process.env.NODE_ENV === 'production'? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'vue/multi-word-component-names': 'off', // 取消文件名校验规则
    'vue/max-attributes-per-line': 'off', // 取消@click重启一行校验规则
    'vue/singleline-html-element-content-newline': 'off', // 取消单行html元素内容换行校验规则
    'vue/require-v-for-key': 'error', // 给v-for设置键值，与key结合使用，可以高效的更新虚拟DOM
    'no-loss-of-precision': 'off', // 取消小数精度校验规则
  }
}


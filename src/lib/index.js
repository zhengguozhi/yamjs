import BaseComponent, { Component } from './BaseComponent'
// eslint-disable-next-line no-extend-native
Array.prototype.flat = Array.prototype.flat || function () {
  return this.reduce((acc, val) => Array.isArray(val) ? acc.concat(val.flat()) : acc.concat(val), [])
}
export default BaseComponent
export { Component }
// ok1 样式只是加载一次
// ok2 完成 基类可有 扩展
// BUG 来回切换会出问题
// TODO 0 处理解析出来的父级元素
// TODO 1 完成diff 优化
// TODO 1 添加路由
// TODO 2 添加增加减少动画
// TODO 3 添加使用注解去配置组件
import init from './init'
import { Mix } from './init/mix'
import { getStyleStr } from './utils'
import BaseCustomElements from './BaseCustomElements'
var comps = window.comps = {}
@Mix()
class BaseComponent {
  constructor () {
    this._config()
    // console.log(new.target)
    comps[this._id] = this
    // console.log('BaseComponent', isCustomElements)
  }
  connectedCallback (isRenderIn) {
    init(this, isRenderIn)
    this.$connectedCallback && this.$connectedCallback()
  }
  disconnectedCallback () {
    console.log('disconnectedCallback')
    // 取消 监听
    // this.mutation.disconnect()
    this.isUnset = true
  }
  // 会被覆盖的方法
  $config () {
    return {

    }
  }
  // 会被覆盖的方法
  $data () {
    return {
    }
  }
  // 会被覆盖的方法
  $updated () {
  }
  renderAt (el) {
    if (!this.isCustomElements) {
      this.elm = typeof el === 'string' ? document.querySelector(el) : el
      // _extends($el, this)
      // _extends($el.prototype, this.prototype)
      this.connectedCallback(true)
    }
  }
}
export default BaseComponent
// 注解
export function Component (Config) {
  let { tagName, shadow, style, props, customElements } = Config
  return function (Target) {
    Target._tagName = tagName
    Target._shadow = !!shadow
    Target.prototype._config = function () {
      this._tagName = tagName
      this._shadow = !!shadow
      this._props = props || []
      this._eid = 'com_' + tagName
      this._style = getStyleStr(this._eid, style)
      // if (typeof customElements === 'undefined') {
      //   this.isCustomElements = true
      // }
      // console.log('this._style', this._style)
    }
    if (customElements || typeof customElements === 'undefined') {
      Target.customElements = true
      try {
        window.customElements.define(tagName, BaseCustomElements(Target))
      } catch (e) {
        console.log('e', e)
      }
    } else {
      Target.customElements = false
    }
  }
}
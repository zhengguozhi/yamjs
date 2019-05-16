/** @jsx createElement */
import { HTML_TAGS, GLOBAL_ATTRIBUTES, EVENT_HANDLERS } from './creatConfig'
import nodeOps from '../utils/nodeOps'
import { $ComponentSymbol } from '../symbol'
// eslint-disable-next-line no-extend-native
Array.prototype.flat = Array.prototype.flat || function () {
  return this.reduce((acc, val) => Array.isArray(val) ? acc.concat(val.flat()) : acc.concat(val), [])
}
// let i = 0
class Element {
  constructor (tagName, props = {}, childNodes, _root, isText) {
    if (isText) {
      this.tagName = tagName
      this.props = props
      this.text = childNodes
      this.childNodes = undefined
      this.isText = true
    } else {
      if (typeof tagName !== 'string') {
        console.log('tagName', typeof tagName, tagName._tagName)
      }
      this.tagName = tagName
      this.props = props || {}
      this.childNodes = Array.isArray(childNodes) ? childNodes.flat(3) : [childNodes]
      this.childNodes = this.childNodes.map((v, key) => {
        // if (typeof v === 'string' || typeof v === 'number' || typeof v === 'function' || typeof v === 'undefined' || typeof v === 'null') {
        if (typeof v !== 'object') {
          v = new Element('textNode', '', v + '', _root, true)
        } else if (!v.tagName) {
          try {
            v = new Element('textNode', '', JSON.stringify(v) + '', _root, true)
          } catch (e) {
            v = new Element('textNode', '', '无法识别', _root, true)
          }
        }
        v.key = key
        return v
      })
      const tag = HTML_TAGS[this.tagName] || this.tagName
      const object = typeof tag === 'object'
      const tagClass = typeof tag === 'function'
      const localAttrs = object ? tag.attributes || {} : {}
      const attrs = Object.assign({}, GLOBAL_ATTRIBUTES, localAttrs)
      const tagType = object ? tag.name : tagClass ? tag._tagName : tag
      this.isElement = tagClass ? tag.customElements : true
      this.tagType = tagType
      this.attrs = attrs
    }
    this._root = _root // 带搞根结点
  }
  render (key, parentELm = null) {
    // this.key = key || 0
    if (this.isText) {
      this.elm = document.createTextNode(this.text)
      return this.elm
    }
    let el = null
    if (!this.isElement) {
      let cacheDom = document.createElement('div')
      // let cacheDom = document.createDocumentFragment()
      // 回调
      cacheDom._parentNode = parentELm
      cacheDom._parentElement = parentELm
      //  eslint-disable-next-line new-cap
      this[$ComponentSymbol] = new this.tagName()
      this[$ComponentSymbol].props = this.props
      this[$ComponentSymbol].renderAt(cacheDom)
      cacheDom[$ComponentSymbol] = this[$ComponentSymbol]
      console.log(this[$ComponentSymbol])
      cacheDom.firstChild.disconnectedCallback = () => {
        this[$ComponentSymbol].disconnectedCallback && this[$ComponentSymbol].disconnectedCallback()
      }
      el = cacheDom
    } else {
      el = document.createElement(this.tagType)
      el._parentNode = parentELm
      el._parentElement = parentELm
    }
    // el.props = this.props
    if (this.props) {
      Object.keys(this.props).forEach(prop => {
        if (prop in this.attrs) {
          el.setAttribute(this.attrs[prop], this.props[prop])
        } else if (prop in EVENT_HANDLERS) {
          el.addEventListener(EVENT_HANDLERS[prop], this.props[prop])
        } else {
          el.setAttribute(prop, this.props[prop])
        }
      })
      if ('style' in this.props) {
        const styles = this.props.style
        Object.keys(styles).forEach(prop => {
          const value = styles[prop]
          if (typeof value === 'number') {
            el.style[prop] = `${value}px`
          } else if (typeof value === 'string') {
            el.style[prop] = value
          } else {
            throw new Error(`Expected "number" or "string" but received "${typeof value}"`)
          }
        })
      }
    }
    this.childNodes.forEach((child, key) => {
      nodeOps.appendChild(el, child.render(key, el))
      // el.appendChild(child.render(key))
    })
    this.elm = el
    return this.elm
  }
}
export function renderElement (dom) {
  return (dom instanceof Element)
    ? dom.render() // 如果子节点也是虚拟DOM，递归构建DOM节点
    : document.createTextNode(dom) // 如果字符串，只构建文本节点
}
export function createElementJson (tagName, props = {}, childNodes, root) {
  return new Element(tagName, props, childNodes, root)
}

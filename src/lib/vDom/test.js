import { HTML_TAGS, GLOBAL_ATTRIBUTES, EVENT_HANDLERS } from './creatConfig'

export function createElement (tagName, props = {}, ...childNodes) {
  console.log(arguments)
  if (props === null) {
    props = {}
  }
  const tag = HTML_TAGS[tagName]
  const object = typeof tag === 'object'
  const localAttrs = object ? tag.attributes || {} : {}
  const attrs = Object.assign({}, GLOBAL_ATTRIBUTES, localAttrs)
  const tagType = object ? tag.name : tag
  const el = document.createElement(tagType)
  Object.keys(props).forEach(prop => {
    if (prop in attrs) {
      el.setAttribute(attrs[prop], props[prop])
    }
    if (prop in EVENT_HANDLERS) {
      el.addEventListener(EVENT_HANDLERS[prop], props[prop])
    }
  })
  if ('style' in props) {
    const styles = props.style
    Object.keys(styles).forEach(prop => {
      const value = styles[prop]
      if (typeof value === 'number') {
        el.style[prop] = `${ value }px`
      } else if (typeof value === 'string') {
        el.style[prop] = value
      } else {
        throw new Error(`Expected "number" or "string" but received "${ typeof value }"`)
      }
    })
  }
  doChild(childNodes, el)
  return el
}
function doChild (childNodes, el) {
  childNodes.forEach(childNode => {
    if (typeof childNode === 'object') {
      if (childNode.tagName) {
        el.appendChild(childNode)
      } else {
        if (Array.isArray(childNode)) {
          doChild(childNode, el)
        } else {
          el.appendChild(document.createTextNode(childNode.toString()))
        }
      }
    } else if (typeof childNode === 'string' || typeof childNode === 'number') {
      el.appendChild(document.createTextNode(childNode))
    } else if (typeof childNode === 'function') {
      el.appendChild(document.createTextNode(childNode.toString()))
    } else {
      console.warn(new Error(`${ childNode } Expected "object" or "string" but received "${ typeof value }"`))
    }
  })
}
export default createElement

/*
 * @Author: xuxueliang
 * @Date: 2019-08-01 15:22:48
 * @LastEditors: xuxueliang
 * @LastEditTime: 2020-03-06 17:47:16
 */
/** @jsx createElement */
import { HTML_TAGS, GLOBAL_ATTRIBUTES, EVENT_HANDLERS } from './creatConfig'
import nodeOps from '../utils/nodeOps'
import { forEach, toCamelCase, getCid, addSlot } from '../utils/index'
import { getCallFnName, getComponentMark, setComponentForElm, getComponentByElm, getparentCom } from '../utils/componentUtil'
// import { $slotSymbol } from '../symbol/index'
// import cacheLib from '../utils/cacheLib'
// eslint-disable-next-line no-extend-native
Array.prototype.flat = Array.prototype.flat || function () {
  return this.reduce((acc, val) => Array.isArray(val) ? acc.concat(val.flat()) : acc.concat(val), [])
}
// let i = 0
class Element {
  constructor(tagName, props = {}, childNodes, _root, isText) {
    if (isText) {
      this.tagName = tagName
      this.props = props
      this.text = childNodes
      this.childNodes = undefined
      this.isText = true
    } else {
      if (typeof tagName !== 'string') {
        // console.log('tagName', typeof tagName, tagName._tagName)
      }
      this.tagName = tagName
      this.props = props || {}
      this.childNodes = Array.isArray(childNodes) ? childNodes.flat(3) : [childNodes]
      this.childNodes = this.childNodes.map((v, key) => {
        // if (typeof v === 'string' || typeof v === 'number' || typeof v === 'function' || typeof v === 'undefined' || typeof v === 'null') {
        if (typeof v !== 'object' || v === null) {
          v = new Element('textNode', '', v + '', _root, true)
        } else if (!v.tagName) {
          try {
            if (v.nodeType === 3) {
              v = new Element('textNode', '', v.nodeValue, _root, true)
            } else {
              v = new Element('textNode', '', JSON.stringify(v) + '', _root, true)
            }
          } catch (e) {
            v = new Element('textNode', '', '无法识别', _root, true)
          }
        }
        v.key = key
        if (v.props && v.props.key) {
          v.key = v.props.key
        }
        return v
      })
      // console.log(this[$slotSymbol])
      const tag = HTML_TAGS[this.tagName] || this.tagName
      const object = typeof tag === 'object'
      const tagClass = typeof tag === 'function'
      const localAttrs = object ? tag.attributes || {} : {}
      const attrs = Object.assign({}, GLOBAL_ATTRIBUTES, localAttrs)
      const tagType = object ? tag.name : tagClass ? tag._tagName : tag
      this.isElement = tagClass ? tag.customElements : true
      this.tagType = tagType
      this.needClass = tagClass || (object && tag.isComponent)
      this.class = this.needClass && (tag.class || tag)
      this.attrs = attrs
      this._name = toCamelCase(tagType)
    }
    this._root = _root // 带搞根结点
  }
  render (key = null, parentELm = null, domFlag) {
    if (this.isText) {
      this.elm = document.createTextNode(this.text)
      return this.elm
    }
    let mark = null
    domFlag = domFlag || (this._root ? getCid(this._root) : (mark = getComponentMark(parentELm), mark && getCid(mark._tagName)))
    let el = null
    // let slot = []
    // 自定义webcomponent

    if (this.needClass) {
      let cacheDom = document.createElement('div')
      // 回调
      cacheDom._parentNode = parentELm
      cacheDom._parentElement = parentELm
      // console.log('slot-render', this.childNodes)
      // fix 隐藏 component 使用方法调用
      //  eslint-disable-next-line new-cap
      let component = new this.class()
      // new 20191223 处理组件内部的slot
      // console.log('components-slot', slot, this)
      forEach(this.childNodes, (v) => {
        if (v instanceof Element) {
          addSlot.call(component, v, v.props.slot)
        } else {
          addSlot.call(component, v, v.getAttribute('slot'))
        }
      })
      component.props = this.props
      component.renderAt(cacheDom)
      setComponentForElm(cacheDom, component)
      el = cacheDom
      // 自定义组件 挂在在其父级的自定义组件上
      let parentCom = getparentCom(parentELm)
      if (parentCom && parentCom.ChildComponentsManage) {
        parentCom.ChildComponentsManage.add(component)
        parentCom = null
      }
      component = null
      // 在下一级组件 添加样式
      domFlag && el.setAttribute(domFlag, '')
    } else {
      // 没有slot了
      // if (this.tagName === 'slot') {
      //   el = document.createDocumentFragment()
      // } else {
      el = document.createElement(this.tagType)
      domFlag && el.setAttribute(domFlag, '')
      // }
      // 处理 slot 更新
      // if (this.tagName === 'slot') {
      // 不需要再 处理solt
      // 20191114
      // 处理slot新的形式
      // let mark = getparentCom(parentELm)
      // // console.log(mark)
      // let slotKey = this.props.name || 'default'
      // el.setAttribute('tag', 'slot')
      // 切换为新的方式
      // if (mark[$slotSymbol] && mark[$slotSymbol][slotKey]) {
      //   // forEach(mark[$slotSymbol][slotKey], (v) => {
      //   //   if (v instanceof Element) {
      //   //     el.appendChild(v.render())
      //   //   } else {
      //   //     // if (v._isComponent) {
      //   //     //   el.appendChild(v.cloneNode(true))
      //   //     // } else {
      //   //     el.appendChild(v)
      //   //     // }
      //   //   }
      //   // })
      // }
      // 埋点 slottHooks
      // mark.__hooks_slot[slotKey] = function (slotKeys) {
      //   // patch(el)
      //   forEach(mark[$slotSymbol][slotKeys], (v) => {
      //     console.log('__hooks_slot', v, el)
      //     if (v instanceof Element) {
      //       el.appendChild(v.render())
      //     } else {
      //       // if (v._isComponent) {
      //       //   el.appendChild(v.cloneNode(true))
      //       // } else {
      //       el.appendChild(v)
      //       // }
      //     }
      //   })
      // }
      // el.isBelong = mark._name
      // doAfterSlotUpdate(el, this, mark.elm.rand, mark)
      // 添加 移除时的事件
      // el.disconnectedCallback = () => {
      //   setSlotState(mark, this.props.name, false)
      // }
      // }
      el._parentNode = parentELm
      el._parentElement = parentELm
    }
    // slot = el.querySelectorAll('[tag=slot]') // 由新的slot 机制代替
    // el.props = this.props
    if (this.props && this.tagName !== 'slot') {
      Object.keys(this.props).forEach(prop => {
        if (prop in this.attrs) {
          if (typeof this.props[prop] === 'function') {
            if (prop === 'ref') {
              this.props[prop](getComponentByElm(el))
            } else {
              // 貌似不需要去编译方法
              // el.setAttribute(this.attrs[prop], this.props[prop](getComponentByElm(el)))
            }
          } else {
            el.setAttribute(this.attrs[prop], this.props[prop])
          }
        } else if (prop in EVENT_HANDLERS) {
          el.addEventListener(EVENT_HANDLERS[prop], this.props[prop])
        } else if (typeof this.props[prop] !== 'function' && !this.class) {
          el.setAttribute(prop, this.props[prop])
        } else if (typeof this.props[prop] === 'function') {
          if (this.isElement) {
            // let fnName = getCallFnName(this, prop) // `${this.tagType}_${prop}_fn`
            el._runfn_ = el._runfn_ || {}
            el._runfn_[getCallFnName(this, prop)] = this.props[prop]
            // el.setAttribute(prop, fnName)
          } else {
            //  不需要赋值
            // this.props[prop] = this.props[prop]()
          }
        } else if (prop.indexOf('com-') === 0) {
          el.setAttribute(prop, '')
        }
      })
      // 兼容 style 是字符串形式
      if ('style' in this.props) {
        const styles = this.props.style
        if (typeof styles === 'object') {
          Object.keys(styles).forEach(prop => {
            const value = styles[prop]
            if (typeof value === 'number') {
              if (prop !== 'zIndex') {
                el.style[prop] = `${ value }px`
              } else {
                el.style[prop] = `${ value }`
              }
            } else if (typeof value === 'string') {
              el.style[prop] = value
            } else {
              throw new Error(`Expected "number" or "string" but received "${ typeof value }"`)
            }
          })
        } else {
          el.setAttribute('style', styles)
        }
      }
    }
    // if (slot.length) {
    //   forEach(slot, (v) => {
    //     setSlotState(getComponentByElm(el), v.getAttribute('name'), false)
    //   })
    // }

    // 组件内部使用
    // if (slot.length && this.childNodes) {
    // new
    // let coms = getComponentByElm(el)
    // console.log('components-slot', slot, this)
    // forEach(this.childNodes, (v) => {
    //   addSlot.call(coms, v, v.props.slot)
    // })
    // old
    // this.rand = this.rand || Math.random()
    // el.rand = this.rand
    // cacheLib.set(this._name + 'slot-' + this.rand, this.childNodes)
    // let coms = getComponentByElm(el)
    // if (el.beforeDisconnectedCallback) {
    //   coms.addDestory(() => {
    //     cacheLib.del(this._name + 'slot-' + this.rand)
    //   })
    // }
    // // 检测插槽 是否有内容填充
    // coms = null
    // }
    // 处理组件在最顶层时 slot 情况
    // let comsOri = getparentCom(parentELm._parentElement)
    // if (comsOri && comsOri[$slotSymbol].length) {
    //   // slot = el.querySelectorAll('[tag=slot]')
    //   comsOri.elm.rand = comsOri.elm.rand || Math.random()
    //   this.rand = comsOri.elm.rand
    //   let _names = comsOri._name
    //   cacheLib.set(_names + 'slot-' + this.rand, comsOri._childrenOri)
    //   // 组件使用结束-销毁
    //   comsOri.addDestory(() => {
    //     cacheLib.del(_names + 'slot-' + this.rand)
    //   })
    //   comsOri = null
    // }
    // fix 简单组件渲染时 获取不到slot
    // 渲染子组件
    this.childNodes.forEach((child, key) => {
      let newParents = el.isComponent ? null : el // getRenderElmBySlot(slot, child, el) 已经舍去
      if (newParents) {
        if (child instanceof Element) {
          // 优化若是null 就不进行下一步操作了
          if (newParents) {
            // console.log('appendChild:nodeOps.default.appendChild', nodeOps.appendChild)
            nodeOps.appendChild(newParents, child.render(key, el))
          }
        } else {
          nodeOps.appendChild(newParents, child)
        }
      }
    })
    // if (this.tagName === 'slot') {
    //   this.elm = el.childNodes[0]
    //   this.elmSize = el.childNodes.length
    //   if (parentELm) {
    //     // 设置slot 标示
    //     parentELm.hasslot = true
    //   }
    // } else {
    this.elm = el
    // }
    return el
  }
}
// do slot 更新后的slot数据渲染
// 只有
/*
function doAfterSlotUpdate (el, context, rand, parentCom) {
  let childNodes = cacheLib.get(el.isBelong + 'slot-' + rand)
  // console.log('doAfterSlotUpdate', rand, childNodes, el, context, el.isBelong + 'slot-' + rand)
  if (childNodes && childNodes.length) {
    let name = context.props.name
    let hasSlothContent = false
    forEach(childNodes, (v, i) => {
      if (name) {
        if (v.render && v.props) {
          if (name === v.props.slot) {
            nodeOps.appendChild(el, v.render(i, el))
            hasSlothContent = !0
          }
        } else {
          if (name === v.getAttribute('slot')) {
            nodeOps.appendChild(el, v)
            hasSlothContent = !0
          }
        }
      } else {
        if (v.render) {
          nodeOps.appendChild(el, v.render(i, el))
          hasSlothContent = !0
        } else {
          nodeOps.appendChild(el, v)
          hasSlothContent = !0
        }
      }
    })
    // console.log(parentCom, name, hasSlothContent)
    setSlotState(parentCom, name, hasSlothContent)
  }
}
*/
// 修改 slot状态
// function setSlotState (coms, name, hasSlothContent) {
//   // 修复 不存在coms时
//   if (!coms) {
//     return
//   }
//   // 标注slot是否有东西
//   coms.$slot = coms.$slot || {}
//   if (name) {
//     coms.$slot[name] = hasSlothContent
//   } else {
//     coms.$slot[0] = hasSlothContent
//   }
// }
// 添加 组件内slot 区分；slot不能越级渲染,越级渲染只是处在顶层组件中 ---- 舍去
// function getRenderElmBySlot (slot, child, el, slotBelong = null) {
//   // 先获取 slot所属一样的
//   if (slot.length) {
//     let slotName = child.props ? child.props.slot : child.attributes ? child.getAttribute('slot') : false
//     if (slotName) {
//       let l = 0
//       // eslint-disable-next-line no-cond-assign
//       for (let i = 0, v; v = slot[i]; i++) {
//         if (slotBelong && slotBelong !== v.isBelong) {
//           continue
//         }
//         l++
//         if ((!slotBelong || l > 1) && !v.getAttribute('name')) {
//           console.warn(`
//           当 【slot】 多于一个的时候，必须要用name区分开，

//           否则将在【slot】出现改动的时候会时【slot】渲染出错

//           >> 位于 【${v.isBelong}】 组件内
//           `)
//         }
//         if (v.getAttribute('name') === slotName) {
//           setSlotState(getComponentByElm(el), slotName, true)
//           return v
//         }
//       }
//       // 修改成 若指定了 slot 必须渲染到改slot里
//       return null
//     } else {
//       let l = []
//       // eslint-disable-next-line no-cond-assign
//       for (let i = 0, v; v = slot[i]; i++) {
//         if (slotBelong && slotBelong !== v.isBelong) {
//           continue
//         }
//         l.push(v)
//         if ((!slotBelong || l.length > 1) && !v.getAttribute('name')) {
//           console.warn(`
//           当 【slot】 多于一个的时候，必须要用name区分开，

//           否则将在【slot】出现改动的时候会时【slot】渲染出错

//           >> 位于 【${v.isBelong} 】 组件内
//           `)
//         }
//       }
//       // 修复 只有一个slot且存在name时没有指定slot值不再渲染
//       if (l.length === 1 && !l[0].getAttribute('name')) {
//         return l[l.length - 1]
//       }
//     }
//     return null
//   }
//   // 优化 若是组件没有slot将不渲染
//   return el.isComponent ? null : el
// }

export function renderElement (dom) {
  return (dom instanceof Element)
    ? dom.render() // 如果子节点也是虚拟DOM，递归构建DOM节点
    : document.createTextNode(dom) // 如果字符串，只构建文本节点
}
export function createElementJson (tagName, props = {}, childNodes, root) {
  return new Element(tagName, props, childNodes, root)
}
export function _createElementJson (tagName, props = {}, ...childNodes) {
  // childNodes = childNodes.length ? childNodes : undefined
  return createElementJson(tagName, props, childNodes)
}

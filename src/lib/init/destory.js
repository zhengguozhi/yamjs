/*
 * @Author: xuxueliang
 * @Date: 2019-06-25 13:56:05
 * @LastEditors: xuxueliang
 * @LastEditTime: 2020-03-12 13:22:54
 */
import cacheLib from '../utils/cacheLib'
import { guid2 } from '../utils/index'
let destoryId = 0
class Destory {
  constructor(context) {
    this.id = 'beforeDestroyCall' + '-' + (context._eid || guid2())
    cacheLib.set(this.id, {})
  }
  get () {
    return cacheLib.get(this.id)
  }
  add (fn) {
    let beforeDestroyCall = this.get()
    let guid = ++destoryId
    beforeDestroyCall[guid] = fn
    beforeDestroyCall = null
    return guid
  }
  del (eventId) {
    let beforeDestroyCall = this.get()
    let fn = beforeDestroyCall[eventId]
    delete beforeDestroyCall[eventId]
    beforeDestroyCall = null
    return fn
  }
  run () {
    let beforeDestroyCall = this.get()
    for (let i in beforeDestroyCall) {
      typeof beforeDestroyCall[i] === 'function' && beforeDestroyCall[i]()
    }
    beforeDestroyCall = null
    cacheLib.del(this.id)
  }
}
export default Destory

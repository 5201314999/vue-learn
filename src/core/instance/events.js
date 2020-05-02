/* @flow */

import {
  tip,
  toArray,
  hyphenate,
  handleError,
  formatComponentName
} from '../util/index'
import { updateListeners } from '../vdom/helpers/index'

export function initEvents (vm: Component) {
  // 创建一个纯粹的对象
  vm._events = Object.create(null)
  vm._hasHookEvent = false
  // init parent attached events (不知道_parentListeners ，跑例子重现不出)
  const listeners = vm.$options._parentListeners
  if (listeners) {
    // 父组件的监听器更新到自己上面
    updateComponentListeners(vm, listeners)
  }
}

let target: any

function add (event, fn, once) {
  if (once) {
    target.$once(event, fn)
  } else {
    target.$on(event, fn)
  }
}

function remove (event, fn) {
  target.$off(event, fn)
}

export function updateComponentListeners (
  vm: Component,
  listeners: Object,
  oldListeners: ?Object
) {
  target = vm
  updateListeners(listeners, oldListeners || {}, add, remove, vm)
  target = undefined
}

export function eventsMixin (Vue: Class<Component>) {
  const hookRE = /^hook:/
  Vue.prototype.$on = function (event: string | Array<string>, fn: Function): Component {
    const vm: Component = this
    if (Array.isArray(event)) {
      for (let i = 0, l = event.length; i < l; i++) {
        vm.$on(event[i], fn)
      }
    } else {
      // 把函数放到vm._events[event] 数组中，实例中有有多个监听处理的的场景，举例子：空vue 作为事件总线的场景
      (vm._events[event] || (vm._events[event] = [])).push(fn)
      // optimize hook:event cost by using a boolean flag marked at registration
      // instead of a hash lookup
      // 使用标志优化钩子的查找，hook：事件是生命钩子 @hook:mounted 时 ，全局搜索LIFECYCLE_HOOKS ，一共11个
      if (hookRE.test(event)) {
        vm._hasHookEvent = true
      }
    }
    return vm
  }
  // 只监听一次，就取消监听。（思考一下自己怎么写：1全局标志，使用闭包  2.fn 执行后清空 off， 组成新的fn）
  // newFn=()=>{
  //   fn.apply(arguments)
  //   Vue.off(event)
  // }
  Vue.prototype.$once = function (event: string, fn: Function): Component {
    const vm: Component = this
    function on () {
      vm.$off(event, on)
      fn.apply(vm, arguments)
    }
    //应该是留作访问接口
    on.fn = fn
    vm.$on(event, on)
    return vm
  }

  // 移除
  Vue.prototype.$off = function (event?: string | Array<string>, fn?: Function): Component {
    const vm: Component = this
    // all 非理想情况处理
    if (!arguments.length) {
      vm._events = Object.create(null)
      return vm
    }
    // array of events 事件数组时
    if (Array.isArray(event)) {
      for (let i = 0, l = event.length; i < l; i++) {
        vm.$off(event[i], fn)
      }
      return vm
    }
    // specific event 一个事件时
    const cbs = vm._events[event]
    if (!cbs) {
      return vm
    }
    if (!fn) {
      vm._events[event] = null
      return vm
    }
    // 实例上有多个监听，只取消其中一个
    if (fn) {
      // specific handler
      let cb
      let i = cbs.length
      while (i--) {
        cb = cbs[i]
        if (cb === fn || cb.fn === fn) {
          cbs.splice(i, 1)
          break
        }
      }
    }
    return vm
  }
  // 促发事件， 触发不支持数组，确实比较合理，没必要
  // 触发找到事件执行
  Vue.prototype.$emit = function (event: string): Component {
    const vm: Component = this
    // 非开发环境，警告，场景不清楚 怎么会转小写，还有小写事件的。
    if (process.env.NODE_ENV !== 'production') {
      const lowerCaseEvent = event.toLowerCase()
      if (lowerCaseEvent !== event && vm._events[lowerCaseEvent]) {
        tip(
          `Event "${lowerCaseEvent}" is emitted in component ` +
          `${formatComponentName(vm)} but the handler is registered for "${event}". ` +
          `Note that HTML attributes are case-insensitive and you cannot use ` +
          `v-on to listen to camelCase events when using in-DOM templates. ` +
          `You should probably use "${hyphenate(event)}" instead of "${event}".`
        )
      }
    }
    let cbs = vm._events[event]
    if (cbs) {
      cbs = cbs.length > 1 ? toArray(cbs) : cbs
      const args = toArray(arguments, 1)
      for (let i = 0, l = cbs.length; i < l; i++) {
        try {
          cbs[i].apply(vm, args)
        } catch (e) {
          handleError(e, vm, `event handler for "${event}"`)
        }
      }
    }
    return vm
  }
}

/* @flow */

import config from '../config'
import { warn } from './debug'
import { inBrowser, inWeex } from './env'

// 异常处理，前端异常处理（值得学习，业务中比较少接触，errorCaptured 提供业务指定接口，vue api 有说明）
export function handleError (err: Error, vm: any, info: string) {
  if (vm) {
    let cur = vm
    while ((cur = cur.$parent)) {
      const hooks = cur.$options.errorCaptured
      if (hooks) {
        // 类比vue 实例充当事件总线添加多个错误处理，不同地方抛出
        for (let i = 0; i < hooks.length; i++) {
          try {
            const capture = hooks[i].call(cur, err, vm, info) === false
            if (capture) return
          } catch (e) {
            globalHandleError(e, cur, 'errorCaptured hook')
          }
        }
      }
    }
  }
  globalHandleError(err, vm, info)
}
// 全局处理，先errorCaptured这种方式，不行才调用log 处理
function globalHandleError (err, vm, info) {
  if (config.errorHandler) {
    try {
      return config.errorHandler.call(null, err, vm, info)
    } catch (e) {
      logError(e, null, 'config.errorHandler')
    }
  }
  logError(err, vm, info)
}
// 浏览器使用console
function logError (err, vm, info) {
  if (process.env.NODE_ENV !== 'production') {
    warn(`Error in ${info}: "${err.toString()}"`, vm)
  }
  /* istanbul ignore else */
  if ((inBrowser || inWeex) && typeof console !== 'undefined') {
    console.error(err)
  } else {
    throw err
  }
}

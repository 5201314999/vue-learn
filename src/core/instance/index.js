import { initMixin } from './init'
import { stateMixin } from './state'
import { renderMixin } from './render'
import { eventsMixin } from './events'
import { lifecycleMixin } from './lifecycle'
import { warn } from '../util/index'

/**
 * 响应式系统
 * vnnode 更新机制
 * @param {} options 
 */
function Vue (options) {
  // 非生产模式，发出 Vue 只能以构造函数方式使用
  if (process.env.NODE_ENV !== 'production' &&
    !(this instanceof Vue)
  ) {
    warn('Vue is a constructor and should be called with the `new` keyword')
  }
  // 传入选项进行初始化
  this._init(options)
}

// 为vue 混合多个（初始化，状态，事件，生命周期，render)功能
initMixin(Vue)
stateMixin(Vue)
eventsMixin(Vue)
lifecycleMixin(Vue)
renderMixin(Vue)

export default Vue

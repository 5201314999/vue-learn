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

// 为vue 混合多个（初始化，状态，事件，生命周期，render)功能，主要是通过往改造函数的原型上增加函数的方式来实现
// 注入_init() ,触发beforeCreate 和 created
initMixin(Vue)
// 注入$data,$props, $watch,$set，$delete 方法， 实现了了 $data 和$props 以及$watch api 实例方法/数据
stateMixin(Vue)
// 注入$on,$once,$emit,$off ，设计时一般支持多个事件，数组或者空格字符串 实例方法/事件
eventsMixin(Vue)
// 注入$destroy，$forceUpdate,_update,事件的销毁和更新，$mount 不在此文件，跟平台相关 实例方法/生命周期
lifecycleMixin(Vue)
renderMixin(Vue)

export default Vue

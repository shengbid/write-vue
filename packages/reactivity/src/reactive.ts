import { isObject } from "@vue/shared"
import {
  reactiveHandlers,
  shallowReactiveHandlers,
  readonlyHandlers,
  shallowReadonlyHandlers,
} from "./baseHandler"

export function reactive(target) {
  return createReactObj(target, false, reactiveHandlers)
}
export function shallowReactive(target) {
  return createReactObj(target, false, shallowReactiveHandlers)
}
export function readonly(target) {
  return createReactObj(target, true, readonlyHandlers)
}
export function shallowReadonly(target) {
  return createReactObj(target, true, shallowReadonlyHandlers)
}
// 数据结构
const reactiveMap = new WeakMap() // key必须是对象, 自动的垃圾回收
const readonlyMap = new WeakMap()
function createReactObj(target, isReadonly, baseHandlers) {
  if (!isObject(target)) {
    return target
  }
  // 代理成功后不需要再代理
  const proxymap = isReadonly ? readonlyMap : reactiveMap
  const proxyEs = proxymap.get(target) // 如果有值
  if (proxyEs) {
    return proxyEs
  }
  const proxy = new Proxy(target, baseHandlers)
  // 代理后存入map中
  proxymap.set(target, proxy)
  return proxy
}

// 注意 核心proxy
// let state = reactive({name: '张三'})

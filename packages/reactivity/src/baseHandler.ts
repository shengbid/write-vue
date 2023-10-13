import {
  isObject,
  extend,
  isArray,
  haseChange,
  isIntegerKey,
  hasOwn,
} from "@vue/shared"
import { reactive, readonly } from "./reactive"
import { TrackOpTypes, TriggerOpTypes } from "./operations"
import { Track, trigger } from "./effect"

const get = createGetter()
const shallowGet = createGetter(false, true)
const readonlyGet = createGetter(true)
const shallowReadonlyGet = createGetter(true, true)

const set = createSetter()
const shallowSet = createSetter(true)

// get方法
function createGetter(isReadonly = false, shallow = false) {
  return function get(target, key, receiver) {
    const res = Reflect.get(target, key, receiver)
    // 判断
    if (!isReadonly) {
      // 是否只读
      // 收集依赖 effect
      Track(target, TrackOpTypes.GET, key)
    }

    if (shallow) {
      // 浅层代理
      return res
    }
    // res是一个对象 递归 懒代理
    if (isObject(res)) {
      return isReadonly ? readonly(res) : reactive(res)
    }

    return res
  }
}
// set方法
function createSetter(shallow = false) {
  return function set(target, key, value, receiver) {
    // 可以对数组进行代理
    const oldValue = target[key]
    // 判断是数组还是对象
    // 添加还是修改 (Number(key) < target.length)数组下标和数组长度比较, 小于是修改
    // haskey为false 新增 true修改
    const result = Reflect.set(target, key, value, receiver)
    const haskey =
      isArray(target) && isIntegerKey(key)
        ? Number(key) < target.length
        : hasOwn(target, key)
    if (!haskey) {
      // 新增
      trigger(target, TriggerOpTypes.ADD, key, value)
    } else {
      // 修改
      if (haseChange(value, oldValue)) {
        trigger(target, TriggerOpTypes.SET, key, value, oldValue)
      }
    }
    return result
  }
}

export const reactiveHandlers = {
  get,
  set,
}
export const shallowReactiveHandlers = {
  get: shallowGet,
  set: shallowSet,
}
// 进行set方法合并
let readonlyObj = {
  set: (target, key, value) => {
    console.log(`set ${value} on key ${key} is faild`)
  },
}
export const readonlyHandlers = extend(
  {
    get: readonlyGet,
  },
  readonlyObj
)
export const shallowReadonlyHandlers = extend(
  {
    get: shallowReadonlyGet,
  },
  readonlyObj
)

import { haseChange, isArray } from "@vue/shared"
import { Track, trigger } from "./effect"
import { TrackOpTypes, TriggerOpTypes } from "./operations"

// 使用 toRef
export function ref(target) {
  return createRef(target)
}

export function shallowRef(target) {
  return createRef(target, true)
}

// 创建类
class RefImpl {
  // 属性
  public __v_isRef = true // ref标识
  public _value
  constructor(public rawValue, public shallow) {
    this._value = rawValue // 用户传入的值
  }

  // 类的属性访问器 实现响应式
  get value() {
    // 获取值
    Track(this, TrackOpTypes.GET, "value") // 收集依赖
    return this._value
  }
  set value(newValue) {
    // 设置值
    // 触发更新
    if (haseChange(newValue, this._value)) {
      this._value = newValue
      this.rawValue = newValue
      trigger(this, TriggerOpTypes.SET, "value", newValue)
    }
    this._value = newValue
  }
}

function createRef(rawValue, shallow = false) {
  // 创建ref 实例对象
  return new RefImpl(rawValue, shallow)
}

// 实现toRef
export function toRef(target, key) {
  return new ObjectRefImpl(target, key)
}

class ObjectRefImpl {
  public __v_isRef = true
  constructor(public target, public key) {}
  get value() {
    return this.target[this.key]
  }
  set value(newValue) {
    this.target[this.key] = newValue
  }
}

// 实现toRefs
export function toRefs(target) {
  // 遍历
  let ret = isArray(target) ? new Array(target.length) : {}
  for (let key in target) {
    ret[key] = toRef(target, key)
  }
  return ret
}

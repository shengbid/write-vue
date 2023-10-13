import { isFunction } from "@vue/shared"
import { effect } from "./effect"

export function computed(getterOrOptions) {
  // 1 函数 2对象
  // 处理函数
  let getter // 获取
  let setter // 设置数据
  if (isFunction(getterOrOptions)) {
    ;(getter = getterOrOptions),
      (setter = () => {
        console.warn("computed value must be readonly")
      })
  } else {
    getter = getterOrOptions.get
    setter = getterOrOptions.set
  }
  // 返回值
  return new ComputedRefImpl(getter, setter)
}

class ComputedRefImpl {
  // 定义属性
  public _dirty = true // 默认获取执行
  public _value
  public effect
  constructor(getter, public setter) {
    // 这个effect默认不执行
    this.effect = effect(getter, {
      lazy: true,
      sch: () => {
        // 修改数据的时候执行
        if (!this._dirty) {
          this._dirty = true
        }
      },
    })
  }

  // 获取
  get value() {
    // 获取effect执行
    if (this._dirty) {
      this._value = this.effect()
      this._dirty = false
    }
    return this._value
  }
  set value(newValue) {
    this.setter(newValue)
  }
}

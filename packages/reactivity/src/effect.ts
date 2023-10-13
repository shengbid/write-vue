import { isArray, isIntegerKey } from "@vue/shared"
import { TriggerOpTypes } from "./operations"

export function effect(fn, options: any = {}) {
  const effect = createReactEffect(fn, options)
  // 判断一下
  if (!options.lazy) {
    effect()
  }
  return effect
}

let uid = 0
let activeEffect // 保存当前的effect
const effectStack = []
function createReactEffect(fn, options) {
  const effect = function reactiveEffect() {
    if (!effectStack.includes(effect)) {
      // 避免重复使用

      try {
        // 入栈
        activeEffect = effect
        effectStack.push(activeEffect)
        return fn()
      } finally {
        // try里面的方法执行完毕,不管有没有错误都往下执行
        // 出栈
        effectStack.pop()
        const n = effectStack.length
        activeEffect = n > 0 ? effectStack[n - 1] : undefined
      }
    }
  }
  effect.id = uid++ // 区分effect
  effect._isEffect = true // 区分effect是不是响应式的effect
  effect.raw = fn // 保存用户的方法
  effect.options = options // 保存用户的属性

  return effect
}

// 3.收集effect 在获取数据的时候触发 get
let targetMap = new WeakMap()
export function Track(target, type, key) {
  // 对应的key
  // console.log(target, type, key, activeEffect)
  // key和我们的effect一一对应 map=>key=target=>属性=>[effect] set
  if (activeEffect === undefined) {
    // 没有在effect中使用
    return
  }
  // 获取effect
  let depMap = targetMap.get(target)
  if (!depMap) {
    // 没有值添加
    targetMap.set(target, (depMap = new Map()))
  }
  let dep = depMap.get(key)
  if (!dep) {
    depMap.set(key, (dep = new Set()))
  }
  if (!dep.has(activeEffect)) {
    dep.add(activeEffect)
  }
  // console.log(targetMap)
}

// 嵌套问题
// effect(() => {
//   // 执行get方法
//   app.innerHTML = obj.name // 收集effect1
//   effect(() => {
//     obj.age // 收集effect2
//   })
//   obj.sex // 收集effect1
//   console.log(500)
// })

// 触发更新
export function trigger(target, type, key?, newValue?, oldValue?) {
  // console.log(target, type, key, newValue, oldValue)

  const depsMap = targetMap.get(target)
  // 判断是否有目标对象
  if (!depsMap) return
  // let effects = depsMap.get(key)
  let effectSet = new Set() // set格式可以去重
  const add = (effectAdd) => {
    if (effectAdd) {
      effectAdd.forEach((effect) => effectSet.add(effect))
    }
  }
  add(depsMap.get(key)) // 获取当前属性的effect

  // 处理数组 key === length
  if (key === "length" && isArray(target)) {
    depsMap.forEach((dep, key) => {
      if (key === "length" || key >= newValue) {
        add(dep)
      }
    })
  } else {
    // 可能是对象
    if (key != undefined) {
      add(depsMap.get(key)) // 获取当前属性的effect
    }
    switch (type) {
      case TriggerOpTypes.ADD:
        if (isArray(target) && isIntegerKey(key)) {
          add(depsMap.get("length"))
        }
    }
  }
  // 执行
  effectSet.forEach((effect: any) => {
    if (effect.options.sch) {
      effect.options.sch(effect)
    } else {
      effect()
    }
  })
}

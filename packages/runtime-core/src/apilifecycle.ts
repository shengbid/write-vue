import { currentInstance, setCurrentInstance } from "./component"
// 生命周期

// 枚举
const enum lifeCycle {
  BEFORE_MOUNT = "bm",
  MOUNTED = "m",
  BEFORE_UPDATE = "bu",
  UPDATED = "u",
}

// 写4个生命周期
export const onBeforeMount = createHook(lifeCycle.BEFORE_MOUNT)
export const onMounted = createHook(lifeCycle.MOUNTED)
export const onBeforeUpdate = createHook(lifeCycle.BEFORE_UPDATE)
export const onUpdated = createHook(lifeCycle.UPDATED)

// 生命周期
function createHook(lifeCycle) {
  // 核心就是这个生命周期要和当前组件实例产生关联
  // 注意 第一参数就是生命周期中的方法 第二个参数是当前实例
  return function (hook, target = currentInstance) {
    // 获取到当前组件的实例 和生命周期产生关联
    injectHook(lifeCycle, hook, target)
  }
}

function injectHook(lifeCycle, hook, target) {
  // 注意 vue3中的生命周期都是在setup中使用
  if (!target) {
    return
  }
  // 给这个实例添加生命周期
  const hooks = target[lifeCycle] || (target[lifeCycle] = [])
  // vue3源码 用了一个切片
  const rap = () => {
    setCurrentInstance(target)
    hook() // 执行生命周期前存放一个当前的实例
    setCurrentInstance(null)
  }
  hooks.push(rap) // hook就是你生命周期中的方法
}
// 生命周期的执行
export function invokeArrayFns(FnArr) {
  // 遍历
  FnArr.forEach((item) => item())
}

// 1在setup调用全局的instance
// 2执行的生命周期 获取的实例 就是全局的
// 3在setup执行文本 全局instance = null

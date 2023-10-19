// 事件处理
// 元素事件绑定 addEventListener
export const patchEvent = (el, key, value) => {
  // 1对函数缓存
  const invokers = el._vei || (el._vei = {})
  const exists = invokers[key]
  if (exists && value) {
    exists.value = value
  } else {
    // 获取事件名称 1新值没有 2新值没有

    const eventName = key.slice(2).toLowerCase()
    if (value) {
      // 新值有
      let invoker = (invokers[eventName] = createInvoker(value))
      el.addEventListener(eventName, invoker)
    } else {
      // 没有值
      el.removeEventListener(eventName, exists)
      invokers[eventName] = undefined // 清除缓存
    }
  }
}

function createInvoker(value) {
  const invoker = (e) => {
    invoker.value(e)
  }
  invoker.value = value
  return invoker
}

// 给元素缓存一个绑定的事件
// 三种情况
// 1如果旧值没有值 新值有 添加值, 缓存
// 2如果旧值有  新值没有 删除值 删除缓存
// 3旧值和新值都有 将新值覆盖旧值

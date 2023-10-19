// 属性操作
// 策略模式  div class style onClick
import { patchClass } from "./modules/class"
import { patchStyle } from "./modules/style"
import { patchAttr } from "./modules/attr"
import { patchEvent } from "./modules/event"

export const patchProp = (el, key, prevValue, nextValue) => {
  switch (key) {
    case "class":
      patchClass(el, nextValue)
      break
    case "style":
      patchStyle(el, prevValue, nextValue)
      break

    default:
      if (/^on[^a-z]*/.test(key)) {
        // 是不是事件
        patchEvent(el, key, nextValue)
      } else {
        patchAttr(el, key, nextValue)
      }
      break
  }
}

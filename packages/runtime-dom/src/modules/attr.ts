// 自定义属性
export const patchAttr = (el, key, value) => {
  if (value == null) {
    el.removeAttribute(key)
  } else {
    el.removeAttribute(key, value)
  }
}

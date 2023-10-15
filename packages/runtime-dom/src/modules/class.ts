// 处理class
export const patchClass = (el, value) => {
  if (value == null) {
    value = ""
  }
  // 对这个标签的class赋值 1如果没有值赋值为空 2如果有新的覆盖
  el.className = value
}

// style处理
export const patchStyle = (el, prev, next) => {
  const style = el.style

  if (next == null) {
    el.removeAttribute("style")
  } else {
    // 注意 旧值有 新值没有
    if (prev) {
      for (let key in prev) {
        if (next[key] == null) {
          style[key] = ""
        }
      }
    }
    // 新值赋值到style
    for (let key in next) {
      style[key] = next[key]
    }
  }
}

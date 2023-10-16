import { apiCreateApp } from "./apiCreateApp"
// 渲染方法 放在runtime-core
export function createRender(renderOptionDom) {
  // 返回对象
  let render = (vnode, container) => {}
  return {
    createApp: apiCreateApp(render),
  }
}

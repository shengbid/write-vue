// runtime-dom 操作DOM  1节点 2属性

// 创建两个文件

import { extend } from "@vue/shared"
import { nodeOps } from "./nodeOps"
import { patchProp } from "./patchProp"
import { createRender } from "@vue/runtime-core"

const renderOptionDom = extend({ patchProp }, nodeOps)

// createApp
export const createApp = (rootComponent, rootProps) => {
  let app = createRender(renderOptionDom).createApp(rootComponent, rootProps)
  let { mount } = app
  app.mount = function (container) {
    // #app
    // 挂载组件
    // 清空
    container = nodeOps.querySelector(container)
    container.innerHTML = ""
    // 将组件渲染的DOM元素进行挂载
    mount(container)
  }
  return app
}

// export { renderOptionDom }

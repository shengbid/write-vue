// runtime-dom 操作DOM  1节点 2属性

// 创建两个文件

import { extend } from "@vue/shared"
import { nodeOps } from "./nodeOps"
import { patchProp } from "./patchProp"

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

// 渲染方法 放在runtime-core
function createRender(renderOptionDom) {
  return {
    createApp(rootComponent, rootProps) {
      let app = {
        mount(container) {
          // 挂载的位置
          console.log(rootComponent, rootProps)
        },
      }
      return app
    },
  }
}

// export { renderOptionDom }

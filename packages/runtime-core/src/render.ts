import { ShapeFlags } from "@vue/shared"
import { apiCreateApp } from "./apiCreateApp"
import {
  createComponentInstance,
  setupComponent,
  setupRenderEffect,
} from "./component"
// 渲染方法 放在runtime-core
export function createRender(renderOptionDom) {
  const mountComponent = (InitialVnode, container) => {
    // 组件的渲染流程
    // 1先有一个组件的实例对象 render(proxy)
    const instance = (InitialVnode.component = createComponentInstance(
      InitialVnode
    ))
    // 2解析数据到这个实例对象当中
    setupComponent(instance)
    // 3创建一个effect 让render函数执行
    setupRenderEffect()
  }
  // 组件的创建
  const processComponent = (n1, n2, container) => {
    if (n1 == null) {
      // 第一次加载
      mountComponent(n2, container)
    } else {
      // 更新
    }
  }
  const patch = (n1, n2, container) => {
    // 针对不同的类型 1组件 2元素
    let { shapeFlag } = n2

    if (shapeFlag & ShapeFlags.ELEMENT) {
      // 元素
    } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
      // 组件
      processComponent(n1, n2, container)
    }
  }
  // 返回对象
  let render = (vnode, container) => {
    // 组件初始化
    // 调用render, 第一次渲染
    patch(null, vnode, container) // 旧的节点 当前节点 位置
  }
  return {
    createApp: apiCreateApp(render),
  }
}

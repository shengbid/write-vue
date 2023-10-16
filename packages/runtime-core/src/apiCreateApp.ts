import { createVnode } from "./vnode"
// 创建vnode
export function apiCreateApp(render) {
  return function createApp(rootComponent, rootProps) {
    let app = {
      // 添加相关的属性
      _component: rootComponent,
      _props: rootProps,
      _container: null,
      mount(container) {
        // 挂载的位置
        // console.log(rootComponent, rootProps)
        // 框架 组件 vnode
        // 1vnode
        let vnode = createVnode(rootComponent, rootProps)
        // 2渲染 render(vnode, container)
        render(vnode, container)
        app._container = container
      },
    }
    return app
  }
}

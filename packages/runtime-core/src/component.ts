import { ShapeFlags } from "@vue/shared"
// 创建组件实例
export const createComponentInstance = (vnode) => {
  // 就是一个对象
  const instance = {
    // 组件 props attrs slots
    vnode,
    type: vnode.type, // 组件的类型
    props: {}, // 组件的属性
    attrs: {}, // attrs props my-div a="1" b="2" props: {"a"} attrs
    setupState: {}, // setup返回值
    ctx: {}, // 代理 instance.props.name proxy.name
    proxy: {},
    isMounted: false,
  }
  instance.ctx = { _: instance }
  return instance
}

// 解析数据到组件实例上
export const setupComponent = (instance) => {
  // 设置值
  const { props, children } = instance.vnode
  // 根据这props解析到组件实例上
  instance.props = props // initProps
  instance.children = children // slots 插槽
  // 看一下这个组件有没有setup
  let shapeFlag = instance.vnode.shapeFlag & ShapeFlags.STATEFUL_COMPONENT
  if (shapeFlag) {
    setupStateComponet(instance)
  }
}

function setupStateComponet(instance) {
  // setup返回值是render函数
  // 获取创建的类型拿到组件setup方法
  let Componet = instance.type
  let { setup } = Componet
  // 处理参数
  let setupContext = createContext(instance)
  setup(instance.props, setupContext)
  // render
}

function createContext(instance) {
  return {
    attrs: instance.attrs,
    slots: instance.slots,
    emit: () => {},
    expose: () => {},
  }
}

export const setupRenderEffect = () => {}

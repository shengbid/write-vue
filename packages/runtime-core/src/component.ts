import { isFunction, isObject, ShapeFlags } from "@vue/shared"
import { componentPublicIntance } from "./componentPublicIntance"

// 获取当前实例
export const getCurrentInstance = () => {
  return currentInstance
}
// 设置当前实例
export const setCurrentInstance = (target) => {
  currentInstance = target
}

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
    render: false,
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

// 处理setup
export let currentInstance
function setupStateComponet(instance) {
  // 代理
  instance.proxy = new Proxy(instance.ctx, componentPublicIntance)
  // setup返回值是render函数
  // 获取创建的类型拿到组件setup方法
  let Componet = instance.type
  let { setup } = Componet
  // 处理参数 判断组件是否有setup render
  if (setup) {
    // setup之前 创建全局的currentInstance
    currentInstance = instance
    let setupContext = createContext(instance)
    let setupResult = setup(instance.props, setupContext)
    // setup执行完毕
    currentInstance = null
    // setup的返回值 1对象 2函数
    // 如果是对象,就将值放在setupState 如果是函数,就是render
    handlerSetupResult(instance, setupResult)
  } else {
    // 调用render
    finishComponentSetup(instance)
  }

  // render
  Componet.render(instance.proxy)
}

function handlerSetupResult(instance, setupResult) {
  // 1对象 2函数
  if (isFunction(setupResult)) {
    instance.render = setupResult // setup返回的函数保存到实例上
  } else if (isObject(setupResult)) {
    instance.setupState = setupResult
  }
  finishComponentSetup(instance)
}

function finishComponentSetup(instance) {
  // 判断一下组件中有没有这个render
  let Componet = instance.type
  if (!instance.render) {
    // 模板编译 render
    if (!Componet.render && Componet.template) {
    }
    instance.render = Componet.render
  }
}

function createContext(instance) {
  return {
    attrs: instance.attrs,
    slots: instance.slots,
    emit: () => {},
    expose: () => {},
  }
}

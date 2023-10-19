import { effect } from "@vue/reactivity"
import { ShapeFlags } from "@vue/shared"
import { apiCreateApp } from "./apiCreateApp"
import { createComponentInstance, setupComponent } from "./component"
import { CVnode, TEXT } from "./vnode"
// 渲染方法 放在runtime-core
export function createRender(renderOptionDom) {
  // 获取全部的DOM操作
  const {
    insert: hostInsert,
    remove: hostRemove,
    patchProp: hostPatchProp,
    createElement: hostCreateElement,
    createText: hostCreateText,
    createComment: hostCreateComment,
    setText: hostSetText,
    setElementText: hostSetElementText,
  } = renderOptionDom

  function setupRenderEffect(instance, container) {
    // 创建effect
    effect(function componentEffect() {
      // 需要创建一个effect 在effect中调用render,
      // render方法中获取数据会收集effect, 属性改变 会重新执行
      // 判断 第一次加载
      if (!instance.isMounted) {
        // 获取到render的返回值
        let proxy = instance.proxy
        let subTree = (instance.subTree = instance.render.call(proxy, proxy)) // 执行render
        // 组件渲染的节点
        // 渲染子树
        patch(null, subTree, container)
        instance.isMounted = true
      } else {
        console.log("更新")
        // 比对 旧值和新值
        let proxy = instance.proxy
        const prevTree = instance.subTree
        const nextTree = instance.render.call(proxy, proxy)
        instance.subTree = nextTree
        patch(prevTree, nextTree, container)
      }
    })
  }
  // ---------------处理组件------------------
  const mountComponent = (InitialVnode, container) => {
    // 组件的渲染流程
    // 1先有一个组件的实例对象 render(proxy)
    const instance = (InitialVnode.component = createComponentInstance(
      InitialVnode
    ))
    // 2解析数据到这个实例对象当中
    setupComponent(instance)
    // 3创建一个effect 让render函数执行
    setupRenderEffect(instance, container)
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
  //--------------------------------------------

  // -------------------处理文本-----------------------
  const processText = (n1, n2, container) => {
    if (n1 == null) {
      // 创建文本 渲染到页面
      hostInsert((n2.el = hostCreateText(n2.children)), container)
    }
  }

  // ------------------------------------------------

  // ----------------处理元素--------------------
  function mountChildren(el, children) {
    // 数组循环
    for (let i = 0; i < children.length; i++) {
      let child = CVnode(children[i])
      patch(null, child, el)
    }
  }

  function mountElement(vnode, container) {
    // 递归 渲染
    // vnode h()
    const { props, shapeFlag, type, children } = vnode
    // 创建的元素
    let el = (vnode.el = hostCreateElement(type))
    // 添加属性
    if (props) {
      for (let key in props) {
        hostPatchProp(el, key, null, props[key])
      }
    }
    // 处理children h('div',{style:{color:"red"}}, 'test)
    // 处理children h('div',{style:{color:"red"}}, ['test])
    if (children) {
      if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
        // 子元素是文本,创建文本元素
        hostSetElementText(el, children)
      } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        // 子元素是数组 递归patch
        mountChildren(el, children)
      }
    }
    // 放到对应的位置
    hostInsert(el, container)
  }
  // 属性比对
  const patchProps = (el, oldProps, newProps) => {
    // 旧的有这个属性, 新的没有
    // 循环
    if (oldProps != newProps) {
      for (let key in newProps) {
        const prev = oldProps[key]
        const next = newProps[key]
        if (next != prev) {
          hostPatchProp(el, key, prev, next)
        }
      }
    }
    // 如果旧的里面的属性 新值没有,删除
    for (let key in oldProps) {
      if (!(key in newProps)) {
        hostPatchProp(el, key, oldProps[key], null)
      }
    }
  }
  // 比对children
  const patchChild = (n1,n2,el) =>{
    const c1 = n1.children
    const c2 = n2.children
    // 子元素比对,4种情况
    
  }
  // 同一个元素比对
  const patchElement = (n1, n2, container) => {
    let el = (n2.el = n1.el) // 获取元素真实节点
    const oldProps = n1.props || {}
    const newProps = n2.props || {}
    // 比对属性
    patchProps(el, oldProps, newProps)
    // 比对children
    patchChild(n1,n2,el)
  }
  function processElement(n1, n2, container) {
    if (n1 == null) {
      mountElement(n2, container)
    } else {
      // 更新 同一个元素
      // 比对属性
      patchElement(n1, n2, container)
    }
  }
  //---------------------------------------------

  // 删除元素
  const unmount = (vnode) => {
    hostRemove(vnode.el)
  }
  // 判断是不是同一个元素
  const isSomeVnode = (n1, n2) => {
    return n1.type == n2.type && n1.key == n2.key
  }
  const patch = (n1, n2, container) => {
    // 比对是不是同一个 1判断是不是同一个元素 2同一元素 比对 props children...
    if (n1 && !isSomeVnode(n1, n2)) {
      // 有旧值, 不是同一个元素,直接替换
      unmount(n1)
      n1 = null // 组件加载, 走下面的步骤
    }
    // 针对不同的类型 1组件 2元素 3文本
    let { shapeFlag, type } = n2
    switch (type) {
      case TEXT: // 处理文本
        processText(n1, n2, container)
        break
      default:
        if (shapeFlag & ShapeFlags.ELEMENT) {
          // 元素 处理元素 加载组件
          processElement(n1, n2, container)
        } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
          // 组件
          processComponent(n1, n2, container)
        }
        break
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

// 给组件创建一个instance 添加相关信息
// 处理setup 中的context 有四个参数
// proxy为方便取值

// render 1setup返回值是一个函数 就执行

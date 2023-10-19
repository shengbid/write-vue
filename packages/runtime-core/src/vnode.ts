import { isArray, isObject, isString, ShapeFlags } from "@vue/shared"

// 创建vnode,虚拟节点
export const createVnode = (type, props, children = null) => {
  // 区分是组件 还是元素
  // vnode
  let shapeFlag = isString(type)
    ? ShapeFlags.ELEMENT
    : isObject(type)
    ? ShapeFlags.STATEFUL_COMPONENT
    : 0
  const vnode = {
    _v_isVnode: true, // 是一个vnode节点
    type,
    props,
    children,
    key: props && props.key, // diff算法会用到
    el: null, // 真实的元素和vnode对应
    component: {},
    shapeFlag,
  }

  // 儿子标识
  normallizeChildren(vnode, children)

  return vnode
}

function normallizeChildren(vnode, children) {
  // 进行判断
  let type = 0
  if (children == null) {
  } else if (isArray(children)) {
    // 数组
    type = ShapeFlags.ARRAY_CHILDREN
  } else {
    // 文本
    type = ShapeFlags.TEXT_CHILDREN
  }

  vnode.shapeFlag = vnode.shapeFlag | type
}

// 判断是不是一个vnode
export function isVonde(vnode) {
  return vnode._v_isVnode
}

// 元素的children 变成vnode
export const TEXT = Symbol("text")
export function CVnode(child) {
  // ['text'] [h()]
  if (isObject(child)) return child
  return createVnode(TEXT, null, String(child))
}

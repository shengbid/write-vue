// 创建vnode,虚拟节点
export const createVnode = (type, props, children = null) => {
  // 区分是组件 还是元素
  // vnode
  let shapeFlag
  const vnode = {
    _v_isVnode: true, // 是一个vnode节点
    type,
    props,
    children,
    key: props && props.key, // diff算法会用到
    el: null, // 真实的元素和vnode对应
    shapeFlag,
  }

  return vnode
}

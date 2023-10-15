// 操作节点 增删改查

export const nodeOps = {
  // 创建元素 createElement 不同平台操作DOM方法不一样
  createElement: (tagName) => document.createElement(tagName),
  remove: (child) => {
    // 删除
    const parent = child.parentNode
    if (parent) {
      parent.removeChild(child)
    }
  },
  insert: (child, parent, anchor) => {
    // 插入
    parent.insertBefore(child, anchor || null)
  },
  querySelector: (select) => document.querySelector(select),
  setElementText: (el, text) => (el.textContent = text), // 元素操作
  // 节点操作
  createText: (text) => document.createTextNode(text),
  setText: (node, text) => (node.nodeValue = text),
}

import { effect } from "@vue/reactivity"
import { ShapeFlags } from "@vue/shared"
import { apiCreateApp } from "./apiCreateApp"
import { createComponentInstance, setupComponent } from "./component"
import { CVnode, TEXT } from "./vnode"
import { invokeArrayFns } from "./apilifecycle"

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
        // 渲染之前
        let { bm, m } = instance // 将生命周期放在实例上
        if (bm) {
          invokeArrayFns(bm)
        }
        // 获取到render的返回值
        let proxy = instance.proxy
        let subTree = (instance.subTree = instance.render.call(proxy, proxy)) // 执行render
        // 组件渲染的节点
        // 渲染子树
        patch(null, subTree, container)
        // 渲染完成
        if (m) {
          // 怎么执行生命周期钩子函数
          invokeArrayFns(m)
        }
        instance.isMounted = true
      } else {
        // console.log("更新")
        // 比对 旧值和新值
        let { u, bu } = instance
        if (bu) {
          invokeArrayFns(bu)
        }
        let proxy = instance.proxy
        const prevTree = instance.subTree
        const nextTree = instance.render.call(proxy, proxy)
        instance.subTree = nextTree
        patch(prevTree, nextTree, container)
        if (u) {
          invokeArrayFns(u)
        }
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

  function mountElement(vnode, container, ancher) {
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
    hostInsert(el, container, ancher)
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
  const patchChild = (n1, n2, el) => {
    const c1 = n1.children
    const c2 = n2.children
    // 子元素比对,4种情况
    // 1旧的有 新值没有 2新的有 旧值没有 3都是文本 4 都是数组
    // 都是文本
    const prevShapeFlage = n1.shapeFlag // 旧的标识
    const newShapeFlag = n2.shapeFlag // 新的标识
    // 新的是文本,直接替换旧值
    if (newShapeFlag & ShapeFlags.TEXT_CHILDREN) {
      hostSetElementText(el, c2)
    } else {
      // 新的不是文本 就是数组
      if (prevShapeFlage & ShapeFlags.ARRAY_CHILDREN) {
        // 旧的是数组 新的也是数组
        patchkeyChild(c1, c2, el)
      } else {
        // 旧的是文本, 删除旧文本添加新数组
        hostSetElementText(el, "")
        // 添加新数组
        mountChildren(el, c2)
      }
    }
  }
  // 都是数组的情况
  const patchkeyChild = (c1, c2, el) => {
    // vue2 双指针 vue3同步
    // sync from start 头部比对
    let i = 0
    let e1 = c1.length - 1
    let e2 = c2.length - 1
    // 1 同一位置比对(两个元素不同 停止) 2 哪个数组没有停止
    while (i <= e1 && i <= e2) {
      const n1 = c1[i]
      const n2 = c2[i]
      if (isSomeVnode(n1, n2)) {
        patch(n1, n2, el)
      } else {
        break
      }
      i++ // 对比的位置
    }
    // aync from end 尾部比对
    while (i <= e1 && i <= e2) {
      const n1 = c1[e1]
      const n2 = c2[e2]
      if (isSomeVnode(n1, n2)) {
        patch(n1, n2, el)
      } else {
        break
      }
      e1-- // 对比的位置
      e2--
    }
    console.log(i, e1, e2)
    // 特殊情况
    // 1 新的数据多 旧数据少
    if (i > e1) {
      // 添加数据 头部添加还是尾部添加
      const nextProps = e2 + 1
      // 判断是前面插入 还是后面添加
      const ancher = nextProps < c2.length ? c2[nextProps].el : null
      while (i <= e2) {
        patch(null, c2[i++], el, ancher)
      }
    } else if (i > e2) {
      // 2旧的数据多 新的数据少 (尾部多(头部比较) 头部多(尾部比较))
      // 删除多的数据
      while (i <= e1) {
        unmount(c1[i])
        i++
      }
    } else {
      // 乱序
      // 解决思路 1 以新的乱序个数创建一个映射表 2在用旧的乱序 的数据去新的表中找
      // 如果有就复用 没有就删除
      let s1 = i
      let s2 = i
      // 解决乱序比对的问题 1比对后数组位置不对 2新创建元素没添加
      const toBePatched = e2 - s2 + 1 // 乱序的个数

      // 创建数组
      const newIndexToPatchMap = new Array(toBePatched).fill(0)

      // 创建表
      let keyIndexMap = new Map()

      // 用新的乱序的数据创建表
      for (let i = s2; i <= e2; i++) {
        const childVnode = c2[i] // 获取到的是乱序的vnode
        keyIndexMap.set(childVnode.key, i)
      }
      // 去旧的里面比对
      for (let i = s1; i <= e1; i++) {
        const oldChildVnode = c1[i]
        let newIndex = keyIndexMap.get(oldChildVnode.key)
        if (newIndex == undefined) {
          // 如果旧的数据没有
          unmount(oldChildVnode)
        } else {
          // 旧的和新的关系 索引的关系
          newIndexToPatchMap[newIndex - s2] = i + 1 // 就是老的索引的位置
          // 如果旧的数据也有 比对
          patch(oldChildVnode, c2[newIndex], el)
        }
      }

      // 移动节点 添加新增的元素 方法 倒序循环
      const increasingNewIndexSequence = getSequence(newIndexToPatchMap)
      console.log(increasingNewIndexSequence)
      let j = increasingNewIndexSequence.length - 1
      for (let i = toBePatched - 1; i >= 0; i--) {
        let currentIndex = i + s2 // 新增元素的索引
        let child = c2[currentIndex]
        // 添加位置
        let ancher =
          currentIndex + 1 < c2.length ? c2[currentIndex + 1].el : null
        // 第一次插入新元素
        if (newIndexToPatchMap[i] === 0) {
          // 插入新元素
          patch(null, child, el, ancher)
        } else {
          // 调整数组排序
          // 此时数据是旧的数据的排序, 根据新的顺序插入, 会去掉原来的数据
          // 重复插入相同数据,旧数据会去掉,显示最新插入的数据
          // hostInsert(child.el, el, ancher) // 调用两次插入,最终只会有一个数据
          if (i != increasingNewIndexSequence[j]) {
            hostInsert(child.el, el, ancher)
          } else {
            // 相同的不需要再插入
            j--
          }
        }
      }
    }
  }
  // 同一个元素比对
  const patchElement = (n1, n2, container, ancher) => {
    let el = (n2.el = n1.el) // 获取元素真实节点
    const oldProps = n1.props || {}
    const newProps = n2.props || {}
    // 比对属性
    patchProps(el, oldProps, newProps)
    // 比对children
    patchChild(n1, n2, el)
  }
  function processElement(n1, n2, container, ancher) {
    if (n1 == null) {
      mountElement(n2, container, ancher)
    } else {
      // 更新 同一个元素
      // 比对属性
      patchElement(n1, n2, container, ancher)
    }
  }

  // 最长递增子序列
  const getSequence = (arr) => {
    const p = arr.slice()
    const result = [0]
    let i, j, u, v, c
    const len = arr.length
    for (i = 0; i < len; i++) {
      const arrI = arr[i]
      if (arrI !== 0) {
        j = result[result.length - 1]
        if (arr[j] < arrI) {
          p[i] = j
          result.push(i)
          continue
        }
        u = 0
        v = result.length - 1
        while (u < v) {
          c = (u + v) >> 1
          if (arr[result[c]] < arrI) {
            u = c + 1
          } else {
            v = c
          }
        }
        if (arrI < arr[result[u]]) {
          if (u > 0) {
            p[i] = result[u - 1]
          }
          result[u] = i
        }
      }
    }
    u = result.length
    v = result[u - 1]
    while (u-- > 0) {
      result[u] = v
      v = p[v]
    }
    return result
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
  const patch = (n1, n2, container, ancher = null) => {
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
          processElement(n1, n2, container, ancher)
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

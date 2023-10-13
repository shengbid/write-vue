// 公共的方法

// 判断是否是对象
export function isObject(target) {
  return target !== null && typeof target === "object"
}

export const extend = Object.assign

// 判断是否是数组
export const isArray = Array.isArray

// 判断是否是函数
export const isFunction = (val: unknown): val is Function =>
  typeof val === "function"
// 判断是否是字符串
export const isString = (val: unknown): val is string => typeof val === "string"
// 判断是否是Symbol
export const isSymbol = (val: unknown): val is symbol => typeof val === "symbol"
// 对象中是否有这个属性
const hasOwnProperty = Object.prototype.hasOwnProperty
// export const hasOwn = (
//   val: object,
//   key: string | symbol
// ): key is keyof typeof val => hasOwnProperty.call(val, key)
export const hasOwn = (target, key) => hasOwnProperty.call(target, key)
// 判断数组的key是不是整数
export const isIntegerKey = (key) => parseInt(key) + "" === key
// 判断两个值是否相等
export const haseChange = (value, oldValue) => value !== oldValue

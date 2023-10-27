// 最长递增子序列
// const arr = [1, 8, 5, 3, 4, 9, 7, 6]
const arr = [2, 3, 1, 5, 6, 8, 7, 9, 4]

// 1 3 4 7   1 3 4 6   1 3 4 9
// 二分查找
function getSequence(arr) {
  // 递增
  let len = arr.length
  const result = [0] // 递增的索引
  let start
  let end
  let middle
  let p = arr.slice(0)
  // 特殊情况 1递增
  for (let i = 0; i < len; i++) {
    const arrI = arr[i] // 获取到数组当前遍历的值
    if (arrI != 0) {
      let resultLastIndex = result[result.length - 1] // 拿到最后一个
      if (arr[resultLastIndex] < arrI) {
        // 当前的值 比上一个大 直接push,记住他前面的兄弟
        p[i] = resultLastIndex // 记住前面的兄弟
        result.push(i)
        continue
      }
      start = 0
      end = result.length - 1
      while (start < end) {
        middle = ((start + end) / 2) | 0 // 小数取整
        if (arr[result[middle]] < arrI) {
          // 找比arrI大的值,或者等于的值
          start = middle + 1
        } else {
          end = middle
        }
      }
      // 找到对应的位置
      if (arrI < arr[result[start]]) {
        // 替换
        if (start > 0) {
          // 要将他替换的前一个兄弟记住
          p[i] = result[start - 1]
        }
        result[start] = i
      }
    }
  }
  // 循环获取数据
  let len1 = result.length // 总的长度
  let last = result[len1 - 1] // 获取最后一个
  while (len1--) {
    // 循环查找
    result[len1] = last
    last = p[last]
  }
  return result
}
console.log(getSequence(arr))

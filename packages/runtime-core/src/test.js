// 最长递增子序列
const arr = [1, 8, 5, 3, 4, 9, 7, 6]

// 1 3 4 7   1 3 4 6   1 3 4 9
// 二分查找
function getSequence(arr) {
  // 递增
  let len = arr.length
  const result = [0] // 递增的索引
  let start
  let end
  let middle
  // 特殊情况 1递增
  for (let i = 0; i < len; i++) {
    const arrI = arr[i] // 获取到数组当前遍历的值
    if (arrI != 0) {
      let resultLastIndex = result[result.length - 1] // 拿到最后一个
      if (arr[resultLastIndex] < arrI) {
        result.push(i)
        continue
      }
      start = 0
      end = result.length - 1
      while (start < end) {
        middle = ((start + end) / 2) | 0 // 小数取整
        if (arr[result[middle]] < arrI) { // 找比arrI大的值,或者等于的值
          start = middle + 1
        } else {
          end = middle
        }
      }
      // 找到对应的位置
      if (arrI < arr[result[start]]) {
        result[start] = i
      }
    }
  }
  return result
}
console.log(getSequence(arr))
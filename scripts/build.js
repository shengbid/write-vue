// 进行打包 monerepo
// 1获取打包 目录
const execa = require("execa")
const fs = require("fs")
// 注意 只打包文件夹
const dirs = fs.readdirSync("packages").filter((p) => {
  if (!fs.statSync(`packages/${p}`).isDirectory()) {
    return false
  }
  return true
})

// 2进行打包 并行打包
async function build(target) {
  await execa("rollup", ["-c", "--environment", `TARGET:${target}`], {
    stdio: "inherit",
  }) // 子进程的输出在父包中输出
}
async function runParaller(dirs, itemfn) {
  // 遍历
  let result = []
  for (let item of dirs) {
    result.push(itemfn(item))
  }
  return Promise.all(result)
}
runParaller(dirs, build).then(() => {
  console.log("成功")
})
console.log(dirs)

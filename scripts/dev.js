// 进行打包 monerepo
// 1获取打包 目录
const execa = require("execa")

// 2进行打包 
async function build(target) {
  await execa("rollup", ["-cw", "--environment", `TARGET:${target}`], {
    stdio: "inherit",
  }) // 子进程的输出在父包中输出
}

build("runtime-dom")
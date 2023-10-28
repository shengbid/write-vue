// 生命周期

// 枚举
const enum lifeCycle{
  BEFORE_MOUNT="bm",
  MOUNTED="m",
  BEFORE_UPDATE='bu',
  UPDATE="u"
}

// 写4个生命周期
export const onBeforeMount = createHook(lifeCycle.BEFORE_MOUNT)
export const onMount = createHook(lifeCycle.MOUNTED)
export const onBeforeUpdate = createHook(lifeCycle.BEFORE_UPDATE)
export const onUpdate = createHook(lifeCycle.UPDATE)

// 生命周期
function createHook(lifeCycle){
  // 核心就是这个生命周期要和当前组件实例产生关联
  // 注意 第一参数就是生命周期中的方法 第二个参数是当前实例
  return function(hook, target = currentInstance){

  }
}
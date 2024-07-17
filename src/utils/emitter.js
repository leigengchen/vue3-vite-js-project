
// emitter.js 实现事件的发布、订阅功能
/**
 *  emitter.on() 监听事件
    emitter.off() 取消监听事件
    emitter.emit() 触发事件
    emitter.all.clear() 清除所有事件
 */
import mitt from 'mitt'
const emitter = mitt()
export default emitter

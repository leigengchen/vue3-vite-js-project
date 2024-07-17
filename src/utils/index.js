// 时间格式化
export function parseTime (time, cFormat) {
  if (arguments.length === 0) {
    return null
  }
  if (!time) {
    return '0-0-0 0:0:0'
  }
  const format = cFormat || '{y}-{m}-{d} {h}:{i}:{s}'
  let date
  if (typeof time === 'object') {
    date = time
  } else {
    if (('' + time).length === 10) time = parseInt(time) * 1000
    date = new Date(time)
  }
  const formatObj = {
    y: date.getFullYear(),
    m: date.getMonth() + 1,
    d: date.getDate(),
    h: date.getHours(),
    i: date.getMinutes(),
    s: date.getSeconds(),
    a: date.getDay()
  }
  const timeStr = format.replace(/{(y|m|d|h|i|s|a)+}/g, (result, key) => {
    let value = formatObj[key]
    // Note: getDay() returns 0 on Sunday
    if (key === 'a') {
      return ['日', '一', '二', '三', '四', '五', '六'][value]
    }
    if (result.length > 0 && value < 10) {
      value = '0' + value
    }
    return value || 0
  })
  return timeStr
}

// export function formatInt (num) {
//   return Number(num).toLocaleString('en-US')
// }

// export function formatStartDate (dateString) {
//   return dateString ? new Date(dateString).toISOString() : null
// }

// export function formatEndDate (dateString) {
//   return dateString ? new Date(new Date(dateString).getTime() + 24 * 3600 * 1000).toISOString() : null
// }


// export function formatPositiveInteger (value) {
//   const num = parseInt(value, 10);
//   if (!isNaN(num) && num >= 0) {
//     return '' + Math.floor(num); // 格式化为正整数
//   }
// }

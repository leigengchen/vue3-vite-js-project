

// 获取token
export function getToken () {
  return sessionStorage.getItem(tokenKey);
}
// 设置token
export function setToken (token) {
  return sessionStorage.setItem(tokenKey, token);
}
// 删除token
export function removeToken () {
  return sessionStorage.clear();
}

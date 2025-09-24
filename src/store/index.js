
import { defineStore } from 'pinia'

const useUserStore = defineStore('user',{
  state: () => ({
    userInfo: {
      name: '张三',
      age: 25,
      avatar: 'https://picsum.photos/200/200?random=1'
    },
    isLogin: false,
    permissions: []
  }),
  getters: {
    getUserInfo: state => state.userInfo,
    getIsLogin: state => state.isLogin,
    getPermissions: state => state.permissions
  },
  actions: {
    setUserInfo(userInfo) {
      this.userInfo = userInfo
    },
    setIsLogin(isLogin) {
      this.isLogin = isLogin
    },
    setPermissions(permissions) {
      this.permissions = permissions
    },
    // 异步登录（模拟 API 请求）
    async login(username, password) {
      try {
        // 模拟接口调用
        const res = await new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              code: 200,
              data: {
                userInfo: { 
                  username,
                  password,
                  avatar: 'https://picsum.photos/200/200?random=2' 
                },
                permissions: ['read', 'edit']
              }
            })
          }, 1000)
        })

        if (res.code === 200) {
          this.userInfo = res.data.userInfo
          this.permissions = res.data.permissions
          this.isLogin = true
          return true
        }
      } catch (error) {
        console.error('登录失败：', error)
        return false
      }
    },
    // 异步登出（模拟 API 请求）
    async logout() {
      try {
        // 模拟接口调用
        const res = await new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              code: 200,
              data: {}
            })
          }, 1000)
        })

        if (res.code === 200) {
          this.userInfo = {}
        }
      }
      catch (error) {
        console.error('登出失败：', error)
      }
    }
  }
})

export default useUserStore



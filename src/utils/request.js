import axios from 'axios'
import { message } from "ant-design-vue";
import qs from 'qs'
// import { useRouter } from "vue-router";
import router from '@/routers/index'
import { getToken } from './auth'

// 创建axios实例
// axios.defaults.baseURL = process.env.VUE_APP_API_URL;
const service = axios.create({
  // baseURL: 'http://10.153.89.93:6111/',
  baseURL: import.meta.env.VITE_APP_BASEAPI,
  timeout: 10000, // 请求超时时间
  headers: {}  // 设置请求header，可以自定义属性
})

// request拦截器
service.interceptors.request.use(
  config => {
    // config.headers['Content-Type'] = 'application/json'
    // 判断是否存在token，如果存在的话，则每个http header都加上token
    const token = getToken()
    if (token) {
      config.headers.token = token
    }
    // config.headers.language = sessionStorage.getItem('lang') || ''
    return config
  },
  err => {
    return Promise.reject(err)
  }
)

// http response 拦截器
service.interceptors.response.use(
  response => {
    const { status, data } = response

    if (response.headers['token']) {
      sessionStorage.setItem('token', response.headers['token'])
    }
    if (
      response.data.code !== 0
    ) {
      if (response.data.code) {
        message.error(response.data.msg)
      }

    }
    return response
  },
  error => {
    if (error && error.response) {
      switch (error.response.status) {
        case 401:
          // 返回 401 清除token信息并跳转到登录页面
          sessionStorage.clear();
          router.push({
            path: '/login'
          })
          break
      }
    }
    // 返回接口返回的错误信息
    return Promise.reject(error.response.data)
  }
)

export function get (url, params, responseType = null) {
  return new Promise((resolve, reject) => {
    service.get(url, {
      params,
      responseType: responseType
    })
      .then(
        res => {
          resolve(res.data)
        },
        err => {
          reject(err)
        }
      )
  })
}

export function deleteReq (url, params) {
  return new Promise((resolve, reject) => {
    service.delete(url, {
      params
    })
      .then(
        res => {
          resolve(res.data)
        },
        err => {
          reject(err)
        }
      )
  })
}

export function deleteLot (url, params) {
  return new Promise((resolve, reject) => {
    service({
      method: 'delete',
      url: url,
      headers: {
        'Content-Type': 'application/json'
      },
      data: params
    })
      .then(
        res => {
          resolve(res.data)
        },
        err => {
          reject(err)
        }
      )
  })
}

export function post (url, params) {
  return new Promise((resolve, reject) => {
    service.post(url, params).then(
      response => {
        resolve(response.data)
      },
      err => {
        reject(err)
      }
    )
  })
}

export function postFormData (url, formData) {
  return new Promise((resolve, reject) => {
    service({
      method: 'post',
      url: url,
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      data: formData
    }).then(
      res => {
        resolve(res.data)
      },
      err => {
        reject(err)
      }
    )
  })
}

export function put (url, formData, contentType) {
  return new Promise((resolve, reject) => {
    service({
      method: 'put',
      url: url,
      headers: {
        'Content-Type': contentType,
      },
      data: formData
    }).then(
      res => {
        resolve(res.data)
      },
      err => {
        reject(err)
      }
    )
  })
}


export function postFrom (url, params) {
  return new Promise((resolve, reject) => {
    service.post(url, qs.stringify(params, { arrayFormat: 'comma' })).then(
      response => {
        resolve(response.data)
      },
      err => {
        reject(err)
      }
    )
  })
}

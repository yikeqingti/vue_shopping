import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/login.vue'
import Home from '../components/home.vue'
import '../assets/css/global.css'
import axios from 'axios'

Vue.prototype.$http = axios
    //配置请求根路径
axios.defaults.baseURL = 'ttp://127.0.0.1:8888/api/private/v1/'
Vue.use(VueRouter)

const routes = [
    { path: '/', redirect: '/login' },
    { path: '/login', component: Login },
    { path: '/home', component: Home }
]

const router = new VueRouter({
        routes
    })
    //挂载路由守卫
router.beforeEach((to, from, next) => {
    //to要访问的路径
    //from 从哪个路径跳转而来
    //next 放行
    //next()放行  next('/login')强制跳转

    if (to.path === '/login') return next();
    const tokenStr = window.sessionStorage.getItem('token')
    if (!tokenStr) return next('/login')
    next()
})

export default router
import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/login.vue'
import Home from '../components/home.vue'
import Welcome from '../components/welcome.vue'
import Users from '../components/user/users.vue'
import Rights from '../components/power/rights.vue'
import Roles from '../components/power/roles.vue'
import Cate from '../components/goods/cate.vue'

Vue.use(VueRouter)

const routes = [
    { path: '/', redirect: '/login' },
    { path: '/login', component: Login },
    {
        path: '/home',
        component: Home,
        redirect: '/welcome',
        children: [
            { path: '/welcome', component: Welcome },
            { path: '/users', component: Users },
            { path: '/rights', component: Rights },
            { path: '/roles', component: Roles },
            { path: '/categories', component: Cate }
        ]
    }
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
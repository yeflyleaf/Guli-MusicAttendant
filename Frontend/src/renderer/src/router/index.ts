/**
 * Vue Router 配置
 */
import { createRouter, createWebHashHistory, type RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue'),
    meta: { title: '首页' }
  },
  {
    path: '/local-music',
    name: 'LocalMusic',
    component: () => import('@/views/LocalMusic.vue'),
    meta: { title: '本地音乐' }
  },
  {
    path: '/favorites',
    name: 'Favorites',
    component: () => import('@/views/Favorites.vue'),
    meta: { title: '我喜欢' }
  },
  {
    path: '/recently-played',
    name: 'RecentlyPlayed',
    component: () => import('@/views/RecentlyPlayed.vue'),
    meta: { title: '最近播放' }
  },
  {
    path: '/playlists',
    name: 'Playlists',
    component: () => import('@/views/Playlists.vue'),
    meta: { title: '我的歌单' }
  },
  {
    path: '/playlist/:id',
    name: 'PlaylistDetail',
    component: () => import('@/views/PlaylistDetail.vue'),
    meta: { title: '歌单详情' }
  },
  {
    path: '/lyrics',
    name: 'Lyrics',
    component: () => import('@/views/Lyrics.vue'),
    meta: { title: '歌词' }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('@/views/Settings.vue'),
    meta: { title: '设置' }
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

// 路由守卫：更新窗口标题
router.beforeEach((to, _from, next) => {
  const title = to.meta.title as string
  if (title) {
    document.title = `${title} - 故里音乐助手`
    // 通知主进程更新标题
    window.electron?.window?.setTitle(`${title} - 故里音乐助手`)
  }
  next()
})

export default router

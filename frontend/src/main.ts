// ============================================================
// Pet-ID AI 플랫폼 - 앱 진입점 (main.ts)
// ============================================================

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import '@/assets/styles/main.css'

// 앱 인스턴스 생성
const app = createApp(App)

// Pinia 전역 상태 관리 등록
const pinia = createPinia()
app.use(pinia)

// Vue Router 등록
app.use(router)

// 앱 마운트
app.mount('#app')

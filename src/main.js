import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import { MotionPlugin } from '@vueuse/motion'
import App from './App.vue'
import './assets/style.css'

const app = createApp(App)
app.use(ElementPlus, { locale: zhCn })
app.use(MotionPlugin)
app.mount('#app')

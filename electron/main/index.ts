import { app, BrowserWindow, shell, ipcMain } from 'electron'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import os from 'node:os'
import fs from 'node:fs'

const require = createRequire(import.meta.url)
const __dirname = path.dirname(fileURLToPath(import.meta.url))

process.env.APP_ROOT = path.join(__dirname, '../..')

export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')
export const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, 'public')
  : RENDERER_DIST

// Disable GPU Acceleration for Windows 7
if (os.release().startsWith('6.1')) app.disableHardwareAcceleration()

// 禁用 Chromium 触摸板/触摸屏滑动导航手势
app.commandLine.appendSwitch('disable-features', 'TouchpadOverscrollHistoryNavigation')
app.commandLine.appendSwitch('overscroll-history-navigation', '0')

// Set application name for Windows 10+ notifications
if (process.platform === 'win32') app.setAppUserModelId(app.getName())

if (!app.requestSingleInstanceLock()) {
  app.quit()
  process.exit(0)
}

let win: BrowserWindow | null = null
let kioskGuardEnabled = true  // kiosk 守护开关
const preload = path.join(__dirname, '../preload/index.mjs')
const indexHtml = path.join(RENDERER_DIST, 'index.html')

async function createWindow() {
  win = new BrowserWindow({
    title: 'Smart Sorting Bin',
    // 纵向屏幕 1080x1920
    width: 1080,
    height: 1920,
    // Kiosk模式 - 全屏且无法退出
    fullscreen: true,
    kiosk: true,
    // 禁止调整窗口大小
    resizable: false,
    // 隐藏菜单栏
    autoHideMenuBar: true,
    // 隐藏标题栏
    frame: false,
    // 禁止最小化
    minimizable: false,
    // 禁止关闭按钮
    closable: false,
    // 始终置顶
    alwaysOnTop: !VITE_DEV_SERVER_URL,
    icon: path.join(process.env.VITE_PUBLIC, 'favicon.ico'),
    webPreferences: {
      preload,
      // 如果需要在渲染进程中使用 Node.js API，启用以下选项
      // nodeIntegration: true,
      // contextIsolation: false,
    },
  })
  //TODO
  //生产环境禁用所有快捷键（Alt+F4, Ctrl+W, Ctrl+Q 等）
  if (!VITE_DEV_SERVER_URL) {
    win.webContents.on('before-input-event', (_event, input) => {
      const blocked = [
        // Alt+F4
        input.alt && input.key === 'F4',
        // Ctrl+W / Ctrl+Q / Ctrl+R / Ctrl+Shift+I
        input.control && ['w', 'q', 'r', 'i'].includes(input.key.toLowerCase()),
        // F5 刷新 / F11 全屏切换 / F12 DevTools
        ['F5', 'F11', 'F12'].includes(input.key),
        // Super/Meta 键
        input.meta,
      ]
      if (blocked.some(Boolean)) {
        _event.preventDefault()
      }
    })
  }

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
    // 开发时打开 DevTools
    win.webContents.openDevTools()
  } else {
    win.loadFile(indexHtml)
    // 打包后彻底禁止开发者工具
    win.webContents.on('devtools-opened', () => {
      win?.webContents.closeDevTools()
    })
  }

  // Test actively push message to the Electron-Renderer
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', new Date().toLocaleString())

    // 注入脚本：拦截多指触摸事件，防止三指滑动触发系统手势或页面导航
    win?.webContents.executeJavaScript(`
      document.addEventListener('touchstart', function(e) {
        if (e.touches.length >= 2) {
          e.preventDefault();
          e.stopPropagation();
        }
      }, { passive: false, capture: true });
      document.addEventListener('touchmove', function(e) {
        if (e.touches.length >= 2) {
          e.preventDefault();
          e.stopPropagation();
        }
      }, { passive: false, capture: true });
      document.addEventListener('touchend', function(e) {
        if (e.touches.length >= 1) {
          // touchend 时 touches 是剩余的，changedTouches 是刚抬起的
          // 如果还有多指在屏幕上，拦截
        }
      }, { passive: false, capture: true });
      console.log('[Kiosk] 多指触摸拦截已启用');
    `)
  })

  // 生产环境：轻量级 Kiosk 焦点守护
  // 注意：主要的 kiosk 锁定由系统层 GNOME Kiosk Session 负责（见 scripts/setup-kiosk.sh）
  // 这里只做 Electron 窗口级别的兜底保护
  if (!VITE_DEV_SERVER_URL) {
    // blur 事件抢回焦点
    win.on('blur', () => {
      if (!kioskGuardEnabled) return
      setTimeout(() => {
        if (win && !win.isDestroyed() && kioskGuardEnabled) {
          win.setAlwaysOnTop(true)
          win.setKiosk(true)
          win.focus()
          win.moveTop()
        }
      }, 50)
    })

    // 定期检查全屏状态（间隔放宽到 2 秒，kiosk session 下几乎不会触发）
    setInterval(() => {
      if (!kioskGuardEnabled) return
      if (win && !win.isDestroyed()) {
        if (!win.isFocused()) {
          win.focus()
          win.moveTop()
        }
        if (!win.isFullScreen()) {
          win.setFullScreen(true)
          win.setKiosk(true)
        }
      }
    }, 2000)
  }

  // Make all links open with the browser, not with the application
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:')) shell.openExternal(url)
    return { action: 'deny' }
  })
}

app.whenReady().then(() => {
  // 打包后在 Linux 上设置开机自启动 + 禁用桌面手势
  if (!VITE_DEV_SERVER_URL && process.platform === 'linux') {
    setupLinuxAutoStart()
    disableDesktopGestures()
  }
  createWindow()

  // 管理员退出 kiosk 模式（密码验证）
  // 修改这里的密码
  const ADMIN_PASSWORD = 'GreenAi@2023'

  ipcMain.handle('admin-exit-kiosk', async (_event, password: string) => {
    if (password === ADMIN_PASSWORD) {
      kioskGuardEnabled = false  // 关闭守护
      if (win) {
        win.setKiosk(false)
        win.setFullScreen(false)
        win.setAlwaysOnTop(false)
        win.setClosable(true)
        win.setMinimizable(true)
      }
      return { success: true }
    }
    return { success: false }
  })

  ipcMain.handle('admin-quit-app', async (_event, password: string) => {
    if (password === ADMIN_PASSWORD) {
      if (win) {
        win.setClosable(true)
        win.setKiosk(false)
        win.setFullScreen(false)
      }
      app.quit()
      return { success: true }
    }
    return { success: false }
  })
})

/**
 * Linux 开机自启动：写入 .desktop 文件到 ~/.config/autostart/
 */
function setupLinuxAutoStart() {
  try {
    const autostartDir = path.join(os.homedir(), '.config', 'autostart')
    if (!fs.existsSync(autostartDir)) {
      fs.mkdirSync(autostartDir, { recursive: true })
    }
    const desktopEntry = `[Desktop Entry]
Type=Application
Name=SmartSortingBin
Exec=${process.execPath}
X-GNOME-Autostart-enabled=true
`
    fs.writeFileSync(path.join(autostartDir, 'smart-sorting-bin.desktop'), desktopEntry)
  } catch (e) {
    console.error('设置开机自启动失败:', e)
  }
}

/**
 * 禁用 Linux 桌面环境的触摸手势（GNOME 三指/四指滑动等）
 * 防止触摸屏用户通过手势退出应用
 */
function disableDesktopGestures() {
  const { execSync } = require('child_process') as typeof import('child_process')
  const cmds = [
    // ===== 锁定工作区为1个（禁止左右滑切换）=====
    "dconf write /org/gnome/mutter/dynamic-workspaces false",
    "dconf write /org/gnome/desktop/wm/preferences/num-workspaces 1",
    // ===== 禁用活动概览（禁止上滑触发）=====
    "dconf write /org/gnome/shell/enable-hot-corners false",
    "dconf write /org/gnome/mutter/overlay-key \"''\"",
    "dconf write /org/gnome/shell/keybindings/toggle-overview \"@as []\"",
    "dconf write /org/gnome/shell/keybindings/toggle-application-view \"@as []\"",
    // ===== 禁用所有工作区切换快捷键 =====
    "dconf write /org/gnome/desktop/wm/keybindings/switch-to-workspace-up \"@as []\"",
    "dconf write /org/gnome/desktop/wm/keybindings/switch-to-workspace-down \"@as []\"",
    "dconf write /org/gnome/desktop/wm/keybindings/switch-to-workspace-left \"@as []\"",
    "dconf write /org/gnome/desktop/wm/keybindings/switch-to-workspace-right \"@as []\"",
    "dconf write /org/gnome/desktop/wm/keybindings/move-to-workspace-up \"@as []\"",
    "dconf write /org/gnome/desktop/wm/keybindings/move-to-workspace-down \"@as []\"",
    "dconf write /org/gnome/desktop/wm/keybindings/move-to-workspace-left \"@as []\"",
    "dconf write /org/gnome/desktop/wm/keybindings/move-to-workspace-right \"@as []\"",
    // ===== 禁用应用切换手势 =====
    "dconf write /org/gnome/desktop/wm/keybindings/switch-applications \"@as []\"",
    "dconf write /org/gnome/desktop/wm/keybindings/switch-applications-backward \"@as []\"",
    "dconf write /org/gnome/desktop/wm/keybindings/switch-windows \"@as []\"",
    "dconf write /org/gnome/desktop/wm/keybindings/switch-windows-backward \"@as []\"",
    // ===== 其他 =====
    "dconf write /org/gnome/mutter/edge-tiling false",
    'gsettings set org.gnome.desktop.peripherals.touchpad tap-and-drag false',
    'gsettings set org.gnome.desktop.peripherals.touchpad two-finger-scrolling-enabled false',
    'gsettings set org.gnome.desktop.peripherals.touchpad natural-scroll false',
    'gsettings set org.gnome.desktop.peripherals.touchpad edge-scrolling-enabled false',
    'gsettings set org.gnome.desktop.interface enable-hot-corners false',
    'killall touchegg 2>/dev/null || true',
    'killall libinput-gestures 2>/dev/null || true',
  ]
  for (const cmd of cmds) {
    try {
      execSync(cmd + ' 2>/dev/null || true')
    } catch (_) { /* 忽略单条失败 */ }
  }
  console.log('已禁用桌面手势')
}


app.on('window-all-closed', () => {
  win = null
  if (process.platform !== 'darwin') app.quit()
})

app.on('second-instance', () => {
  if (win) {
    if (win.isMinimized()) win.restore()
    win.focus()
  }
})

app.on('activate', () => {
  const allWindows = BrowserWindow.getAllWindows()
  if (allWindows.length) {
    allWindows[0].focus()
  } else {
    createWindow()
  }
})

// New window example arg: new windows url
ipcMain.handle('open-win', (_, arg) => {
  const childWindow = new BrowserWindow({
    webPreferences: {
      preload,
      nodeIntegration: true,
      contextIsolation: false,
    },
  })

  if (VITE_DEV_SERVER_URL) {
    childWindow.loadURL(`${VITE_DEV_SERVER_URL}#${arg}`)
  } else {
    childWindow.loadFile(indexHtml, { hash: arg })
  }
})

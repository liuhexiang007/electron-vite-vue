#!/bin/bash
# ============================================================
# SmartSortingBin Kiosk 部署脚本
# 
# 方案：使用 GNOME Kiosk Session 直接启动 Electron 应用
# 不加载 GNOME Shell，从根源消除三指滑动等桌面手势
#
# 用法：sudo bash setup-kiosk.sh
# ============================================================

set -e

APP_NAME="SmartSortingBin"
KIOSK_USER="kiosk"
# AppImage 或 deb 安装后的路径，按实际情况修改
APP_PATH="/opt/SmartSortingBin/electron-vue-vite"

echo "=========================================="
echo "  SmartSortingBin Kiosk 部署"
echo "=========================================="

# ---------- 1. 创建 kiosk 用户 ----------
if ! id "$KIOSK_USER" &>/dev/null; then
    echo "[1/6] 创建 kiosk 用户..."
    useradd -m -s /bin/bash "$KIOSK_USER"
    # 无密码登录
    passwd -d "$KIOSK_USER"
else
    echo "[1/6] kiosk 用户已存在，跳过"
fi

# 将 kiosk 用户加入 video、audio、input 组（触摸屏/音频需要）
usermod -aG video,audio,input "$KIOSK_USER" 2>/dev/null || true

# ---------- 1.5 配置竖屏显示（monitors.xml）----------
echo "[1.5/6] 配置竖屏显示..."
# monitors.xml 是 GNOME/Mutter 的显示器配置，X11 和 Wayland 都生效
# 需要为 kiosk 用户和 GDM 都配置

# 先从当前用户获取显示器信息来生成配置
# 如果获取不到，使用通用配置（用户需要根据实际显示器调整 connector 名称）
MONITORS_XML='<?xml version="1.0" encoding="UTF-8"?>
<monitors version="2">
  <configuration>
    <logicalmonitor>
      <x>0</x>
      <y>0</y>
      <scale>1</scale>
      <primary>yes</primary>
      <transform>
        <rotation>left</rotation>
        <flipped>no</flipped>
      </transform>
      <monitor>
        <monitorspec>
          <connector>HDMI-1</connector>
          <vendor>unknown</vendor>
          <product>unknown</product>
          <serial>unknown</serial>
        </monitorspec>
        <mode>
          <width>1920</width>
          <height>1080</height>
          <rate>60.000</rate>
        </mode>
      </monitor>
    </logicalmonitor>
  </configuration>
</monitors>'

# 尝试自动检测 connector 名称
DETECTED_CONNECTOR=""
if command -v xrandr &>/dev/null; then
    DETECTED_CONNECTOR=$(DISPLAY=:0 xrandr --query 2>/dev/null | grep ' connected' | head -1 | awk '{print $1}')
fi
if [ -z "$DETECTED_CONNECTOR" ]; then
    # 常见的 connector 名称
    for c in HDMI-1 HDMI-0 DP-1 eDP-1 VGA-1; do
        if [ -d "/sys/class/drm/card0-${c//-/-}" ] || [ -d "/sys/class/drm/card1-${c//-/-}" ]; then
            DETECTED_CONNECTOR="$c"
            break
        fi
    done
fi
if [ -n "$DETECTED_CONNECTOR" ] && [ "$DETECTED_CONNECTOR" != "HDMI-1" ]; then
    MONITORS_XML=$(echo "$MONITORS_XML" | sed "s|<connector>HDMI-1</connector>|<connector>${DETECTED_CONNECTOR}</connector>|")
    echo "  检测到显示器接口: $DETECTED_CONNECTOR"
else
    echo "  使用默认接口: HDMI-1（如不正确请手动修改 monitors.xml）"
fi

# 写入 kiosk 用户的 monitors.xml
KIOSK_CONFIG_DIR="/home/${KIOSK_USER}/.config/monitors"
mkdir -p "/home/${KIOSK_USER}/.config"
echo "$MONITORS_XML" > "/home/${KIOSK_USER}/.config/monitors.xml"
chown -R "$KIOSK_USER:$KIOSK_USER" "/home/${KIOSK_USER}/.config"

# 写入 GDM 的 monitors.xml（让登录界面也是竖屏）
GDM_CONFIG_DIR="/var/lib/gdm3/.config"
if [ ! -d "$GDM_CONFIG_DIR" ]; then
    GDM_CONFIG_DIR="/var/lib/gdm/.config"
fi
mkdir -p "$GDM_CONFIG_DIR"
echo "$MONITORS_XML" > "${GDM_CONFIG_DIR}/monitors.xml"
chown -R gdm:gdm "$GDM_CONFIG_DIR" 2>/dev/null || true

echo "  monitors.xml 已写入（rotation=left）"

# ---------- 2. 创建启动脚本 ----------
echo "[2/6] 创建启动脚本..."
KIOSK_START="/home/${KIOSK_USER}/start-kiosk.sh"
cat > "$KIOSK_START" << 'SCRIPT'
#!/bin/bash

# 禁用屏保和电源管理
xset s off 2>/dev/null || true
xset -dpms 2>/dev/null || true
xset s noblank 2>/dev/null || true

# 隐藏鼠标光标（触摸屏不需要）
unclutter -idle 0.1 -root &

# 等待显示就绪
sleep 2

# ===== 竖屏旋转（1080x1920 纵向显示）=====
# 方法1: xrandr（X11 环境）
OUTPUT=$(xrandr --query 2>/dev/null | grep ' connected' | head -1 | awk '{print $1}')
if [ -n "$OUTPUT" ]; then
    xrandr --output "$OUTPUT" --rotate left 2>/dev/null || true
    echo "[Kiosk] xrandr: 已将 $OUTPUT 旋转为竖屏 (left)"

    # 同步旋转触摸屏坐标映射（left 旋转矩阵）
    TOUCH_DEVICE=$(xinput list --name-only 2>/dev/null | grep -i -E 'touch|ILITEK' | head -1)
    if [ -n "$TOUCH_DEVICE" ]; then
        xinput set-prop "$TOUCH_DEVICE" "Coordinate Transformation Matrix" 0 -1 1 1 0 0 0 0 1 2>/dev/null || true
        echo "[Kiosk] 已旋转触摸坐标映射: $TOUCH_DEVICE"
    fi
fi

# 方法2: gnome-randr（Wayland 环境，xrandr 不生效时的备选）
if command -v gnome-randr &>/dev/null; then
    WAYLAND_OUTPUT=$(gnome-randr query 2>/dev/null | head -1 | awk '{print $1}')
    if [ -n "$WAYLAND_OUTPUT" ]; then
        gnome-randr modify "$WAYLAND_OUTPUT" --rotate left 2>/dev/null || true
        echo "[Kiosk] gnome-randr: 已将 $WAYLAND_OUTPUT 旋转为竖屏"
    fi
fi

# 禁用自动旋转传感器
gsettings set org.gnome.settings-daemon.plugins.orientation active false 2>/dev/null || true

# 启动 Electron 应用（deb 安装）
exec /opt/SmartSortingBin/electron-vue-vite \
    --no-sandbox \
    --disable-features=TouchpadOverscrollHistoryNavigation \
    --overscroll-history-navigation=0 \
    --noerrdialogs \
    --disable-session-crashed-bubble \
    --disable-pinch
SCRIPT
chmod +x "$KIOSK_START"
chown "$KIOSK_USER:$KIOSK_USER" "$KIOSK_START"

# ---------- 3. 创建 Kiosk Session 文件 ----------
echo "[3/6] 创建 Kiosk Session..."

# X11 session
cat > /usr/share/xsessions/smartsortingbin-kiosk.desktop << EOF
[Desktop Entry]
Name=SmartSortingBin Kiosk
Comment=Kiosk mode for SmartSortingBin
Exec=${KIOSK_START}
Type=Application
DesktopNames=SmartSortingBin
EOF

# Wayland session（如果用 Wayland）
mkdir -p /usr/share/wayland-sessions
cat > /usr/share/wayland-sessions/smartsortingbin-kiosk.desktop << EOF
[Desktop Entry]
Name=SmartSortingBin Kiosk
Comment=Kiosk mode for SmartSortingBin
Exec=${KIOSK_START}
Type=Application
DesktopNames=SmartSortingBin
EOF

# ---------- 4. 配置 GDM 自动登录 ----------
echo "[4/6] 配置 GDM 自动登录..."
GDM_CONF="/etc/gdm3/custom.conf"
if [ ! -f "$GDM_CONF" ]; then
    GDM_CONF="/etc/gdm/custom.conf"
fi

if [ -f "$GDM_CONF" ]; then
    # 备份原配置
    cp "$GDM_CONF" "${GDM_CONF}.bak.$(date +%Y%m%d%H%M%S)"
    
    # 写入自动登录配置
    cat > "$GDM_CONF" << EOF
[daemon]
AutomaticLoginEnable=true
AutomaticLogin=${KIOSK_USER}
# 指定使用 kiosk session 而不是默认 GNOME 桌面
DefaultSession=smartsortingbin-kiosk.desktop
# 强制使用 X11（禁用 Wayland），确保 xrandr 旋转生效
WaylandEnable=false

[security]

[xdmcp]

[chooser]

[debug]
EOF
    echo "  GDM 已配置自动登录用户: ${KIOSK_USER}"

    # 设置 kiosk 用户的默认 session
    ACCOUNTSSERVICE_DIR="/var/lib/AccountsService/users"
    mkdir -p "$ACCOUNTSSERVICE_DIR"
    cat > "${ACCOUNTSSERVICE_DIR}/${KIOSK_USER}" << EOF
[User]
Session=smartsortingbin-kiosk
XSession=smartsortingbin-kiosk
SystemAccount=false
EOF
    echo "  已设置 kiosk 用户默认 session: smartsortingbin-kiosk"
else
    echo "  警告: 未找到 GDM 配置文件，请手动配置自动登录"
fi

# ---------- 5. 配置 Xorg 安全限制 ----------
echo "[5/6] 配置 Xorg 安全限制..."
mkdir -p /etc/X11/xorg.conf.d
cat > /etc/X11/xorg.conf.d/99-kiosk-security.conf << 'EOF'
Section "ServerFlags"
    # 禁止 Ctrl+Alt+Backspace 杀 X
    Option "DontZap" "true"
    # 禁止 Ctrl+Alt+F* 切换 TTY
    Option "DontVTSwitch" "true"
EndSection
EOF

# ---------- 6. 创建 systemd 守护服务 ----------
echo "[6/6] 创建 systemd 守护服务..."
cat > /etc/systemd/system/smartsortingbin-kiosk.service << EOF
[Unit]
Description=SmartSortingBin Kiosk Application
After=graphical.target

[Service]
Type=simple
User=${KIOSK_USER}
Environment=DISPLAY=:0
ExecStart=${KIOSK_START}
Restart=always
RestartSec=3
# 如果 10 秒内重启超过 5 次，停止尝试
StartLimitIntervalSec=60
StartLimitBurst=5

[Install]
WantedBy=graphical.target
EOF

systemctl daemon-reload
# 注意：如果用 GDM session 方式启动，不需要 enable 这个 service
# 它作为备用守护，当 session 方式出问题时可以手动启用
# systemctl enable smartsortingbin-kiosk.service

# ---------- 安装依赖 ----------
echo ""
echo "正在安装依赖..."
apt-get install -y unclutter 2>/dev/null || true

echo ""
echo "=========================================="
echo "  部署完成!"
echo "=========================================="
echo ""
echo "  kiosk 用户: ${KIOSK_USER}"
echo "  启动脚本:   ${KIOSK_START}"
echo "  应用路径:   ${APP_PATH}"
echo ""
echo "  重启后将自动进入 Kiosk 模式"
echo "  如需恢复桌面，运行: sudo bash restore-desktop.sh"
echo ""
echo "  如果 GDM session 方式不生效，可启用 systemd 守护:"
echo "    sudo systemctl enable smartsortingbin-kiosk.service"
echo "    sudo systemctl start smartsortingbin-kiosk.service"
echo ""

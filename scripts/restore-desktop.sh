#!/bin/bash
# ============================================================
# 恢复正常桌面环境
# 撤销 setup-kiosk.sh 的所有更改
#
# 用法：sudo bash restore-desktop.sh
# ============================================================

set -e

echo "=========================================="
echo "  恢复正常桌面环境"
echo "=========================================="

# 1. 恢复 GDM 配置
GDM_CONF="/etc/gdm3/custom.conf"
if [ ! -f "$GDM_CONF" ]; then
    GDM_CONF="/etc/gdm/custom.conf"
fi

if [ -f "$GDM_CONF" ]; then
    # 查找最近的备份
    LATEST_BAK=$(ls -t "${GDM_CONF}.bak."* 2>/dev/null | head -1)
    if [ -n "$LATEST_BAK" ]; then
        cp "$LATEST_BAK" "$GDM_CONF"
        echo "[1/4] 已从备份恢复 GDM 配置: $LATEST_BAK"
    else
        # 没有备份，写一个默认配置（禁用自动登录）
        cat > "$GDM_CONF" << 'EOF'
[daemon]
AutomaticLoginEnable=false

[security]

[xdmcp]

[chooser]

[debug]
EOF
        echo "[1/4] 已重置 GDM 配置（禁用自动登录）"
    fi
else
    echo "[1/4] 未找到 GDM 配置，跳过"
fi

# 2. 删除 kiosk session 文件
echo "[2/4] 删除 Kiosk Session 文件..."
rm -f /usr/share/xsessions/smartsortingbin-kiosk.desktop
rm -f /usr/share/wayland-sessions/smartsortingbin-kiosk.desktop

# 3. 删除 Xorg 安全限制
echo "[3/4] 删除 Xorg 安全限制..."
rm -f /etc/X11/xorg.conf.d/99-kiosk-security.conf

# 3.5 清理 monitors.xml（恢复默认显示方向）
echo "[3.5/4] 清理竖屏配置..."
rm -f /home/kiosk/.config/monitors.xml 2>/dev/null || true
# GDM 的 monitors.xml 也删掉，让登录界面恢复默认
GDM_CONFIG="/var/lib/gdm3/.config/monitors.xml"
if [ ! -f "$GDM_CONFIG" ]; then
    GDM_CONFIG="/var/lib/gdm/.config/monitors.xml"
fi
rm -f "$GDM_CONFIG" 2>/dev/null || true

# 4. 停止并禁用 systemd 服务
echo "[4/4] 停止 systemd 守护服务..."
systemctl stop smartsortingbin-kiosk.service 2>/dev/null || true
systemctl disable smartsortingbin-kiosk.service 2>/dev/null || true
rm -f /etc/systemd/system/smartsortingbin-kiosk.service
systemctl daemon-reload

echo ""
echo "=========================================="
echo "  恢复完成! 重启后将进入正常桌面。"
echo "=========================================="
echo ""
echo "  如需恢复屏幕方向为横屏，运行:"
echo "    xrandr --output \$(xrandr | grep ' connected' | head -1 | awk '{print \$1}') --rotate normal"
echo ""
echo "  注意: kiosk 用户未删除，如需删除运行:"
echo "    sudo userdel -r kiosk"
echo ""

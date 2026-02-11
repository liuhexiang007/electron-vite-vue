#!/bin/bash
# ============================================================
# 触摸屏坐标修复脚本
# 用法：在桌面终端运行 bash fix-touch.sh
# ============================================================

set -e

echo "=== 触摸屏诊断与修复 ==="
echo ""

# 设置 DISPLAY（如果未设置）
if [ -z "$DISPLAY" ]; then
    export DISPLAY=:0
    echo "已设置 DISPLAY=:0"
fi

# 1. 列出所有输入设备
echo "1. 输入设备列表："
xinput list
echo ""

# 2. 找触摸设备
TOUCH_DEVICE=$(xinput list --name-only 2>/dev/null | grep -i -E 'touch|ILITEK|ELAN' | head -1)
if [ -z "$TOUCH_DEVICE" ]; then
    echo "错误: 未找到触摸设备"
    echo "请从上面的列表中找到触摸设备名称，然后手动运行："
    echo "  xinput set-prop \"设备名称\" \"Coordinate Transformation Matrix\" 0 -1 1 1 0 0 0 0 1"
    exit 1
fi
echo "2. 触摸设备: $TOUCH_DEVICE"
echo ""

# 3. 查看当前设置
echo "3. 当前坐标变换矩阵:"
xinput list-props "$TOUCH_DEVICE" | grep "Coordinate Transformation Matrix"
echo ""

# 4. 重置为 ABSOLUTE 模式
TOUCH_ID=$(xinput list --id-only "$TOUCH_DEVICE" 2>/dev/null | head -1)
if [ -n "$TOUCH_ID" ]; then
    xinput set-mode "$TOUCH_ID" ABSOLUTE 2>/dev/null && echo "4. 已设置为 ABSOLUTE 模式" || echo "4. (set-mode 失败，可能不支持，跳过)"
fi
echo ""

# 5. 检查屏幕旋转
ROTATION=$(xrandr --query 2>/dev/null | grep ' connected' | grep -o 'left\|right\|inverted\|normal' | head -1)
echo "5. 屏幕旋转: ${ROTATION:-normal}"
echo ""

# 6. 应用对应的触摸坐标变换
echo "6. 应用触摸坐标变换..."
case "$ROTATION" in
    left)
        echo "   使用 left 旋转矩阵（竖屏，逆时针90度）"
        xinput set-prop "$TOUCH_DEVICE" "Coordinate Transformation Matrix" 0 -1 1 1 0 0 0 0 1
        ;;
    right)
        echo "   使用 right 旋转矩阵（竖屏，顺时针90度）"
        xinput set-prop "$TOUCH_DEVICE" "Coordinate Transformation Matrix" 0 1 0 -1 0 1 0 0 1
        ;;
    inverted)
        echo "   使用 inverted 旋转矩阵（倒置）"
        xinput set-prop "$TOUCH_DEVICE" "Coordinate Transformation Matrix" -1 0 1 0 -1 1 0 0 1
        ;;
    *)
        echo "   使用默认矩阵（横屏）"
        xinput set-prop "$TOUCH_DEVICE" "Coordinate Transformation Matrix" 1 0 0 0 1 0 0 0 1
        ;;
esac
echo ""

# 7. 验证
echo "7. 修复后的坐标变换矩阵:"
xinput list-props "$TOUCH_DEVICE" | grep "Coordinate Transformation Matrix"
echo ""

echo "=== 完成 ==="
echo ""
echo "请测试触摸是否正常。如果还是不对，可能需要尝试其他旋转方向："
echo "  left:     xinput set-prop \"$TOUCH_DEVICE\" \"Coordinate Transformation Matrix\" 0 -1 1 1 0 0 0 0 1"
echo "  right:    xinput set-prop \"$TOUCH_DEVICE\" \"Coordinate Transformation Matrix\" 0 1 0 -1 0 1 0 0 1"
echo "  inverted: xinput set-prop \"$TOUCH_DEVICE\" \"Coordinate Transformation Matrix\" -1 0 1 0 -1 1 0 0 1"
echo "  normal:   xinput set-prop \"$TOUCH_DEVICE\" \"Coordinate Transformation Matrix\" 1 0 0 0 1 0 0 0 1"
echo ""

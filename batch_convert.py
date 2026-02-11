#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import subprocess
from pathlib import Path
import os

pic_dir = Path("public/pic")
image_files = sorted(
    [
        f
        for f in pic_dir.iterdir()
        if f.suffix.lower() in {".png", ".jpg", ".jpeg", ".gif", ".bmp"}
    ]
)

print(f"📸 找到 {len(image_files)} 张图片，开始转换...\n")

converted = 0
for i, img in enumerate(image_files, 1):
    out = img.with_suffix(".webp")
    if out.exists():
        print(f"⏭️  跳过: {img.name}")
        continue

    cmd = f'ffmpeg -i "{img}" -c:v libwebp -q:v 80 "{out}" 2>nul'
    ret = os.system(cmd + " > nul 2>&1")

    if ret == 0:
        orig = img.stat().st_size / 1024
        new = out.stat().st_size / 1024
        ratio = new / orig * 100
        print(f"✅ {i}. {img.name} ({orig:.1f}KB → {new:.1f}KB, {ratio:.0f}%)")
        img.unlink()
        converted += 1
    else:
        print(f"❌ {i}. {img.name}")

print(f"\n{'=' * 50}")
print(f"✅ 成功转换 {converted} 张图片为 WebP 格式！")
print(f"{'=' * 50}")

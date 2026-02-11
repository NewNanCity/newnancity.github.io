#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Extract images from DOCX using zipfile approach
"""

import zipfile
import os


def extract_images_from_docx_zip(docx_path, output_dir):
    """
    使用ZIP方法从DOCX中提取图片（更可靠）
    """
    os.makedirs(output_dir, exist_ok=True)

    image_counter = 0

    try:
        with zipfile.ZipFile(docx_path, "r") as zip_ref:
            # 列出所有文件
            file_list = zip_ref.namelist()

            # 查找media文件夹中的图片
            for file_path in file_list:
                if "word/media/" in file_path:
                    # 提取文件扩展名
                    _, ext = os.path.splitext(file_path)

                    # 读取文件内容
                    image_data = zip_ref.read(file_path)

                    # 生成输出文件名
                    output_filename = f"history_{image_counter}{ext}"
                    output_path = os.path.join(output_dir, output_filename)

                    # 保存图片
                    with open(output_path, "wb") as f:
                        f.write(image_data)

                    print(f"  📸 已提取图片: {output_filename}")
                    image_counter += 1

        print(f"\n✅ 成功提取 {image_counter} 张图片到 {output_dir}")
        return image_counter

    except Exception as e:
        print(f"❌ 提取图片失败: {e}")
        return 0


if __name__ == "__main__":
    docx_file = "牛腩史书.docx"
    images_dir = "public/pic"

    if os.path.exists(docx_file):
        count = extract_images_from_docx_zip(docx_file, images_dir)
        print(f"\n处理完成！提取了 {count} 张图片")
    else:
        print(f"❌ 文件不存在: {docx_file}")

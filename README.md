<div align="center">

# ComfyUI Local Media Browser
### The Ultimate Local File Browser for Images, Videos, and Audio in ComfyUI
### 一个为 ComfyUI 打造的终极本地图片、视频、音频媒体浏览器

</div>

![QQ截图20250821133258](https://github.com/user-attachments/assets/af2f76ff-762b-41d3-a0b5-c38407a8db15)

---

## Overview

**ComfyUI Local Media Browser** is a powerful and feature-rich custom node that integrates a seamless local file browser directly into your ComfyUI workflow. This single, unified node allows you to browse, search, and select local images, videos, and audio files, and instantly import them or their metadata into your projects. It eliminates the need to constantly switch to your OS file explorer, dramatically speeding up your creative process.

The gallery features a fluid, responsive waterfall (masonry) layout, smooth transitions, and an advanced lightbox viewer, ensuring a beautiful and efficient browsing experience.

## Features

-   **All-in-One Media Hub**: Browse images, videos, and audio files within a single, powerful node.
-   **Advanced Navigation**:
    -   Full folder/directory navigation, including an "Up" button to go to the parent directory.
    -   Persistent memory: The node remembers the last directory you visited.
-   **Powerful Filtering & Sorting**:
    -   Toggle visibility for videos and audio files with dedicated checkboxes.
    -   Sort all media by **Name** or modification **Date**, in **Ascending** or **Descending** order.
-   **High-Performance Gallery**:
    -   A fluid, responsive waterfall (masonry) layout that intelligently adapts to the node's size.
    -   **Performance-optimized thumbnails** for images to ensure smooth scrolling even in folders with thousands of high-resolution files.
    -   Smooth fade-in/fade-out transitions when changing directories, preventing jarring visual flashes.
-   **Advanced Lightbox Viewer**:
    -   Double-click any media file to open a full-screen, centered preview.
    -   **Image Viewer**: Supports zooming with the mouse wheel and panning by dragging.
    -   **Video/Audio Player**: Provides full playback controls within the preview.
    -   **Gallery Navigation**: Use on-screen arrows or keyboard arrow keys (`Left`/`Right`) to cycle through all media in the current view without leaving the lightbox.
-   **Independent Multi-Node Usage**:
    -   Use multiple browser nodes in the same workflow without conflicts. Selections for images, videos, and audio are saved independently, allowing you to select one of each and use them simultaneously.
-   **Rich Metadata Output**:
    -   The `info` output port provides detailed metadata for **selected images**, including basic info (dimensions, format) and, most importantly, **AI generation parameters** (like prompts and workflows from ComfyUI or A1111) embedded in the image file.
-   **Bilingual UI**: All controls and labels are provided in both English and Chinese for better accessibility.

## Installation

1.  Navigate to your ComfyUI installation directory.
2.  Go to the `ComfyUI/custom_nodes/` folder.
3.  Clone or download this repository into the `custom_nodes` folder. The final folder structure should be `ComfyUI/custom_nodes/ComfyUI_Local_Image_Gallery/`.
4.  Restart ComfyUI. No additional dependencies are required.

## How to Use

1.  **Add the Node**: Double-click on the canvas, search for `Local Image Gallery`, and add the node to your graph.
2.  **Browse and Filter**:
    -   Enter a full, absolute path to a folder in the "Path" input box and click "Refresh" or press `Enter`.
    -   Use the checkboxes to show or hide video and audio files.
    -   Use the dropdowns to sort the media as desired. The gallery will update automatically.
    -   Click on a folder to navigate into it, and use the "Up" button to go back.
    -   Scroll down to automatically load more files (infinite scroll).
3.  **Preview Media**: Double-click any media card to open the powerful lightbox viewer.
4.  **Select Media**: Single-click on any media card. A colored border will appear around your selection.
5.  **Connect the Outputs**:
    -   `image`: Connect to a `Preview Image`, `Save Image`, or any node that accepts an image tensor.
    -   `video_path`: Connect to a text display node (like `Show Text`) or a video playback node that accepts a local file path.
    -   `audio_path`: Connect to a text display node or an audio playback node.
    -   `info`: Connect to a `Show Text` node to view detailed metadata from a selected image.
6.  **Queue Prompt**: Run your workflow. The data from your latest selections for each media type will be fed into the connected nodes.

---

## 概述

**ComfyUI 本地媒体浏览器** 是一个功能强大、特性丰富的自定义节点，它将一个无缝的本地文件浏览器直接集成到了您的 ComfyUI 工作流中。这一个统一的节点允许您浏览、搜索和选择本地的图片、视频和音频文件，并能一键将它们本身或其元数据导入到您的项目中。它彻底消除了在操作系统文件浏览器和ComfyUI之间来回切换的烦恼，极大地加速了您的创作流程。

本插件的图库拥有一个流畅的响应式瀑布流（砌体）布局、平滑的过渡动画和一个高级的灯箱预览器，确保了美观且高效的浏览体验。

## 功能特性

-   **一体化媒体中心**: 在一个强大的节点内即可浏览图片、视频和音频文件。
-   **高级导航**:
    -   完整的文件夹/目录导航，包含一个用于返回上一级目录的“Up”按钮。
    -   持久化记忆：节点会记住您最后访问的文件夹路径。
-   **强大的筛选与排序**:
    -   通过专属的复选框来切换视频和音频文件的可见性。
    -   可按**名称**或修改**日期**，以**递增**或**递减**的顺序对所有媒体进行排序。
-   **高性能图库**:
    -   一个流畅的、响应式的瀑布流（砌体）布局，能够智能地适应节点尺寸。
    -   为图片提供了**性能优化的缩略图**，即使在包含数千张高分辨率文件的文件夹中也能确保流畅滚动。
    -   切换目录时拥有平滑的淡入淡出过渡效果，避免了刺眼的视觉闪烁。
-   **高级灯箱预览器**:
    -   双击任意媒体文件即可打开一个全局居中的全屏预览器。
    -   **图片查看器**: 支持使用鼠标滚轮进行**缩放**，并通过拖动进行**平移**。
    -   **视频/音频播放器**: 在预览窗口内提供完整的播放控制功能。
    -   **图库导航**: 使用界面上的箭头或键盘方向键（`左`/`右`）即可在不关闭预览器的情况下，轻松切换浏览当前视图中的所有媒体文件。
-   **支持多节点独立使用**:
    -   可在同一个工作流中使用多个本节点而不会产生冲突。图片、视频和音频的选择状态被独立保存，允许您同时选择三者各一，并分别使用它们。
-   **丰富的元数据输出**:
    -   `info` 输出端口为**选中的图片**提供详细的元数据，不仅包括基本信息（尺寸、格式），最重要的是，还能提取嵌入在图片文件中的**AI生成参数**（例如来自 ComfyUI 或 A1111 的提示词和工作流）。
-   **双语用户界面**: 所有的控件和标签都提供了中英双语，以提升可用性。

## 安装说明

1.  导航至您的 ComfyUI 安装目录。
2.  进入 `ComfyUI/custom_nodes/` 文件夹。
3.  将此插件的仓库克隆或下载到 `custom_nodes` 文件夹中。最终的文件夹结构应为 `ComfyUI/custom_nodes/ComfyUI_Local_Image_Gallery/`。
4.  重启 ComfyUI。无需安装任何额外的依赖库。

## 使用方法

1.  **添加节点**: 在画布上双击，搜索 `Local Image Gallery`，然后将该节点添加到您的图中。
2.  **浏览与筛选**:
    -   在“路径”输入框中输入一个完整的、绝对路径的文件夹地址，然后点击“刷新”或按`回车键`。
    -   使用复选框来显示或隐藏视频和音频文件。
    -   使用下拉菜单按您的需求对媒体进行排序，图库将会自动更新。
    -   单击一个文件夹以进入，使用“Up”按钮可以返回上一级。
    -   向下滚动即可自动加载更多文件（无限滚动）。
3.  **预览媒体**: 双击任意媒体卡片以打开功能强大的灯箱预览器。
4.  **选择媒体**: 单击任意媒体卡片。您选中的卡片周围会出现一个彩色的边框。
5.  **连接输出端口**:
    -   `image`: 连接到 `Preview Image` (预览图像)、`Save Image` (保存图像) 或任何接受图片张量的节点。
    -   `video_path`: 连接到文本显示节点 (如 `Show Text`) 或任何接受本地视频文件路径的视频播放节点。
    -   `audio_path`: 连接到文本显示节点或音频播放节点。
    -   `info`: 连接到 `Show Text` (显示文本) 节点，以查看所选图片的详细元数据。
6.  **执行工作流**: 点击 "Queue Prompt"。您为每种媒体类型所做的最新选择，其数据将被分别送入已连接的节点中。

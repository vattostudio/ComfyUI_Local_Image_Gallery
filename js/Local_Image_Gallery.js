import { app } from "/scripts/app.js";
import { api } from "/scripts/api.js";

function setupGlobalLightbox() {
    if (document.getElementById('global-image-lightbox')) return;
    const lightboxId = 'global-image-lightbox';
    const lightboxHTML = `
        <div id="${lightboxId}" class="lightbox-overlay">
            <button class="lightbox-close">&times;</button>
            <button class="lightbox-prev">&lt;</button>
            <button class="lightbox-next">&gt;</button>
            <div class="lightbox-content">
                <img src="" alt="Preview" style="display: none;">
                <video src="" controls autoplay style="display: none;"></video>
                <audio src="" controls autoplay style="display: none;"></audio>
            </div>
        </div>
    `;
    const lightboxCSS = `
        #${lightboxId} { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.85); display: none; align-items: center; justify-content: center; z-index: 10000; box-sizing: border-box; -webkit-user-select: none; user-select: none; }
        #${lightboxId} .lightbox-content { position: relative; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; overflow: hidden; }
        #${lightboxId} img, #${lightboxId} video { max-width: 95%; max-height: 95%; object-fit: contain; transition: transform 0.1s ease-out; transform: scale(1) translate(0, 0); }
        #${lightboxId} audio { width: 80%; max-width: 600px; }
        #${lightboxId} img { cursor: grab; }
        #${lightboxId} img.panning { cursor: grabbing; }
        #${lightboxId} .lightbox-close { position: absolute; top: 15px; right: 20px; width: 35px; height: 35px; background-color: rgba(0,0,0,0.5); color: #fff; border-radius: 50%; border: 2px solid #fff; font-size: 24px; line-height: 30px; text-align: center; cursor: pointer; z-index: 10002; }
        #${lightboxId} .lightbox-prev, #${lightboxId} .lightbox-next { position: absolute; top: 50%; transform: translateY(-50%); width: 45px; height: 60px; background-color: rgba(0,0,0,0.4); color: #fff; border: none; font-size: 30px; cursor: pointer; z-index: 10001; transition: background-color 0.2s; }
        #${lightboxId} .lightbox-prev:hover, #${lightboxId} .lightbox-next:hover { background-color: rgba(0,0,0,0.7); }
        #${lightboxId} .lightbox-prev { left: 15px; }
        #${lightboxId} .lightbox-next { right: 15px; }
        #${lightboxId} [disabled] { display: none; }
    `;
    document.body.insertAdjacentHTML('beforeend', lightboxHTML);
    const styleEl = document.createElement('style');
    styleEl.textContent = lightboxCSS;
    document.head.appendChild(styleEl);
}

setupGlobalLightbox();


app.registerExtension({
    name: "Comfy.LocalImageGallery",
    async beforeRegisterNodeDef(nodeType, nodeData, app) {
        if (nodeData.name === "LocalImageGalleryNode") {
            const onNodeCreated = nodeType.prototype.onNodeCreated;
            nodeType.prototype.onNodeCreated = function () {
                const r = onNodeCreated?.apply(this, arguments);

                const galleryContainer = document.createElement("div");
                const uniqueId = `local-gallery-${Math.random().toString(36).substring(2, 9)}`;
                galleryContainer.id = uniqueId;

                const folderSVG = `<svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%"><path d="M928 320H488L416 232c-15.1-18.9-38.3-29.9-63.1-29.9H128c-35.3 0-64 28.7-64 64v512c0 35.3 28.7 64 64 64h800c35.3 0 64-28.7 64-64V384c0-35.3-28.7-64-64-64z" fill="#F4D03F"></path></svg>`;
                const videoSVG = `<svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%"><path d="M895.9 203.4H128.1c-35.3 0-64 28.7-64 64v489.2c0 35.3 28.7 64 64 64h767.8c35.3 0 64-28.7 64-64V267.4c0-35.3-28.7-64-64-64zM384 691.2V332.8L668.1 512 384 691.2z" fill="#AED6F1"></path></svg>`;
                const audioSVG = `<svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%"><path d="M768 256H256c-35.3 0-64 28.7-64 64v384c0 35.3 28.7 64 64 64h512c35.3 0 64-28.7 64-64V320c0-35.3-28.7-64-64-64zM512 665.6c-84.8 0-153.6-68.8-153.6-153.6S427.2 358.4 512 358.4s153.6 68.8 153.6 153.6-68.8 153.6-153.6 153.6z" fill="#A9DFBF"></path><path d="M512 409.6c-56.5 0-102.4 45.9-102.4 102.4s45.9 102.4 102.4 102.4 102.4-45.9 102.4-102.4-45.9-102.4-102.4-102.4z" fill="#A9DFBF"></path></svg>`;

                galleryContainer.innerHTML = `
                    <style>
                        #${uniqueId} .local-gallery-container-wrapper { width: 100%; font-family: sans-serif; color: #ccc; box-sizing: border-box; display: flex; flex-direction: column; height: 100%; }
                        #${uniqueId} .local-gallery-controls { display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 10px; align-items: center; flex-shrink: 0; }
                        #${uniqueId} .local-gallery-controls label { margin-left: 5px; font-size: 12px; white-space: nowrap; }
                        #${uniqueId} .local-gallery-controls input, #${uniqueId} .local-gallery-controls select, #${uniqueId} .local-gallery-controls button { background-color: #333; color: #ccc; border: 1px solid #555; border-radius: 4px; padding: 4px; font-size: 12px; }
                        #${uniqueId} .local-gallery-controls input[type=text] { flex-grow: 1; min-width: 150px;}
                        #${uniqueId} .local-gallery-controls button { cursor: pointer; }
                        #${uniqueId} .local-gallery-controls button:hover { background-color: #444; }
                        #${uniqueId} .local-gallery-controls button:disabled { background-color: #222; cursor: not-allowed; }
                        #${uniqueId} .image-cardholder { position: relative; overflow-y: auto; background: #222; padding: 0 5px; border-radius: 5px; flex-grow: 1; min-height: 100px; width: 100%; transition: opacity 0.2s ease-in-out; }
                        #${uniqueId} .gallery-card { position: absolute; border: 3px solid transparent; border-radius: 8px; box-sizing: border-box; transition: border-color 0.2s ease-in-out, top 0.3s ease, left 0.3s ease; cursor: pointer; }
                        #${uniqueId} .gallery-card.selected { border-color: #00FFC9; }
                        #${uniqueId} .gallery-card img, #${uniqueId} .gallery-card video { width: 100%; height: auto; border-radius: 5px; display: block; }
                        #${uniqueId} .gallery-card *:hover { filter: brightness(1.2); }
                        #${uniqueId} .dir-card, #${uniqueId} .audio-card { background-color: #333; padding: 10px; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; }
                        #${uniqueId} .dir-card:hover, #${uniqueId} .audio-card:hover { background-color: #444; }
                        #${uniqueId} .dir-card .dir-icon, #${uniqueId} .audio-card .audio-icon { width: 60%; height: 60%; margin-bottom: 8px; }
                        #${uniqueId} .dir-card .dir-name, #${uniqueId} .audio-card .audio-name { font-size: 12px; word-break: break-all; user-select: none; }
                        #${uniqueId} .video-card-overlay { position: absolute; top: 5px; left: 5px; width: 24px; height: 24px; opacity: 0.8; pointer-events: none; }
                        #${uniqueId} .image-cardholder::-webkit-scrollbar { width: 8px; }
                        #${uniqueId} .image-cardholder::-webkit-scrollbar-track { background: #2a2a2a; border-radius: 4px; }
                        #${uniqueId} .image-cardholder::-webkit-scrollbar-thumb { background-color: #555; border-radius: 4px; }
                    </style>
                    <div class="local-gallery-container-wrapper">
                         <div class="local-gallery-controls">
                            <button class="up-button" title="返回上级目录(Return to the previous directory)" disabled>⬆️ 上一级(Up)</button> <label>路径(Path):</label>
                            <input type="text" placeholder="输入媒体文件夹的完整路径 Enter full path to media folder"> <button class="refresh-button">🔄 刷新(Refresh)</button>
                        </div>
                        <div class="local-gallery-controls" style="gap: 5px;">
                            <label>排序(Sort by):</label> <select class="sort-by"> <option value="name">名称-Name</option> <option value="date">日期-Date</option> </select>
                            <label>顺序(Order):</label> <select class="sort-order"> <option value="asc">递增-Ascending</option> <option value="desc">递减-Descending</option> </select>
                            <div style="margin-left: auto; display: flex; align-items: center; gap: 5px;">
                                <label>显示视频(Show Videos):</label> <input type="checkbox" class="show-videos">
                                <label>显示音频(Show Audio):</label> <input type="checkbox" class="show-audio">
                            </div>
                        </div>
                        <div class="image-cardholder"><p>请输入文件夹路径并点击 '刷新'。<br>Enter folder path and click 'Refresh'.</p></div>
                    </div>
                `;
                this.addDOMWidget("local_image_gallery", "div", galleryContainer, {});
                this.size = [800, 670];

                const cardholder = galleryContainer.querySelector(".image-cardholder");
                const controls = galleryContainer.querySelector(".local-gallery-container-wrapper");
                const pathInput = controls.querySelector("input[type='text']");
                const upButton = controls.querySelector(".up-button");
                const showVideosCheckbox = controls.querySelector(".show-videos");
                const showAudioCheckbox = controls.querySelector(".show-audio");

                let isLoading = false, currentPage = 1, totalPages = 1, parentDir = null;

                const debounce = (func, delay) => { let timeoutId; return (...args) => { clearTimeout(timeoutId); timeoutId = setTimeout(() => func.apply(this, args), delay); }; };

                const applyMasonryLayout = () => {
                    const minCardWidth = 150, gap = 5, containerWidth = cardholder.clientWidth;
                    if (containerWidth === 0) return;
                    const columnCount = Math.max(1, Math.floor(containerWidth / (minCardWidth + gap)));
                    const totalGapSpace = (columnCount - 1) * gap;
                    const actualCardWidth = (containerWidth - totalGapSpace) / columnCount;
                    const columnHeights = new Array(columnCount).fill(0);
                    const cards = cardholder.querySelectorAll(".gallery-card");
                    cards.forEach(card => {
                        card.style.width = `${actualCardWidth}px`;
                        if (card.classList.contains('dir-card') || card.classList.contains('audio-card')) {
                            card.style.height = `${actualCardWidth * 0.9}px`;
                        }
                        const minHeight = Math.min(...columnHeights);
                        const columnIndex = columnHeights.indexOf(minHeight);
                        card.style.left = `${columnIndex * (actualCardWidth + gap)}px`;
                        card.style.top = `${minHeight}px`;
                        columnHeights[columnIndex] += card.offsetHeight + gap;
                    });
                    const newHeight = Math.max(...columnHeights);
                    if (newHeight > 0) cardholder.style.height = `${newHeight}px`;
                };

                const debouncedLayout = debounce(applyMasonryLayout, 20);
                new ResizeObserver(debouncedLayout).observe(cardholder);

                const fetchImages = async (page = 1, append = false) => {
                    if (isLoading) return; 
                    isLoading = true;
                    
                    if (!append) {
                        cardholder.style.opacity = 0;
                        await new Promise(resolve => setTimeout(resolve, 200));
                        cardholder.innerHTML = "<p>正在加载...</p>";
                        currentPage = 1;
                    }
                    
                    const directory = pathInput.value;
                    const showVideos = showVideosCheckbox.checked;
                    const showAudio = showAudioCheckbox.checked;
                    
                    if (!directory) { 
                        cardholder.innerHTML = "<p>请输入文件夹路径并点击 '刷新'。<br>Enter folder path and click 'Refresh'.</p>"; 
                        cardholder.style.opacity = 1;
                        isLoading = false; 
                        return; 
                    }
                    
                    const sortBy = controls.querySelector(".sort-by").value;
                    const sortOrder = controls.querySelector(".sort-order").value;
                    let url = `/local_image_gallery/images?directory=${encodeURIComponent(directory)}&page=${page}&sort_by=${sortBy}&sort_order=${sortOrder}&show_videos=${showVideos}&show_audio=${showAudio}`;
                    
                    try {
                        const response = await api.fetchApi(url);
                        if (!response.ok) { const errorData = await response.json(); throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.error}`); }
                        const api_data = await response.json();
                        const items = api_data.items || [];
                        
                        if (!append) cardholder.innerHTML = "";
                        
                        totalPages = api_data.total_pages; parentDir = api_data.parent_directory;
                        pathInput.value = api_data.current_directory; upButton.disabled = !parentDir;
                        
                        items.forEach(item => {
                            const card = document.createElement("div");
                            card.className = "gallery-card";
                            card.dataset.path = item.path;
                            card.dataset.type = item.type;
                            card.title = item.name;

                            if (item.type === 'dir') {
                                card.classList.add("dir-card");
                                card.innerHTML = `<div class="dir-icon">${folderSVG}</div><div class="dir-name">${item.name}</div>`;
                            } else if (item.type === 'image') {
                                const img = document.createElement("img");
                                img.src = `/local_image_gallery/thumbnail?filepath=${encodeURIComponent(item.path)}`;
                                img.loading = "lazy";
                                img.onload = debouncedLayout;
                                card.appendChild(img);
                            } else if (item.type === 'video') {
                                const video = document.createElement("video");
                                Object.assign(video, { src: `/local_image_gallery/view?filepath=${encodeURIComponent(item.path)}#t=0.1`, autoplay: false, loop: true, muted: true, playsinline: true });
                                video.onloadeddata = debouncedLayout;
                                card.appendChild(video);
                                card.innerHTML += `<div class="video-card-overlay">${videoSVG}</div>`;
                            } else if (item.type === 'audio') {
                                card.classList.add("audio-card");
                                card.innerHTML = `<div class="audio-icon">${audioSVG}</div><div class="audio-name">${item.name}</div>`;
                            }
                            cardholder.appendChild(card);
                        });
                        if (items.length === 0 && !append) cardholder.innerHTML = "<p>文件夹为空。<br>The folder is empty.</p>";
                        
                        requestAnimationFrame(debouncedLayout); 
                        currentPage = page;
                    } catch (error) { 
                        cardholder.innerHTML = `<p style="color:red;">错误: ${error.message}</p>`; 
                    } 
                    finally { 
                        isLoading = false; 
                        if (!append) cardholder.style.opacity = 1;
                    }
                };

                cardholder.addEventListener('click', async (event) => {
                    const card = event.target.closest('.gallery-card');
                    if (!card) return;
                    const type = card.dataset.type, path = card.dataset.path;
                    if (type === 'dir') {
                        pathInput.value = path; fetchImages(1, false);
                    } else if (['image', 'video', 'audio'].includes(type)) {
                        const currentlySelected = cardholder.querySelector('.selected');
                        if (currentlySelected) currentlySelected.classList.remove('selected');
                        card.classList.add('selected');
                        try { 
                            await fetch("/local_image_gallery/set_image_path", { 
                                method: "POST", 
                                headers: { "Content-Type": "application/json" }, 
                                body: JSON.stringify({ path: path, type: type }), 
                            });
                        } catch(e) { console.error("发送数据到后端时出错:", e); }
                    }
                });

                const lightbox = document.getElementById('global-image-lightbox');
                const lightboxImg = lightbox.querySelector("img");
                const lightboxVideo = lightbox.querySelector("video");
                const lightboxAudio = lightbox.querySelector("audio");
                const prevButton = lightbox.querySelector(".lightbox-prev");
                const nextButton = lightbox.querySelector(".lightbox-next");
                let scale = 1, panning = false, pointX = 0, pointY = 0, start = { x: 0, y: 0 };
                let currentMediaList = [];
                let currentMediaIndex = -1;

                function setTransform() { lightboxImg.style.transform = `translate(${pointX}px, ${pointY}px) scale(${scale})`; }
                function resetLightboxState() { scale = 1; pointX = 0; pointY = 0; setTransform(); }

                function showMediaAtIndex(index) {
                    if (index < 0 || index >= currentMediaList.length) return;
                    currentMediaIndex = index;
                    const media = currentMediaList[index];
                    
                    resetLightboxState();
                    
                    lightboxImg.style.display = 'none';
                    lightboxVideo.style.display = 'none';
                    lightboxAudio.style.display = 'none';
                    lightboxVideo.pause();
                    lightboxAudio.pause();

                    if (media.type === 'image') {
                        lightboxImg.style.display = 'block';
                        lightboxImg.src = `/local_image_gallery/view?filepath=${encodeURIComponent(media.path)}`;
                    } else if (media.type === 'video') {
                        lightboxVideo.style.display = 'block';
                        lightboxVideo.src = `/local_image_gallery/view?filepath=${encodeURIComponent(media.path)}`;
                    } else if (media.type === 'audio') {
                        lightboxAudio.style.display = 'block';
                        lightboxAudio.src = `/local_image_gallery/view?filepath=${encodeURIComponent(media.path)}`;
                    }

                    prevButton.disabled = currentMediaIndex === 0;
                    nextButton.disabled = currentMediaIndex === currentMediaList.length - 1;
                }

                prevButton.addEventListener('click', () => showMediaAtIndex(currentMediaIndex - 1));
                nextButton.addEventListener('click', () => showMediaAtIndex(currentMediaIndex + 1));
                
                lightboxImg.addEventListener('mousedown', (e) => { e.preventDefault(); panning = true; lightboxImg.classList.add('panning'); start = { x: e.clientX - pointX, y: e.clientY - pointY }; });
                window.addEventListener('mouseup', () => { panning = false; lightboxImg.classList.remove('panning'); });
                window.addEventListener('mousemove', (e) => { if (!panning) return; e.preventDefault(); pointX = e.clientX - start.x; pointY = e.clientY - start.y; setTransform(); });
                lightbox.addEventListener('wheel', (e) => {
                    if (lightboxImg.style.display !== 'block') return;
                    e.preventDefault(); const rect = lightboxImg.getBoundingClientRect(); const delta = -e.deltaY; const oldScale = scale; scale *= (delta > 0 ? 1.1 : 1 / 1.1); scale = Math.max(0.2, scale); pointX = (1 - scale / oldScale) * (e.clientX - rect.left) + pointX; pointY = (1 - scale / oldScale) * (e.clientY - rect.top) + pointY; setTransform(); 
                });

                cardholder.addEventListener('dblclick', (event) => {
                    const card = event.target.closest('.gallery-card');
                    if (!card || !['image', 'video', 'audio'].includes(card.dataset.type)) return;
                    event.preventDefault(); event.stopPropagation();
                    
                    const allMediaCards = Array.from(cardholder.querySelectorAll(".gallery-card[data-type='image'], .gallery-card[data-type='video'], .gallery-card[data-type='audio']"));
                    currentMediaList = allMediaCards.map(c => ({ path: c.dataset.path, type: c.dataset.type }));
                    
                    const clickedPath = card.dataset.path;
                    const startIndex = currentMediaList.findIndex(item => item.path === clickedPath);

                    if (startIndex !== -1) {
                        lightbox.style.display = 'flex';
                        showMediaAtIndex(startIndex);
                    }
                });

                const closeLightbox = () => { 
                    lightbox.style.display = 'none'; 
                    lightboxImg.src = ""; 
                    lightboxVideo.pause();
                    lightboxVideo.src = "";
                    lightboxAudio.pause();
                    lightboxAudio.src = "";
                };
                lightbox.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
                lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
                
                window.addEventListener('keydown', (e) => {
                    if (lightbox.style.display !== 'flex') return;
                    if (e.key === 'ArrowLeft') { e.preventDefault(); prevButton.click(); } 
                    else if (e.key === 'ArrowRight') { e.preventDefault(); nextButton.click(); } 
                    else if (e.key === 'Escape') { e.preventDefault(); closeLightbox(); }
                });

                const resetAndReload = () => { fetchImages(1, false); };
                controls.querySelector('.refresh-button').onclick = resetAndReload;
                pathInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') resetAndReload(); });
                controls.querySelectorAll('select').forEach(select => { select.addEventListener('change', resetAndReload); });
                showVideosCheckbox.addEventListener('change', resetAndReload);
                showAudioCheckbox.addEventListener('change', resetAndReload);
                upButton.onclick = () => { if(parentDir){ pathInput.value = parentDir; resetAndReload(); } };
                cardholder.onscroll = () => { if (cardholder.scrollTop + cardholder.clientHeight >= cardholder.scrollHeight - 300 && !isLoading && currentPage < totalPages) { fetchImages(currentPage + 1, true); } };
                
                const loadLastPath = async () => {
                    try {
                        const response = await api.fetchApi("/local_image_gallery/get_last_path");
                        const data = await response.json();
                        if (data.last_path) {
                            pathInput.value = data.last_path;
                            resetAndReload();
                        }
                    } catch (e) { console.error("无法加载上次路径:", e); }
                };
                
                loadLastPath();
                
                return r;
            };
        }
    },
});
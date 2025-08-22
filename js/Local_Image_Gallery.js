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
                const uniqueId = `lmm-gallery-${Math.random().toString(36).substring(2, 9)}`;
                galleryContainer.id = uniqueId;

                const folderSVG = `<svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%"><path d="M928 320H488L416 232c-15.1-18.9-38.3-29.9-63.1-29.9H128c-35.3 0-64 28.7-64 64v512c0 35.3 28.7 64 64 64h800c35.3 0 64-28.7 64-64V384c0-35.3-28.7-64-64-64z" fill="#F4D03F"></path></svg>`;
                const videoSVG = `<svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%"><path d="M895.9 203.4H128.1c-35.3 0-64 28.7-64 64v489.2c0 35.3 28.7 64 64 64h767.8c35.3 0 64-28.7 64-64V267.4c0-35.3-28.7-64-64-64zM384 691.2V332.8L668.1 512 384 691.2z" fill="#AED6F1"></path></svg>`;
                const audioSVG = `<svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%"><path d="M768 256H256c-35.3 0-64 28.7-64 64v384c0 35.3 28.7 64 64 64h512c35.3 0 64-28.7 64-64V320c0-35.3-28.7-64-64-64zM512 665.6c-84.8 0-153.6-68.8-153.6-153.6S427.2 358.4 512 358.4s153.6 68.8 153.6 153.6-68.8 153.6-153.6 153.6z" fill="#A9DFBF"></path><path d="M512 409.6c-56.5 0-102.4 45.9-102.4 102.4s45.9 102.4 102.4 102.4 102.4-45.9 102.4-102.4-45.9-102.4-102.4-102.4z" fill="#A9DFBF"></path></svg>`;

                galleryContainer.innerHTML = `
                    <style>
                        #${uniqueId} .lmm-container-wrapper { width: 100%; font-family: sans-serif; color: #ccc; box-sizing: border-box; display: flex; flex-direction: column; height: 100%; }
                        #${uniqueId} .lmm-controls { display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 10px; align-items: center; flex-shrink: 0; }
                        #${uniqueId} .lmm-controls label { margin-left: 0px; font-size: 12px; white-space: nowrap; }
                        #${uniqueId} .lmm-controls input, #${uniqueId} .lmm-controls select, #${uniqueId} .lmm-controls button { background-color: #333; color: #ccc; border: 1px solid #555; border-radius: 4px; padding: 4px; font-size: 12px; }
                        #${uniqueId} .lmm-controls input[type=text] { flex-grow: 1; min-width: 150px;}
                        #${uniqueId} .lmm-path-controls { flex-grow: 1; display: flex; gap: 5px; }
                        #${uniqueId} .lmm-path-presets { flex-grow: 1; }
                        #${uniqueId} .lmm-controls button { cursor: pointer; }
                        #${uniqueId} .lmm-controls button:hover { background-color: #444; }
                        #${uniqueId} .lmm-controls button:disabled { background-color: #222; cursor: not-allowed; }
                        #${uniqueId} .lmm-cardholder { position: relative; overflow-y: auto; background: #222; padding: 0 5px; border-radius: 5px; flex-grow: 1; min-height: 100px; width: 100%; transition: opacity 0.2s ease-in-out; }
                        #${uniqueId} .lmm-gallery-card { position: absolute; border: 3px solid transparent; border-radius: 8px; box-sizing: border-box; transition: all 0.3s ease; cursor: pointer; display: flex; flex-direction: column; background-color: #2a2a2a; }
                        #${uniqueId} .lmm-gallery-card.lmm-selected { border-color: #00FFC9; }
                        #${uniqueId} .lmm-card-media-wrapper { flex-grow: 1; position: relative; display: flex; align-items: center; justify-content: center; min-height: 100px; }
                        #${uniqueId} .lmm-gallery-card img, #${uniqueId} .lmm-gallery-card video { width: 100%; height: auto; border-top-left-radius: 5px; border-top-right-radius: 5px; display: block; }
                        #${uniqueId} .lmm-folder-card, #${uniqueId} .lmm-audio-card { background-color: transparent; flex-grow: 1; padding: 10px; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; }
                        #${uniqueId} .lmm-folder-card:hover, #${uniqueId} .lmm-audio-card:hover { background-color: #444; }
                        #${uniqueId} .lmm-folder-icon, #${uniqueId} .lmm-audio-icon { width: 60%; height: 60%; margin-bottom: 8px; }
                        #${uniqueId} .lmm-folder-name, #${uniqueId} .lmm-audio-name { font-size: 12px; word-break: break-all; user-select: none; }
                        #${uniqueId} .lmm-video-card-overlay { position: absolute; top: 5px; left: 5px; width: 24px; height: 24px; opacity: 0.8; pointer-events: none; }
                        #${uniqueId} .lmm-card-info-panel { flex-shrink: 0; background-color: #353535; padding: 4px; border-bottom-left-radius: 5px; border-bottom-right-radius: 5px; min-height: 48px; }
                        #${uniqueId} .lmm-star-rating { font-size: 16px; cursor: pointer; color: #555; }
                        #${uniqueId} .lmm-star-rating .lmm-star:hover { color: #FFD700 !important; }
                        #${uniqueId} .lmm-star-rating .lmm-star.lmm-rated { color: #FFC700; }
                        #${uniqueId} .lmm-tag-list { display: flex; flex-wrap: wrap; gap: 3px; margin-top: 4px; }
                        #${uniqueId} .lmm-tag-list .lmm-tag { background-color: #006699; color: #fff; padding: 1px 4px; font-size: 10px; border-radius: 3px; cursor: pointer; }
                        #${uniqueId} .lmm-tag-list .lmm-tag:hover { background-color: #0088CC; }
                        #${uniqueId} .lmm-tag-editor { display: none; flex-wrap: wrap; gap: 5px; background-color: #2a2a2a; padding: 5px; border-radius: 4px; }
                        #${uniqueId} .lmm-tag-editor.lmm-visible { display: flex; }
                        #${uniqueId} .lmm-tag-editor-list { display: flex; flex-wrap: wrap; gap: 5px; align-items: center; }
                        #${uniqueId} .lmm-tag-editor-list .lmm-tag .lmm-remove-tag { margin-left: 4px; color: #fdd; cursor: pointer; }
                        #${uniqueId} .lmm-cardholder::-webkit-scrollbar { width: 8px; }
                        #${uniqueId} .lmm-cardholder::-webkit-scrollbar-track { background: #2a2a2a; border-radius: 4px; }
                        #${uniqueId} .lmm-cardholder::-webkit-scrollbar-thumb { background-color: #555; border-radius: 4px; }
                    </style>
                    <div class="lmm-container-wrapper">
                         <div class="lmm-controls">
                            <button class="lmm-up-button" title="Return to the previous directory" disabled>⬆️ Up</button> 
                            <label>Path:</label>
                            <div class="lmm-path-controls">
                                <input type="text" placeholder="Enter full path to media folder">
                                <select class="lmm-path-presets"></select>
                                <button class="lmm-add-path-button" title="Add current path to presets">➕</button>
                                <button class="lmm-remove-path-button" title="Remove selected preset">➖</button>
                            </div>
                            <button class="lmm-refresh-button">🔄 Refresh</button>
                        </div>
                        <div class="lmm-controls" style="gap: 5px;">
                            <label>Sort by:</label> <select class="lmm-sort-by"> <option value="name">Name</option> <option value="date">Date</option> <option value="rating">Rating</option> </select>
                            <label>Order:</label> <select class="lmm-sort-order"> <option value="asc">Ascending</option> <option value="desc">Descending</option> </select>
                            <div style="margin-left: auto; display: flex; align-items: center; gap: 5px;">
                                <label>Show Videos:</label> <input type="checkbox" class="lmm-show-videos">
                                <label>Show Audio:</label> <input type="checkbox" class="lmm-show-audio">
                            </div>
                        </div>
                        <div class="lmm-controls" style="gap: 5px;">
                            <label>Filter by Tag:</label> <input type="text" class="lmm-tag-filter-input" placeholder="Enter tag...">
                            <label>Global:</label> <input type="checkbox" class="lmm-global-search">
                        </div>
                        <div class="lmm-controls lmm-tag-editor">
                            <label>Edit Tags:</label> <input type="text" class="lmm-tag-editor-input" placeholder="Add tag and press Enter...">
                            <div class="lmm-tag-editor-list"></div>
                        </div>
                        <div class="lmm-cardholder"><p>Enter folder path and click 'Refresh'.</p></div>
                    </div>
                `;
                this.addDOMWidget("local_image_gallery", "div", galleryContainer, {});
                this.size = [800, 670];

                const cardholder = galleryContainer.querySelector(".lmm-cardholder");
                const controls = galleryContainer.querySelector(".lmm-container-wrapper");
                const pathInput = controls.querySelector("input[type='text']");
                const pathPresets = controls.querySelector(".lmm-path-presets");
                const addPathButton = controls.querySelector(".lmm-add-path-button");
                const removePathButton = controls.querySelector(".lmm-remove-path-button");
                const upButton = controls.querySelector(".lmm-up-button");
                const showVideosCheckbox = controls.querySelector(".lmm-show-videos");
                const showAudioCheckbox = controls.querySelector(".lmm-show-audio");
                const tagFilterInput = controls.querySelector(".lmm-tag-filter-input");
                const globalSearchCheckbox = controls.querySelector(".lmm-global-search");
                const tagEditor = controls.querySelector(".lmm-tag-editor");
                const tagEditorInput = controls.querySelector(".lmm-tag-editor-input");
                const tagEditorList = controls.querySelector(".lmm-tag-editor-list");

                let isLoading = false, currentPage = 1, totalPages = 1, parentDir = null, currentSelectedCard = null;

                const debounce = (func, delay) => { let timeoutId; return (...args) => { clearTimeout(timeoutId); timeoutId = setTimeout(() => func.apply(this, args), delay); }; };

                const applyMasonryLayout = () => {
                    const minCardWidth = 150, gap = 5, containerWidth = cardholder.clientWidth;
                    if (containerWidth === 0) return;
                    const columnCount = Math.max(1, Math.floor(containerWidth / (minCardWidth + gap)));
                    const totalGapSpace = (columnCount - 1) * gap;
                    const actualCardWidth = (containerWidth - totalGapSpace) / columnCount;
                    const columnHeights = new Array(columnCount).fill(0);
                    const cards = cardholder.querySelectorAll(".lmm-gallery-card");
                    cards.forEach(card => {
                        card.style.width = `${actualCardWidth}px`;
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
                
                async function updateMetadata(path, { rating, tags }) {
                    try {
                        let payload = { path };
                        if (rating !== undefined) payload.rating = rating;
                        if (tags !== undefined) payload.tags = tags;
                        await api.fetchApi("/local_image_gallery/update_metadata", {
                            method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
                        });
                    } catch(e) { console.error("Failed to update metadata:", e); }
                }

                async function savePaths() {
                    const paths = Array.from(pathPresets.options).map(o => o.value);
                    try {
                        await api.fetchApi("/local_image_gallery/save_paths", {
                            method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ paths }),
                        });
                    } catch(e) { console.error("Failed to save paths:", e); }
                }

                function updateCardTagsUI(card) {
                    const tagListEl = card.querySelector('.lmm-tag-list');
                    if (!tagListEl) return;
                    
                    const tags = card.dataset.tags ? card.dataset.tags.split(',') : [];
                    tagListEl.innerHTML = tags.map(t => `<span class="lmm-tag">${t}</span>`).join('');
                }

                function renderTagEditor(card) {
                    if (!card) {
                        tagEditor.classList.remove("lmm-visible");
                        return;
                    }
                    tagEditorList.innerHTML = "";
                    const tags = card.dataset.tags ? card.dataset.tags.split(',') : [];
                    tags.forEach(tag => {
                        if (!tag) return;
                        const tagEl = document.createElement('span');
                        tagEl.className = 'lmm-tag';
                        tagEl.textContent = tag;
                        const removeEl = document.createElement('span');
                        removeEl.className = 'lmm-remove-tag';
                        removeEl.textContent = ' ⓧ';
                        removeEl.onclick = () => {
                            const newTags = tags.filter(t => t !== tag);
                            card.dataset.tags = newTags.join(',');
                            
                            updateMetadata(card.dataset.path, { tags: newTags });
                            updateCardTagsUI(card);
                            renderTagEditor(card);

                            const isGlobalSearch = globalSearchCheckbox.checked;
                            const filterTag = tagFilterInput.value.trim();
                            if (isGlobalSearch && filterTag && filterTag.toLowerCase() === tag.toLowerCase()) {
                                card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                                card.style.opacity = '0';
                                card.style.transform = 'scale(0.9)';
                                setTimeout(() => {
                                    card.remove();
                                    debouncedLayout();
                                }, 300);
                            } else {
                                debouncedLayout();
                            }
                        };
                        tagEl.appendChild(removeEl);
                        tagEditorList.appendChild(tagEl);
                    });
                    tagEditor.classList.add("lmm-visible");
                }
                
                const fetchImages = async (page = 1, append = false) => {
                    if (isLoading) return; isLoading = true;
                    if (!append) { cardholder.style.opacity = 0; await new Promise(resolve => setTimeout(resolve, 200)); cardholder.innerHTML = "<p>Loading...</p>"; currentPage = 1; }
                    
                    const directory = pathInput.value;
                    const showVideos = showVideosCheckbox.checked;
                    const showAudio = showAudioCheckbox.checked;
                    const filterTag = tagFilterInput.value;
                    const isGlobalSearch = globalSearchCheckbox.checked;
                    
                    if (!directory && !isGlobalSearch) { cardholder.innerHTML = "<p>Enter folder path and click 'Refresh'.</p>"; cardholder.style.opacity = 1; isLoading = false; return; }
                    
                    const sortBy = controls.querySelector(".lmm-sort-by").value;
                    const sortOrder = controls.querySelector(".lmm-sort-order").value;
                    let url = `/local_image_gallery/images?directory=${encodeURIComponent(directory)}&page=${page}&sort_by=${sortBy}&sort_order=${sortOrder}&show_videos=${showVideos}&show_audio=${showAudio}&filter_tag=${encodeURIComponent(filterTag)}&search_mode=${isGlobalSearch ? 'global' : 'local'}`;
                    
                    try {
                        const response = await api.fetchApi(url);
                        if (!response.ok) { const errorData = await response.json(); throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.error}`); }
                        const api_data = await response.json();
                        const items = api_data.items || [];
                        if (!append) cardholder.innerHTML = "";
                        
                        totalPages = api_data.total_pages; 
                        parentDir = api_data.parent_directory;
                        if (!api_data.is_global_search) {
                            pathInput.value = api_data.current_directory;
                        }
                        pathInput.disabled = api_data.is_global_search;
                        upButton.disabled = api_data.is_global_search || !parentDir;
                        
                        items.forEach(item => {
                            const card = document.createElement("div");
                            card.className = "lmm-gallery-card";
                            card.dataset.path = item.path;
                            card.dataset.type = item.type;
                            card.dataset.tags = item.tags.join(',');
                            card.dataset.rating = item.rating;
                            card.title = item.name;

                            let mediaHTML = "";
                            if (item.type === 'dir') {
                                mediaHTML = `<div class="lmm-card-media-wrapper"><div class="lmm-folder-card"><div class="lmm-folder-icon">${folderSVG}</div><div class="lmm-folder-name">${item.name}</div></div></div>`;
                            } else if (item.type === 'image') {
                                mediaHTML = `<div class="lmm-card-media-wrapper"><img src="/local_image_gallery/thumbnail?filepath=${encodeURIComponent(item.path)}" loading="lazy"></div>`;
                            } else if (item.type === 'video') {
                                mediaHTML = `<div class="lmm-card-media-wrapper"><video src="/local_image_gallery/view?filepath=${encodeURIComponent(item.path)}#t=0.1" loop muted playsinline></video><div class="lmm-video-card-overlay">${videoSVG}</div></div>`;
                            } else if (item.type === 'audio') {
                                mediaHTML = `<div class="lmm-card-media-wrapper"><div class="lmm-audio-card"><div class="lmm-audio-icon">${audioSVG}</div><div class="lmm-audio-name">${item.name}</div></div></div>`;
                            }
                            card.innerHTML = mediaHTML;
                            
                            if (item.type !== 'dir') {
                                const infoPanel = document.createElement("div");
                                infoPanel.className = 'lmm-card-info-panel';
                                
                                const stars = Array.from({length: 5}, (_, i) => `<span class="lmm-star" data-value="${i + 1}">☆</span>`).join('');
                                const tags = item.tags.map(t => `<span class="lmm-tag">${t}</span>`).join('');

                                infoPanel.innerHTML = `<div class="lmm-star-rating">${stars}</div><div class="lmm-tag-list">${tags}</div>`;
                                card.appendChild(infoPanel);
                            }
                            
                            cardholder.appendChild(card);
                            
                            const starRating = card.querySelector('.lmm-star-rating');
                            if (starRating) {
                                const stars = starRating.querySelectorAll('.lmm-star');
                                const rating = parseInt(item.rating || 0);
                                stars.forEach((star, index) => {
                                     if (index < rating) {
                                        star.innerHTML = '★';
                                        star.classList.add('lmm-rated');
                                    }
                                });
                            }
                            const img = card.querySelector("img");
                            if(img) img.onload = debouncedLayout;
                            const video = card.querySelector("video");
                            if(video) video.onloadeddata = debouncedLayout;
                        });
                        if (items.length === 0 && !append) {
                             cardholder.innerHTML = `<p>${api_data.is_global_search ? 'No items found for this tag.' : 'The folder is empty.'}</p>`;
                        }
                        
                        requestAnimationFrame(debouncedLayout); 
                        currentPage = page;
                    } catch (error) { cardholder.innerHTML = `<p style="color:red;">Error: ${error.message}</p>`; } 
                    finally { isLoading = false; if (!append) cardholder.style.opacity = 1; }
                };

                cardholder.addEventListener('click', async (event) => {
                    const card = event.target.closest('.lmm-gallery-card');
                    if (!card) return;
                    if (event.target.classList.contains('lmm-star')) {
                        event.stopPropagation();
                        const newRating = parseInt(event.target.dataset.value);
                        const currentRating = parseInt(card.dataset.rating || 0);
                        const finalRating = newRating === currentRating ? 0 : newRating;
                        card.dataset.rating = finalRating;
                        updateMetadata(card.dataset.path, { rating: finalRating });
                        const starRating = card.querySelector('.lmm-star-rating');
                        starRating.querySelectorAll('.lmm-star').forEach((star, index) => {
                             star.innerHTML = index < finalRating ? '★' : '☆';
                             star.classList.toggle('lmm-rated', index < finalRating);
                        });
                        return;
                    }
                    if (event.target.classList.contains('lmm-tag')) {
                        event.stopPropagation();
                        tagFilterInput.value = event.target.textContent;
                        globalSearchCheckbox.checked = true;
                        resetAndReload();
                        return;
                    }
                    const type = card.dataset.type, path = card.dataset.path;
                    if (type === 'dir') {
                        pathInput.value = path;
                        globalSearchCheckbox.checked = false;
                        tagFilterInput.value = "";
                        fetchImages(1, false);
                    } else if (['image', 'video', 'audio'].includes(type)) {
                        if (currentSelectedCard) currentSelectedCard.classList.remove('lmm-selected');
                        card.classList.add('lmm-selected');
                        currentSelectedCard = card;
                        renderTagEditor(card);
                        try { 
                            await fetch("/local_image_gallery/set_image_path", { 
                                method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ path: path, type: type }), 
                            });
                        } catch(e) { console.error("An error occurred while sending data to the backend:", e); }
                    }
                });

                cardholder.addEventListener('dblclick', (event) => {
                    const card = event.target.closest('.lmm-gallery-card');
                    if (!card || !['image', 'video', 'audio'].includes(card.dataset.type)) return;
                    
                    const allMediaCards = Array.from(cardholder.querySelectorAll(".lmm-gallery-card[data-type='image'], .lmm-gallery-card[data-type='video'], .lmm-gallery-card[data-type='audio']"));
                    const currentMediaList = allMediaCards.map(c => ({ path: c.dataset.path, type: c.dataset.type }));
                    const clickedPath = card.dataset.path;
                    const startIndex = currentMediaList.findIndex(item => item.path === clickedPath);

                    if (startIndex !== -1) {
                        showMediaAtIndex(startIndex, currentMediaList);
                    }
                });

                const lightbox = document.getElementById('global-image-lightbox');
                const lightboxImg = lightbox.querySelector("img");
                const lightboxVideo = lightbox.querySelector("video");
                const lightboxAudio = lightbox.querySelector("audio");
                const prevButton = lightbox.querySelector(".lightbox-prev");
                const nextButton = lightbox.querySelector(".lightbox-next");
                let scale = 1, panning = false, pointX = 0, pointY = 0, start = { x: 0, y: 0 };
                let lightboxMediaList = [];
                let lightboxCurrentIndex = -1;

                function setTransform() { lightboxImg.style.transform = `translate(${pointX}px, ${pointY}px) scale(${scale})`; }
                function resetLightboxState() { scale = 1; pointX = 0; pointY = 0; setTransform(); }

                function showMediaAtIndex(index, mediaList) {
                    lightboxMediaList = mediaList;
                    if (index < 0 || index >= lightboxMediaList.length) return;
                    lightboxCurrentIndex = index;
                    const media = lightboxMediaList[index];
                    
                    resetLightboxState();
                    lightbox.style.display = 'flex';
                    
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

                    prevButton.disabled = lightboxCurrentIndex === 0;
                    nextButton.disabled = lightboxCurrentIndex === lightboxMediaList.length - 1;
                }

                prevButton.addEventListener('click', () => showMediaAtIndex(lightboxCurrentIndex - 1, lightboxMediaList));
                nextButton.addEventListener('click', () => showMediaAtIndex(lightboxCurrentIndex + 1, lightboxMediaList));
                
                lightboxImg.addEventListener('mousedown', (e) => { e.preventDefault(); panning = true; lightboxImg.classList.add('panning'); start = { x: e.clientX - pointX, y: e.clientY - pointY }; });
                window.addEventListener('mouseup', () => { panning = false; lightboxImg.classList.remove('panning'); });
                window.addEventListener('mousemove', (e) => { if (!panning) return; e.preventDefault(); pointX = e.clientX - start.x; pointY = e.clientY - start.y; setTransform(); });
                lightbox.addEventListener('wheel', (e) => {
                    if (lightboxImg.style.display !== 'block') return;
                    e.preventDefault(); const rect = lightboxImg.getBoundingClientRect(); const delta = -e.deltaY; const oldScale = scale; scale *= (delta > 0 ? 1.1 : 1 / 1.1); scale = Math.max(0.2, scale); pointX = (1 - scale / oldScale) * (e.clientX - rect.left) + pointX; pointY = (1 - scale / oldScale) * (e.clientY - rect.top) + pointY; setTransform(); 
                });

                const closeLightbox = () => { 
                    lightbox.style.display = 'none'; 
                    lightboxImg.src = ""; 
                    lightboxVideo.pause(); lightboxVideo.src = "";
                    lightboxAudio.pause(); lightboxAudio.src = "";
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
                controls.querySelector('.lmm-refresh-button').onclick = resetAndReload;
                tagFilterInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') resetAndReload(); });
                tagEditorInput.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' && currentSelectedCard) {
                        e.preventDefault();
                        const newTag = tagEditorInput.value.trim();
                        if (newTag) {
                            let tags = currentSelectedCard.dataset.tags ? currentSelectedCard.dataset.tags.split(',').filter(Boolean) : [];
                            if (!tags.includes(newTag)) {
                                tags.push(newTag);
                                currentSelectedCard.dataset.tags = tags.join(',');
                                renderTagEditor(currentSelectedCard);
                                updateCardTagsUI(currentSelectedCard);
                                updateMetadata(currentSelectedCard.dataset.path, { tags });
                                debouncedLayout();
                            }
                            tagEditorInput.value = "";
                        }
                    }
                });
                
                controls.querySelectorAll('select').forEach(select => { select.addEventListener('change', resetAndReload); });
                showVideosCheckbox.addEventListener('change', resetAndReload);
                showAudioCheckbox.addEventListener('change', resetAndReload);
                globalSearchCheckbox.addEventListener('change', resetAndReload);

                addPathButton.addEventListener('click', () => {
                    const currentPath = pathInput.value.trim();
                    if (currentPath) {
                        const exists = Array.from(pathPresets.options).some(o => o.value === currentPath);
                        if (!exists) {
                            const option = new Option(currentPath, currentPath);
                            pathPresets.add(option);
                            savePaths();
                        }
                    }
                });
                
                removePathButton.addEventListener('click', () => {
                    if (pathPresets.selectedIndex > -1) {
                        pathPresets.remove(pathPresets.selectedIndex);
                        savePaths();
                    }
                });
                
                pathPresets.addEventListener('change', () => {
                    if (pathPresets.value) {
                        pathInput.value = pathPresets.value;
                        resetAndReload();
                    }
                });

                upButton.onclick = () => { if(parentDir){ pathInput.value = parentDir; globalSearchCheckbox.checked = false; tagFilterInput.value = ""; resetAndReload(); } };
                cardholder.onscroll = () => { if (cardholder.scrollTop + cardholder.clientHeight >= cardholder.scrollHeight - 300 && !isLoading && currentPage < totalPages) { fetchImages(currentPage + 1, true); } };
                
                const loadLastPath = async () => {
                    try {
                        const response = await api.fetchApi("/local_image_gallery/get_last_path");
                        const data = await response.json();
                        if (data.last_path) {
                            pathInput.value = data.last_path;
                            resetAndReload();
                        }
                    } catch (e) { console.error("Unable to load the last path:", e); }
                };
                
                const loadSavedPaths = async () => {
                    try {
                        const response = await api.fetchApi("/local_image_gallery/get_saved_paths");
                        const data = await response.json();
                        pathPresets.innerHTML = '<option value="" disabled selected>Select a common path</option>';
                        if (data.saved_paths) {
                            data.saved_paths.forEach(p => {
                                if (p) {
                                    const option = new Option(p, p);
                                    pathPresets.add(option);
                                }
                            });
                        }
                    } catch (e) { console.error("Unable to load saved paths:", e); }
                };

                loadLastPath();
                loadSavedPaths();

                this.onResize = function(size) {
                    const minHeight = 670;
                    const minWidth = 510;
                    if (size[1] < minHeight) size[1] = minHeight;
                    if (size[0] < minWidth) size[0] = minWidth;
                };
                
                return r;
            };
        }
    },
});
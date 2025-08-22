import server
from aiohttp import web
import os
import json
import torch
import numpy as np
from PIL import Image, ImageOps
import urllib.parse
import io

NODE_DIR = os.path.dirname(os.path.abspath(__file__))
IMAGE_SELECTION_FILE = os.path.join(NODE_DIR, "selected_local_image.json")
VIDEO_SELECTION_FILE = os.path.join(NODE_DIR, "selected_local_video.json")
AUDIO_SELECTION_FILE = os.path.join(NODE_DIR, "selected_local_audio.json")
CONFIG_FILE = os.path.join(NODE_DIR, "config.json")
METADATA_FILE = os.path.join(NODE_DIR, "metadata.json")
SUPPORTED_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.bmp', '.gif', '.webp']
SUPPORTED_VIDEO_EXTENSIONS = ['.mp4', '.webm', '.mov', '.mkv', '.avi']
SUPPORTED_AUDIO_EXTENSIONS = ['.mp3', '.wav', '.ogg', '.flac']

def save_config(data):
    try:
        with open(CONFIG_FILE, 'w', encoding='utf-8') as f: json.dump(data, f, indent=4)
    except Exception as e: print(f"LocalImageGallery: Error saving config: {e}")

def load_config():
    if os.path.exists(CONFIG_FILE):
        try:
            with open(CONFIG_FILE, 'r', encoding='utf-8') as f: return json.load(f)
        except: pass
    return {}

def load_metadata():
    if not os.path.exists(METADATA_FILE): return {}
    try:
        with open(METADATA_FILE, 'r', encoding='utf-8') as f: return json.load(f)
    except: return {}

def save_metadata(data):
    try:
        with open(METADATA_FILE, 'w', encoding='utf-8') as f: json.dump(data, f, indent=4, ensure_ascii=False)
    except Exception as e: print(f"LocalImageGallery: Error saving metadata: {e}")

class LocalImageGalleryNode:
    @classmethod
    def IS_CHANGED(cls, **kwargs):
        files = [IMAGE_SELECTION_FILE, VIDEO_SELECTION_FILE, AUDIO_SELECTION_FILE, METADATA_FILE]
        mtimes = [os.path.getmtime(f) for f in files if os.path.exists(f)]
        return max(mtimes) if mtimes else float("inf")
    
    @classmethod
    def INPUT_TYPES(cls): return {"required": {}}
    RETURN_TYPES = ("IMAGE", "STRING", "STRING", "STRING",)
    RETURN_NAMES = ("image", "video_path", "audio_path", "info",)
    FUNCTION = "get_selected_media"
    CATEGORY = "📜Asset Gallery/Local"

    def get_selected_media(self):
        image_tensor = torch.zeros(1, 1, 1, 4)
        video_path, audio_path, info_string = "", "", ""
        if os.path.exists(IMAGE_SELECTION_FILE):
            try:
                with open(IMAGE_SELECTION_FILE, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    path = data.get("path")
                    if path and os.path.exists(path):
                        img = Image.open(path)
                        img = img.convert("RGBA") if 'A' in img.getbands() else img.convert("RGB")
                        img_array = np.array(img).astype(np.float32) / 255.0
                        image_tensor = torch.from_numpy(img_array)[None,]
                        if "info" in data: info_string = json.dumps(data["info"], indent=4, ensure_ascii=False)
            except Exception as e: print(f"LocalImageGallery: Error processing image selection: {e}")
        if os.path.exists(VIDEO_SELECTION_FILE):
            try:
                with open(VIDEO_SELECTION_FILE, 'r', encoding='utf-8') as f:
                    path = json.load(f).get("path")
                    if path and os.path.exists(path): video_path = path
            except Exception as e: print(f"LocalImageGallery: Error processing video selection: {e}")
        if os.path.exists(AUDIO_SELECTION_FILE):
            try:
                with open(AUDIO_SELECTION_FILE, 'r', encoding='utf-8') as f:
                    path = json.load(f).get("path")
                    if path and os.path.exists(path): audio_path = path
            except Exception as e: print(f"LocalImageGallery: Error processing audio selection: {e}")
        return (image_tensor, video_path, audio_path, info_string,)

prompt_server = server.PromptServer.instance

@prompt_server.routes.post("/local_image_gallery/set_image_path")
async def set_local_image_path(request):
    try:
        data = await request.json()
        path, media_type = data.get("path"), data.get("type", "image")
        if not path or not os.path.isabs(path) or not os.path.exists(path):
             return web.json_response({"status": "error", "message": "Invalid path."}, status=400)
        target_file = None
        if media_type == 'image':
            target_file = IMAGE_SELECTION_FILE
            try:
                with Image.open(path) as img:
                    info = {"filename": os.path.basename(path), "width": img.width, "height": img.height, "mode": img.mode, "format": img.format}
                    metadata = {}
                    if 'parameters' in img.info: metadata['parameters'] = img.info['parameters']
                    if 'prompt' in img.info:
                        try: metadata['prompt'] = json.loads(img.info['prompt'])
                        except: metadata['prompt'] = img.info['prompt']
                    if 'workflow' in img.info:
                        try: metadata['workflow'] = json.loads(img.info['workflow'])
                        except: metadata['workflow'] = img.info['workflow']
                    for key, value in img.info.items():
                        if isinstance(value, str) and key not in ['parameters', 'prompt', 'workflow']: metadata[key] = value
                    if metadata: info['metadata'] = metadata
                    data['info'] = info
            except Exception as e:
                print(f"LocalImageGallery: Could not read image info for {path}: {e}")
                data['info'] = {"filename": os.path.basename(path)}
        elif media_type == 'video': target_file = VIDEO_SELECTION_FILE
        elif media_type == 'audio': target_file = AUDIO_SELECTION_FILE
        else: return web.json_response({"status": "error", "message": "Invalid media type."}, status=400)
        with open(target_file, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=4, ensure_ascii=False)
        return web.json_response({"status": "ok"})
    except Exception as e: return web.json_response({"status": "error", "message": str(e)}, status=500)

@prompt_server.routes.post("/local_image_gallery/update_metadata")
async def update_metadata(request):
    try:
        data = await request.json()
        path, rating, tags = data.get("path"), data.get("rating"), data.get("tags")
        if not path or not os.path.isabs(path): return web.json_response({"status": "error", "message": "Invalid path."}, status=400)
        metadata = load_metadata()
        if path not in metadata: metadata[path] = {}
        if rating is not None: metadata[path]['rating'] = int(rating)
        if tags is not None: metadata[path]['tags'] = [str(tag).strip() for tag in tags if str(tag).strip()]
        save_metadata(metadata)
        return web.json_response({"status": "ok", "message": "Metadata updated"})
    except Exception as e: return web.json_response({"status": "error", "message": str(e)}, status=500)


@prompt_server.routes.get("/local_image_gallery/images")
async def get_local_images(request):
    directory = request.query.get('directory', '')
    search_mode = request.query.get('search_mode', 'local')
    
    if search_mode == 'local':
        if not directory or not os.path.isdir(directory): 
            return web.json_response({"error": "Directory not found."}, status=404)
        config = load_config()
        config['last_path'] = directory
        save_config(config)

    show_videos = request.query.get('show_videos', 'false').lower() == 'true'
    show_audio = request.query.get('show_audio', 'false').lower() == 'true'
    filter_tag = request.query.get('filter_tag', '').strip().lower()
    
    page = int(request.query.get('page', 1)); per_page = int(request.query.get('per_page', 50))
    sort_by = request.query.get('sort_by', 'name'); sort_order = request.query.get('sort_order', 'asc')
    
    metadata = load_metadata()
    all_items_with_meta = []

    try:
        if search_mode == 'global' and filter_tag:
            for path, meta in metadata.items():
                if os.path.exists(path):
                    tags = [t.lower() for t in meta.get('tags', [])]
                    if filter_tag in tags:
                        ext = os.path.splitext(path)[1].lower()
                        item_type = ''
                        if ext in SUPPORTED_IMAGE_EXTENSIONS: item_type = 'image'
                        elif show_videos and ext in SUPPORTED_VIDEO_EXTENSIONS: item_type = 'video'
                        elif show_audio and ext in SUPPORTED_AUDIO_EXTENSIONS: item_type = 'audio'
                        
                        if item_type:
                            try:
                                stats = os.stat(path)
                                all_items_with_meta.append({
                                    'path': path, 'name': os.path.basename(path), 'type': item_type,
                                    'mtime': stats.st_mtime, 'rating': meta.get('rating', 0), 'tags': meta.get('tags', [])
                                })
                            except: continue
        else:
            for item in os.listdir(directory):
                full_path = os.path.join(directory, item)
                try:
                    stats = os.stat(full_path)
                    item_meta = metadata.get(full_path, {})
                    rating = item_meta.get('rating', 0)
                    tags = [t.lower() for t in item_meta.get('tags', [])]
                    if filter_tag and filter_tag not in tags: continue
                    item_data = {'path': full_path, 'name': item, 'mtime': stats.st_mtime, 'rating': rating, 'tags': item_meta.get('tags', [])}
                    if os.path.isdir(full_path):
                        all_items_with_meta.append({**item_data, 'type': 'dir'})
                    else:
                        ext = os.path.splitext(item)[1].lower()
                        item_type = ''
                        if ext in SUPPORTED_IMAGE_EXTENSIONS: item_type = 'image'
                        elif show_videos and ext in SUPPORTED_VIDEO_EXTENSIONS: item_type = 'video'
                        elif show_audio and ext in SUPPORTED_AUDIO_EXTENSIONS: item_type = 'audio'
                        if item_type: all_items_with_meta.append({**item_data, 'type': item_type})
                except (PermissionError, FileNotFoundError): continue
        
        reverse_order = sort_order == 'desc'
        if sort_by == 'date': all_items_with_meta.sort(key=lambda x: x['mtime'], reverse=reverse_order)
        elif sort_by == 'rating': all_items_with_meta.sort(key=lambda x: x.get('rating', 0), reverse=reverse_order)
        else: all_items_with_meta.sort(key=lambda x: x['name'].lower(), reverse=reverse_order)
        
        if search_mode != 'global':
            all_items_with_meta.sort(key=lambda x: x['type'] != 'dir')
        
        parent_directory = os.path.dirname(directory) if search_mode != 'global' else None
        if parent_directory == directory: parent_directory = None
        
        start = (page - 1) * per_page; end = start + per_page
        paginated_items = all_items_with_meta[start:end]
        
        return web.json_response({
            "items": paginated_items, "total_pages": (len(all_items_with_meta) + per_page - 1) // per_page,
            "current_page": page, "current_directory": directory, "parent_directory": parent_directory,
            "is_global_search": search_mode == 'global' and filter_tag
        })
    except Exception as e: return web.json_response({"error": str(e)}, status=500)

@prompt_server.routes.get("/local_image_gallery/get_last_path")
async def get_last_path(request):
    return web.json_response({"last_path": load_config().get("last_path", "")})
@prompt_server.routes.get("/local_image_gallery/thumbnail")
async def get_thumbnail(request):
    filepath = request.query.get('filepath')
    if not filepath or ".." in filepath: return web.Response(status=400)
    filepath = urllib.parse.unquote(filepath)
    if not os.path.exists(filepath): return web.Response(status=404)
    try:
        img = Image.open(filepath)
        has_alpha = img.mode == 'RGBA' or (img.mode == 'P' and 'transparency' in img.info)
        img = img.convert("RGBA") if has_alpha else img.convert("RGB")
        img.thumbnail([320, 320], Image.LANCZOS)
        buffer = io.BytesIO()
        format, content_type = ('PNG', 'image/png') if has_alpha else ('JPEG', 'image/jpeg')
        img.save(buffer, format=format, quality=90 if format == 'JPEG' else None)
        buffer.seek(0)
        return web.Response(body=buffer.read(), content_type=content_type)
    except Exception as e:
        print(f"LocalImageGallery: Error generating thumbnail for {filepath}: {e}")
        return web.Response(status=500)
@prompt_server.routes.get("/local_image_gallery/view")
async def view_image(request):
    filepath = request.query.get('filepath')
    if not filepath or ".." in filepath: return web.Response(status=400)
    filepath = urllib.parse.unquote(filepath)
    if not os.path.exists(filepath): return web.Response(status=404)
    try: return web.FileResponse(filepath)
    except: return web.Response(status=500)

NODE_CLASS_MAPPINGS = {"LocalImageGalleryNode": LocalImageGalleryNode}
NODE_DISPLAY_NAME_MAPPINGS = {"LocalImageGalleryNode": "Local Media Manager"}
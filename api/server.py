"""
NewsPiston Content API
Openclaw pushes content here instead of editing git files.

Endpoints:
  GET  /api/content/<date>                  - Get day's digest
  PUT  /api/content/<date>                  - Replace entire digest
  POST /api/content/<date>                  - Update summary/highlights + merge sections
  POST /api/content/<date>/<section>        - Append items to a section
  GET  /api/content/dates                   - List available dates
  POST /api/reload                          - Copy API content to nginx volume

Auth: X-API-Key header
"""

from flask import Flask, request, jsonify
import json
import os
import shutil
import glob

app = Flask(__name__)

CONTENT_DIR = '/data/content'
NGINX_CONTENT_DIR = '/usr/share/nginx/html/content'
API_KEY = os.environ.get('API_KEY', 'piston-default-key')

VALID_SECTIONS = [
    'tech_research', 'events', 'business_opportunities',
    'research_montreal', 'highlights'
]


def require_api_key(f):
    from functools import wraps
    @wraps(f)
    def decorated(*args, **kwargs):
        key = request.headers.get('X-API-Key')
        if key != API_KEY:
            return jsonify({'error': 'unauthorized'}), 401
        return f(*args, **kwargs)
    return decorated


def read_digest(date):
    path = os.path.join(CONTENT_DIR, f'{date}.json')
    if os.path.exists(path):
        with open(path) as f:
            return json.load(f)
    return None


def write_digest(date, data):
    os.makedirs(CONTENT_DIR, exist_ok=True)
    path = os.path.join(CONTENT_DIR, f'{date}.json')
    with open(path, 'w') as f:
        json.dump(data, f, indent=2)
    sync_to_nginx(date)


def sync_to_nginx(date=None):
    """Copy content files to nginx serving directory."""
    os.makedirs(NGINX_CONTENT_DIR, exist_ok=True)
    if date:
        src = os.path.join(CONTENT_DIR, f'{date}.json')
        if os.path.exists(src):
            shutil.copy2(src, os.path.join(NGINX_CONTENT_DIR, f'{date}.json'))
    # Always sync archive
    update_archive()


def update_archive():
    """Rebuild archive.json from available date files."""
    dates = []
    for f in glob.glob(os.path.join(CONTENT_DIR, '????-??-??.json')):
        date = os.path.basename(f).replace('.json', '')
        try:
            with open(f) as fh:
                data = json.load(fh)
            total = sum(len(data.get(s, [])) for s in VALID_SECTIONS)
            dates.append({'date': date, 'count': total})
        except (json.JSONDecodeError, IOError):
            pass

    dates.sort(key=lambda x: x['date'], reverse=True)
    archive_path = os.path.join(NGINX_CONTENT_DIR, 'archive.json')
    with open(archive_path, 'w') as f:
        json.dump(dates, f, indent=2)


@app.route('/api/content/dates', methods=['GET'])
@require_api_key
def list_dates():
    files = glob.glob(os.path.join(CONTENT_DIR, '????-??-??.json'))
    dates = sorted([os.path.basename(f).replace('.json', '') for f in files], reverse=True)
    return jsonify(dates)


@app.route('/api/content/<date>', methods=['GET'])
@require_api_key
def get_digest(date):
    digest = read_digest(date)
    if not digest:
        return jsonify({'error': 'not found'}), 404
    return jsonify(digest)


@app.route('/api/content/<date>', methods=['PUT'])
@require_api_key
def replace_digest(date):
    """Replace entire digest for a date."""
    data = request.get_json()
    if not data:
        return jsonify({'error': 'invalid JSON'}), 400
    data['date'] = date
    write_digest(date, data)
    return jsonify({'status': 'ok', 'date': date})


@app.route('/api/content/<date>', methods=['POST'])
@require_api_key
def update_digest(date):
    """Merge into existing digest. Updates summary/highlights, appends to sections."""
    data = request.get_json()
    if not data:
        return jsonify({'error': 'invalid JSON'}), 400

    digest = read_digest(date) or {'date': date}

    # Update top-level fields
    if 'summary' in data:
        digest['summary'] = data['summary']

    # Merge sections (append, don't replace)
    for section in VALID_SECTIONS:
        if section in data:
            existing = digest.get(section, [])
            new_items = data[section] if isinstance(data[section], list) else [data[section]]
            existing.extend(new_items)
            digest[section] = existing

    write_digest(date, digest)
    counts = {s: len(digest.get(s, [])) for s in VALID_SECTIONS}
    return jsonify({'status': 'ok', 'date': date, 'counts': counts})


@app.route('/api/content/<date>/<section>', methods=['POST'])
@require_api_key
def append_to_section(date, section):
    """Append items to a specific section."""
    if section not in VALID_SECTIONS:
        return jsonify({'error': f'invalid section, must be one of: {VALID_SECTIONS}'}), 400

    items = request.get_json()
    if not items:
        return jsonify({'error': 'invalid JSON'}), 400
    if not isinstance(items, list):
        items = [items]

    digest = read_digest(date) or {'date': date, 'summary': ''}
    digest.setdefault(section, []).extend(items)
    write_digest(date, digest)

    return jsonify({
        'status': 'ok',
        'section': section,
        'added': len(items),
        'total': len(digest[section])
    })


@app.route('/api/content/<date>/<section>', methods=['DELETE'])
@require_api_key
def clear_section(date, section):
    """Clear all items from a section."""
    if section not in VALID_SECTIONS:
        return jsonify({'error': f'invalid section'}), 400

    digest = read_digest(date)
    if not digest:
        return jsonify({'error': 'not found'}), 404

    digest[section] = []
    write_digest(date, digest)
    return jsonify({'status': 'ok', 'section': section, 'cleared': True})


@app.route('/api/reload', methods=['POST'])
@require_api_key
def reload_all():
    """Sync all content files to nginx."""
    for f in glob.glob(os.path.join(CONTENT_DIR, '*.json')):
        fname = os.path.basename(f)
        shutil.copy2(f, os.path.join(NGINX_CONTENT_DIR, fname))
    update_archive()
    return jsonify({'status': 'ok'})


if __name__ == '__main__':
    os.makedirs(CONTENT_DIR, exist_ok=True)
    # On startup, sync any existing content
    if os.path.exists(NGINX_CONTENT_DIR):
        for f in glob.glob(os.path.join(NGINX_CONTENT_DIR, '*.json')):
            dest = os.path.join(CONTENT_DIR, os.path.basename(f))
            if not os.path.exists(dest):
                shutil.copy2(f, dest)
    app.run(host='0.0.0.0', port=5000)

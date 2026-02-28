import os, re

src_dir = r"z:\projects\Project-77\frontend\src"

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    orig = content

    # 1. Colors
    content = re.sub(r'(?i)#94A3B8', '#B8C5D6', content)
    content = re.sub(r'(?i)#64748B', '#8899AA', content)

    # 2. RGBA Surface & Borders (do 0.06 first to avoid double replacement)
    content = re.sub(r'rgba\(\s*255\s*,\s*255\s*,\s*255\s*,\s*0?\.06\s*\)', 'rgba(255, 255, 255, 0.12)', content)
    content = re.sub(r'rgba\(\s*255\s*,\s*255\s*,\s*255\s*,\s*0?\.05\s*\)', 'rgba(255, 255, 255, 0.10)', content)
    content = re.sub(r'rgba\(\s*255\s*,\s*255\s*,\s*255\s*,\s*0?\.04\s*\)', 'rgba(255, 255, 255, 0.06)', content)
    
    # Also handle combinations like .06 without leading zero
    content = re.sub(r'rgba\(\s*255\s*,\s*255\s*,\s*255\s*,\s*\.06\s*\)', 'rgba(255, 255, 255, 0.12)', content)
    content = re.sub(r'rgba\(\s*255\s*,\s*255\s*,\s*255\s*,\s*\.04\s*\)', 'rgba(255, 255, 255, 0.06)', content)

    # 3. India Map Borders
    if 'IndiaMap.jsx' in filepath or 'IndiaMap.css' in filepath or 'HomePage.jsx' in filepath:
        content = re.sub(r'opacity=\{?0?\.6\}?', 'opacity={0.9}', content)
        content = re.sub(r'strokeWidth=[\"\']?1(?:px)?[\"\']?', 'strokeWidth="1.8"', content)
        content = re.sub(r'stroke-width:\s*1px', 'stroke-width: 1.8px', content)
        content = re.sub(r'opacity:\s*0?\.6([^0-9])', r'opacity: 0.9\1', content)

    # 4. Font Sizes (bump anything below 0.78rem to 0.78rem)
    def font_repl(m):
        val_str = m.group(1)
        val = float(val_str)
        if val < 0.78:
            return 'font-size: 0.78rem'
        return m.group(0)
    content = re.sub(r'font-size:\s*(0\.[0-9]+)rem', font_repl, content)

    # Also handle inline react style font sizes ( fontSize: '0.62rem' )
    def react_font_repl(m):
        val_str = m.group(1)
        val = float(val_str)
        if val < 0.78:
            return "fontSize: '0.78rem'"
        return m.group(0)
    content = re.sub(r'fontSize:\s*[\'\"](0\.[0-9]+)rem[\'\"]', react_font_repl, content)

    # 5. Glow Filters (+30% radius)
    def shadow_repl(m):
        # matches: box-shadow: 0 0 20px ...
        # we will just blindly bump all px values in box shadow for simplicity by 30%
        # actually a safer way is just to regex replace `(\d+)px` inside the box-shadow declaration.
        return m.group(0) # handled below globally

    def px_bump(m):
        px = int(m.group(1))
        return f"{int(px * 1.3)}px"
        
    def box_shadow_line(m):
        line = m.group(0)
        # multiply all px by 1.3
        new_line = re.sub(r'(\d+)px', px_bump, line)
        return new_line
        
    content = re.sub(r'box-shadow:[^;]+;', box_shadow_line, content)

    # 6. Dots (find width/height of known dot classes and bump by 20%)
    if '.css' in filepath:
        dot_classes = ['it-th-dot', 'it-pr-dot', 'it-za-pulse', 'ticker-badge-dot', 'it-live-dot', 'it-cmd-dot-v', 'it-cmd-dot-g', 'it-ss-dot']
        for cls in dot_classes:
            # find block
            pattern = r'(\.' + cls + r'\s*\{[^}]+\})'
            def dot_bump(m):
                block = m.group(1)
                def bump20(m_px):
                    return f"{int(int(m_px.group(1)) * 1.2)}px"
                block = re.sub(r'(\d+)px', bump20, block)
                return block
            content = re.sub(pattern, dot_bump, content)

    if orig != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f'Updated {filepath}')

for root, dirs, files in os.walk(src_dir):
    for file in files:
        if file.endswith('.css') or file.endswith('.jsx'):
            process_file(os.path.join(root, file))
print('Processing complete.')

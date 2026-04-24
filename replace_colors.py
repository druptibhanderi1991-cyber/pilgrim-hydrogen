import os

def replace_colors(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original = content
    
    # Special case for stars in product.$id.jsx
    if 'product.$id.jsx' in filepath:
        content = content.replace('fill="#00b0b9" color="#00b0b9"', 'fill="#F5B041" color="#F5B041"')
        
    # Global replacements
    # #00b0b9 -> #2E7D32
    content = content.replace('#00b0b9', '#2E7D32')
    content = content.replace('#00B0B9', '#2E7D32')
    
    # #007a82 -> #2E7D32
    content = content.replace('#007a82', '#2E7D32')
    content = content.replace('#007A82', '#2E7D32')
    
    # #f2fafa -> #EAF4F1
    content = content.replace('#f2fafa', '#EAF4F1')
    content = content.replace('#F2FAFA', '#EAF4F1')

    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f'Updated {filepath}')

for root, dirs, files in os.walk('app'):
    for file in files:
        if file.endswith('.css') or file.endswith('.jsx'):
            replace_colors(os.path.join(root, file))

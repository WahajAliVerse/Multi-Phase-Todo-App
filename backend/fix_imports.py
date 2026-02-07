import os
import re

def fix_backend_src_imports(directory):
    """Fix all imports that use 'from backend.src' pattern to use relative imports"""
    
    # Walk through all Python files in the directory
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith('.py'):
                filepath = os.path.join(root, file)
                
                # Read the file
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                # Find and replace 'from backend.src' imports with relative imports
                # This regex finds patterns like 'from backend.src.module.submodule import ...'
                # and replaces them with relative imports based on directory structure
                original_content = content
                
                # Define a function to replace matches
                def replace_match(match):
                    full_match = match.group(0)
                    # Extract the module path after 'backend.src.'
                    module_path = match.group(1)
                    
                    # Determine how many levels up we need to go based on current directory depth
                    rel_path = os.path.relpath(root, directory)
                    if rel_path == '.':
                        levels_up = 0
                    else:
                        levels_up = len(rel_path.split(os.sep))
                    
                    # Build relative import path
                    dots = '..' + ('.' * levels_up) if levels_up > 0 else '.'
                    relative_import = f'from {dots}{module_path}'
                    
                    return relative_import
                
                # Pattern to match 'from backend.src...' imports
                pattern = r'from backend\.src\.([a-zA-Z0-9_\.]+)'
                content = re.sub(pattern, replace_match, content)
                
                # Also handle 'import backend.src...' patterns
                pattern_import = r'import backend\.src\.([a-zA-Z0-9_\.]+)'
                content = re.sub(pattern_import, lambda m: f'from .{m.group(1)} import', content)
                
                # Write the file back if it was changed
                if content != original_content:
                    with open(filepath, 'w', encoding='utf-8') as f:
                        f.write(content)
                    print(f"Fixed imports in: {filepath}")

# Run the function on the src directory
if __name__ == "__main__":
    src_dir = "/home/wahaj-ali/Desktop/multi-phase-todo/backend/src"
    fix_backend_src_imports(src_dir)
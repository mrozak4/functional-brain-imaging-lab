# verify_site.py
import os
import re
import json
from html.parser import HTMLParser

class LinkParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.links = []
        self.stylesheets = []
        self.scripts = []
        self.images = []

    def handle_starttag(self, tag, attrs):
        attrs_dict = dict(attrs)
        if tag == 'a' and 'href' in attrs_dict:
            self.links.append(attrs_dict['href'])
        elif tag == 'link' and 'href' in attrs_dict:
            self.stylesheets.append(attrs_dict['href'])
        elif tag == 'script' and 'src' in attrs_dict:
            self.scripts.append(attrs_dict['src'])
        elif tag == 'img' and 'src' in attrs_dict:
            self.images.append(attrs_dict['src'])

def verify():
    print("=== STARTING WEBSITE VERIFICATION ===")
    
    root_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Files to verify
    en_pages = {
        'index.html', 'people.html', 'research.html', 'publications.html',
        'facilities.html', 'news.html', 'toronto.html', 'joinus.html', 'conferences.html'
    }
    
    fr_pages = {
        'fr/index.html', 'fr/equipe.html', 'fr/recherche.html', 'fr/publications.html',
        'fr/installations.html', 'fr/nouvelles.html', 'fr/toronto.html', 'fr/joignez-vous.html', 'fr/conferences.html'
    }
    
    all_pages = en_pages.union(fr_pages)
    
    errors = []
    warnings = []
    
    # Verify if files exist
    for page in all_pages:
        path = os.path.join(root_dir, page)
        if not os.path.exists(path):
            errors.append(f"Missing page file: {page} (expected at {path})")
            continue
            
        print(f"Checking {page}...")
        
        with open(path, 'r', encoding='utf-8') as f:
            html = f.read()
            
        parser = LinkParser()
        parser.feed(html)
        
        # Check all links (a href)
        for href in parser.links:
            if not href or href == '#' or href.startswith('http') or href.startswith('mailto:') or href.startswith('tel:'):
                continue
            
            # Resolve relative link
            page_dir = os.path.dirname(path)
            target_path = os.path.normpath(os.path.join(page_dir, href))
            
            if not os.path.exists(target_path):
                errors.append(f"Broken link in {page}: href='{href}' (resolved to {target_path} - not found)")
        
        # Check all resources (link href, script src, img src)
        for href in parser.stylesheets:
            if not href or href.startswith('http'):
                continue
            
            page_dir = os.path.dirname(path)
            target_path = os.path.normpath(os.path.join(page_dir, href))
            if not os.path.exists(target_path):
                errors.append(f"Missing style/asset in {page}: href='{href}' (resolved to {target_path})")

        for src in parser.scripts:
            if not src or src.startswith('http'):
                continue
            
            page_dir = os.path.dirname(path)
            target_path = os.path.normpath(os.path.join(page_dir, src))
            if not os.path.exists(target_path):
                errors.append(f"Missing script in {page}: src='{src}' (resolved to {target_path})")
                
        for src in parser.images:
            if not src or src.startswith('http') or src.startswith('data:'):
                continue
            
            page_dir = os.path.dirname(path)
            target_path = os.path.normpath(os.path.join(page_dir, src))
            if not os.path.exists(target_path):
                warnings.append(f"Missing image in {page}: src='{src}' (resolved to {target_path})")
                
    # Verify JSON database files
    json_databases = [
        'data/people.json',
        'data/publications.json',
        'data/news.json',
        'data/i18n/en.json',
        'data/i18n/fr.json'
    ]
    for db in json_databases:
        path = os.path.join(root_dir, db)
        if not os.path.exists(path):
            errors.append(f"Missing database file: {db}")
        else:
            try:
                with open(path, 'r', encoding='utf-8') as f:
                    json.load(f)
                print(f"Validated JSON file: {db}")
            except Exception as e:
                errors.append(f"Malformed JSON file: {db} (error: {e})")
                
    print("\n=== VERIFICATION SUMMARY ===")
    print(f"Errors found: {len(errors)}")
    for err in errors:
        print(f" - [ERROR] {err}")
    print(f"Warnings found: {len(warnings)}")
    for warn in warnings:
        print(f" - [WARN] {warn}")
        
    if len(errors) == 0:
        print("\nSUCCESS: All page links and assets are fully consistent!")
    else:
        print("\nFAILURE: Broken links or missing assets detected.")
        
if __name__ == '__main__':
    verify()

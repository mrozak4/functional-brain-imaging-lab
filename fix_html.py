import os
import re

html_files = [f for f in os.listdir('.') if f.endswith('.html')]

# We need to add js/i18n.js to all HTML pages
script_tags = {
    'people.html': '<script src="js/people.js"></script>',
    'publications.html': '<script src="js/publications.js"></script>',
    # Add other scripts if needed
}

for file in html_files:
    with open(file, 'r') as f:
        content = f.read()

    # Add i18n script and specific scripts before </body> if not there
    if 'js/i18n.js' not in content:
        insert_str = '<script src="js/i18n.js"></script>\n'
        if file in script_tags:
            insert_str += script_tags[file] + '\n'
        
        content = content.replace('</body>', f'{insert_str}</body>')

    with open(file, 'w') as f:
        f.write(content)

    # Now create the French version in fr/
    fr_name_map = {
        'people.html': 'equipe.html',
        'research.html': 'recherche.html',
        'publications.html': 'publications.html',
        'facilities.html': 'installations.html',
        'news.html': 'nouvelles.html',
        'joinus.html': 'joignez-vous.html',
        'index.html': 'index.html'
    }
    
    fr_file = fr_name_map.get(file)
    if fr_file:
        fr_path = os.path.join('fr', fr_file)
        
        # Replace paths for css, js, images, data
        fr_content = content.replace('href="css/', 'href="../css/')
        fr_content = fr_content.replace('src="js/', 'src="../js/')
        fr_content = fr_content.replace('src="images/', 'src="../images/')
        
        # Change lang toggle
        fr_content = fr_content.replace('lang="en"', 'lang="fr-CA"')
        fr_content = fr_content.replace('href="fr/', 'href="../fr/')  # In case
        fr_content = fr_content.replace('class="lang-toggle">FR</a>', 'class="lang-toggle">EN</a>')
        # Fix the English toggle link
        en_link = f'href="../{file}"'
        fr_content = re.sub(r'href=".*?"\s+class="lang-toggle"', f'{en_link} class="lang-toggle"', fr_content)
        
        # Write to fr directory
        with open(fr_path, 'w') as f:
            f.write(fr_content)

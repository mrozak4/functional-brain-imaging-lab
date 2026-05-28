#!/usr/bin/env python3
import urllib.request
import urllib.parse
import json
import xml.etree.ElementTree as ET
import os
from time import sleep

# Search query based on the implementation plan
SEARCH_QUERY = '"Stefanovic B"[Author] AND ("Sunnybrook" OR "University of Toronto") AND ("2019/01/01"[Date - Publication] : "3000"[Date - Publication])'
BASE_ESEARCH = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi'
BASE_EFETCH = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi'
DATA_FILE = 'data/publications.json'

def search_pubmed(query):
    params = {
        'db': 'pubmed',
        'term': query,
        'retmode': 'json',
        'retmax': 100
    }
    url = f"{BASE_ESEARCH}?{urllib.parse.urlencode(params)}"
    response = urllib.request.urlopen(url)
    data = json.loads(response.read())
    return data['esearchresult']['idlist']

def fetch_details(id_list):
    if not id_list:
        return []
        
    params = {
        'db': 'pubmed',
        'id': ','.join(id_list),
        'retmode': 'xml'
    }
    url = f"{BASE_EFETCH}?{urllib.parse.urlencode(params)}"
    response = urllib.request.urlopen(url)
    xml_data = response.read()
    
    root = ET.fromstring(xml_data)
    publications = []
    
    for article in root.findall('.//PubmedArticle'):
        pmid = article.findtext('.//PMID')
        title = article.findtext('.//ArticleTitle')
        
        # Authors
        authors = []
        author_list = article.findall('.//AuthorList/Author')
        for author in author_list:
            last_name = author.findtext('LastName')
            initials = author.findtext('Initials')
            if last_name and initials:
                authors.append(f"{last_name} {initials}")
            elif last_name:
                authors.append(last_name)
                
        # Journal and Year
        journal = article.findtext('.//Journal/Title')
        year = article.findtext('.//Journal/JournalIssue/PubDate/Year')
        if not year:
             year = article.findtext('.//PubDate/Year') # Fallback
             
        # DOI
        doi = None
        elocation_ids = article.findall('.//ELocationID')
        for eloc in elocation_ids:
            if eloc.get('EIdType') == 'doi':
                doi = eloc.text
                break
                
        if not doi:
            article_ids = article.findall('.//ArticleId')
            for aid in article_ids:
                if aid.get('IdType') == 'doi':
                    doi = aid.text
                    break
                    
        # Abstract
        abstract = ''
        abstract_texts = article.findall('.//AbstractText')
        if abstract_texts:
            abstract = ' '.join([t.text for t in abstract_texts if t.text])
            
        pub = {
            'title': title,
            'authors': authors,
            'journal': journal,
            'year': int(year) if year and year.isdigit() else None,
            'pmid': pmid,
            'doi': doi,
            'abstract': abstract,
            'featured': False,
            'topics': []
        }
        publications.append(pub)
        
    return publications

def main():
    print(f"Searching PubMed with query: {SEARCH_QUERY}")
    id_list = search_pubmed(SEARCH_QUERY)
    print(f"Found {len(id_list)} publications.")
    
    new_pubs = fetch_details(id_list)
    
    # Load existing to preserve 'featured' and 'topics'
    existing_pubs = []
    if os.path.exists(DATA_FILE):
        try:
            with open(DATA_FILE, 'r', encoding='utf-8') as f:
                existing_pubs = json.load(f)
        except Exception as e:
            print(f"Warning: Could not read existing {DATA_FILE}: {e}")
            
    # Merge
    existing_dict = {p.get('pmid'): p for p in existing_pubs if p.get('pmid')}
    
    for pub in new_pubs:
        pmid = pub['pmid']
        if pmid in existing_dict:
            # Preserve manual flags
            pub['featured'] = existing_dict[pmid].get('featured', False)
            pub['topics'] = existing_dict[pmid].get('topics', [])
        
    # Add any manual pubs that don't have a PMID or aren't in the search results
    new_pmids = set([p['pmid'] for p in new_pubs])
    for pub in existing_pubs:
        pmid = pub.get('pmid')
        if not pmid or pmid not in new_pmids:
            new_pubs.append(pub)
            
    # Sort by year descending
    new_pubs.sort(key=lambda x: (x.get('year') or 0), reverse=True)
    
    os.makedirs(os.path.dirname(DATA_FILE), exist_ok=True)
    with open(DATA_FILE, 'w', encoding='utf-8') as f:
        json.dump(new_pubs, f, indent=2, ensure_ascii=False)
        
    print(f"Successfully saved {len(new_pubs)} publications to {DATA_FILE}")

if __name__ == '__main__':
    main()

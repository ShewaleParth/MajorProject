import zipfile
import xml.etree.ElementTree as ET
import sys
import codecs

def extract(path):
    z = zipfile.ZipFile(path)
    xml_content = z.read('word/document.xml')
    root = ET.fromstring(xml_content)
    ns = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
    text = '\n'.join(''.join(node.itertext()) for node in root.findall('.//w:p', ns))
    with codecs.open('output.txt', 'w', 'utf-8') as f:
        f.write(text)

extract(sys.argv[1])

#!/usr/bin/env python3
"""
Ndërton bug017.html (në dosjen lab/) = index.html publik (kopja e anonimizuar e prodhimit) + blloku vëzhgues src/lab-observer.js.

    python3 lab/src/build.py [rruga e index.html publik]   (parazgjedhje: ~/Desktop/CV-review-public/index.html)

Kontrolle:
  - blloku futet vetëm një herë, para `</body></html>` të fundit;
  - heqja e bllokut jep bit për bit skedarin publik (pra asgjë tjetër nuk ndryshon);
  - shkruan BUILD.json me md5-të (burimi publik, vëzhguesi, rezultati) dhe ndërtimin.
Asgjë nga ky dosje nuk shkruhet te ProjectS.
"""
import hashlib, json, os, re, sys

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))   # = dosja lab/
SRC = sys.argv[1] if len(sys.argv) > 1 else os.path.expanduser('~/Desktop/CV-review-public/index.html')
OBS = os.path.join(HERE, 'src', 'lab-observer.js')
OUT = os.path.join(HERE, 'bug017.html')
MARK_OPEN = '<script>/* LAB-OBSERVER:BEGIN */\n'
MARK_CLOSE = '\n/* LAB-OBSERVER:END */</script>\n'


def md5(b):
    return hashlib.md5(b).hexdigest()


pub = open(SRC, 'rb').read()
obs = open(OBS, 'rb').read()
text = pub.decode('utf-8')
tail = '</body></html>'
i = text.rfind(tail)
assert i > 0 and text[i:].strip() == tail, 'unexpected end of the public file'
block = MARK_OPEN + obs.decode('utf-8') + MARK_CLOSE
lab = text[:i] + block + text[i:]
assert lab.count('LAB-OBSERVER:BEGIN') == 1
# kthimi pas: pa bllokun, skedari duhet të jetë identik me atë publik
assert lab.replace(block, '', 1).encode('utf-8') == pub, 'lab minus block != public file'
build = re.search(r"window\.CV\.build='([^']+)'", text).group(1)
os.makedirs(os.path.dirname(OUT), exist_ok=True)
open(OUT, 'w', encoding='utf-8').write(lab)
info = {'build': build, 'public_index_md5': md5(pub), 'observer_md5': md5(obs),
        'bug017_html_md5': md5(lab.encode('utf-8')), 'rule': 'bug017.html = public index.html + one observer block; nothing else differs'}
json.dump(info, open(os.path.join(HERE, 'BUILD.json'), 'w', encoding='utf-8'), indent=1)
print(json.dumps(info, indent=1))

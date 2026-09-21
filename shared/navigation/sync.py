"""Copy the standalone navigation into each deployable project (no shared hosting dependency)."""
from pathlib import Path
import re
ROOT=Path(__file__).resolve().parents[2]
SPECS=[('dist/index.html','fly','pong','./','dark'),('dist/brain/index.html','fly','fly','./','dark'),('projects/ai-flip-photo/dist/index.html','flip','flip','./','light'),('projects/sticker-challenge/dist/index.html','sticker','sticker','./','light'),('projects/reward-lab/dist/index.html','reward','reward','./','light'),('projects/reward-lab/dist/workshop.html','reward','workshop','index.html','light')]
for relative,current,page,home,theme in SPECS:
    p=ROOT/relative
    if not p.exists(): continue
    s=p.read_text(encoding='utf8')
    base='../' if page=='fly' else './'
    if 'lab-navigation.mjs' not in s:
        s=s.replace('</head>',f'<link rel="stylesheet" href="{base}lab-navigation.css"><script type="module" src="{base}lab-navigation.mjs"></script></head>')
        match=re.search(r'<header\b[^>]*>.*?</header>',s,re.S)
        h=match.group()
        brand=re.search(r'<a class="brand".*?</a>',h,re.S).group()
        brand=re.sub(r'href="[^"]*"',f'href="{home}"',brand,count=1)
        brand=re.sub(r' aria-label="[^"]*"','',brand)
        brand=brand.replace('<a ', '<a aria-label="当前项目首页" ',1)
        edition=re.search(r'<span class="edition">.*?</span>',h,re.S)
        infos={'pong':'<button id="about" class="quiet">实验说明 ↗</button>', 'fly':'<button id="methods">模型说明 ↗</button>', 'flip':'<a href="#how">实验原理</a>', 'sticker':'<button class="text-button" id="about-open" type="button">关于实验</button>', 'reward':'<a href="#why">实验原理</a>', 'workshop':'<a href="index.html#why">实验原理</a>'}
        repo={'fly':'fruit-fly','flip':'ai-flip-photo','sticker':'sticker-challenge','reward':'reward-lab'}[current]
        info=infos[page].replace('<button ','<button slot="info" ').replace('<a ','<a slot="info" ')
        info+=f'<a slot="info" href="https://github.com/jingsong-wang/{repo}" target="_blank" rel="noreferrer">GitHub 源码 ↗</a>'
        fallback='<a data-fallback href="https://jingsong-wang.github.io/">作者主页 ↗</a>'
        nav=f'<lab-navigation current="{current}" page="{page}" theme="{theme}">{fallback}{info}</lab-navigation>'
        opening=re.sub(r'>$', ' data-lab-header>',re.match(r'<header\b[^>]*>',h).group())
        s=s[:match.start()]+opening+brand+(edition.group() if edition else '')+nav+'</header>'+s[match.end():]
        # Cross-project discovery now belongs to the global switcher. Keep scientific links and local actions.
        s=re.sub(r'<a\b[^>]*>(?:上一个实验：[^<]*|另一个实验：[^<]*|FLYLAB 数字果蝇 ↗|另一个误读：[^<]*|看看上一个实验 ↗|主页 ↗)</a>','',s)
        s=s.replace('href="https://github.com/jingsong-wang" target="_blank" rel="noreferrer">by jingsong-wang ↗','href="https://jingsong-wang.github.io/">by jingsong-wang')
        # A footer brand has the same destination as its header equivalent.
        s=re.sub(r'(<a class="brand" href=")[^"]*(")',lambda m:m[1]+home+m[2],s)
        p.write_text(s,encoding='utf8')
for relative in ['dist','projects/ai-flip-photo/dist','projects/sticker-challenge/dist','projects/reward-lab/dist']:
    if not (ROOT/relative).exists(): continue
    for name in ['lab-navigation.mjs','lab-navigation.css']:
        (ROOT/relative/name).write_bytes((Path(__file__).parent/name).read_bytes())

#!/usr/bin/env python3
"""Build a Figma-vs-live parity report (HTML) from a findings.json file.

Deterministic: same JSON in -> same HTML out. The agent only has to produce
findings.json; this guarantees every report looks identical to the reference design.

Usage:
    python3 build_report.py <findings.json> [--outdir /tmp/ui-match]

findings.json schema:
{
  "page":    "Homepage",                     # human title
  "slug":    "homepage",                      # url-safe id -> <slug>.html
  "figmaUrl":"https://figma.com/design/...",  # clickable "where it lives" links
  "liveUrl": "https://site.com/",
  "missing":  [ {"title","desc","img"} ],     # in Figma, not on site  (img = figma crop)
  "extra":    [ {"title","desc","img"} ],     # on site, not in Figma  (img = site crop)
  "different":[ {"title","desc","figmaImg","siteImg","figmaCaption","siteCaption"} ],
  "matched":  [ "Hero + logos", "FAQ", ... ]  # names only, no images
}
All img paths are RELATIVE to <outdir> (the server root), e.g. "homepage/figma/02-x.png".
"""
import sys, os, json, html, glob

CSS = """
  :root { --bg:#0f1720; --card:#fff; --ink:#111; --mut:#667; --line:#e6e6ea;
          --red:#e5484d; --amber:#d9820b; --green:#2a9d5c; --violet:#7c5cff; }
  * { box-sizing:border-box; }
  body { margin:0; font:15px/1.5 -apple-system,Segoe UI,Roboto,sans-serif; color:var(--ink); background:#f5f5f7; }
  header { background:var(--bg); color:#fff; padding:22px 28px; }
  header h1 { margin:0 0 4px; font-size:20px; }
  header .links a { color:#8ecbff; text-decoration:none; margin-right:16px; font-size:13px; }
  header .ticket { margin-top:10px; font-size:13px; }
  header .ticket a { color:#fff; background:#5e6ad2; padding:5px 12px; border-radius:999px; text-decoration:none; font-weight:600; }
  .idx .tkt { color:#5e6ad2; font-weight:600; font-size:12px; margin-top:6px; }
  .summary { display:flex; gap:12px; flex-wrap:wrap; padding:18px 28px; }
  .pill { padding:8px 14px; border-radius:999px; font-weight:600; font-size:13px; color:#fff; }
  .pill.red{background:var(--red)} .pill.amber{background:var(--amber)}
  .pill.green{background:var(--green)} .pill.violet{background:var(--violet)}
  main { padding:8px 28px 60px; max-width:980px; }
  h2 { font-size:16px; margin:32px 0 4px; display:flex; align-items:center; gap:8px; }
  h2 .dot{width:10px;height:10px;border-radius:50%}
  .sub { color:var(--mut); margin:0 0 14px; font-size:13px; }
  .item { background:var(--card); border:1px solid var(--line); border-radius:12px; overflow:hidden; margin:14px 0; }
  .item .cap { padding:12px 16px; border-bottom:1px solid var(--line); }
  .item .cap b { font-size:15px; } .item .cap span { color:var(--mut); font-size:13px; }
  .item a.view { float:right; font-size:12px; color:#0a6cff; text-decoration:none; }
  .item img { display:block; width:100%; }
  .two { display:grid; grid-template-columns:1fr 1fr; gap:0; }
  .two figure{margin:0;border-right:1px solid var(--line)}
  .two figure:last-child{border-right:none}
  .two figcaption{padding:8px 14px;font-size:12px;color:var(--mut);background:#fafafb;border-bottom:1px solid var(--line)}
  .tag{display:inline-block;font-size:12px;font-weight:800;padding:3px 9px;border-radius:6px;
       color:#fff !important;letter-spacing:.04em;text-transform:uppercase;line-height:1.2}
  .tag.fig{background:#4b2bb5}.tag.site{background:#0b4fb8}
  .idx { max-width:980px; }
  .idx a.card{display:block;text-decoration:none;color:var(--ink);background:var(--card);
      border:1px solid var(--line);border-radius:12px;padding:16px 18px;margin:12px 0;}
  .idx a.card:hover{border-color:#c9c9d2}
  .idx .name{font-size:16px;font-weight:700;margin-bottom:8px}
  .empty{color:var(--mut);padding:0 28px}
"""

def esc(s): return html.escape(str(s or ""))

def pills(c):
    out = []
    if c["missing"]:   out.append(f'<span class="pill red">🔴 {c["missing"]} missing on site</span>')
    if c["extra"]:     out.append(f'<span class="pill amber">🟡 {c["extra"]} extra on site</span>')
    if c["different"]: out.append(f'<span class="pill violet">⚠️ {c["different"]} built differently</span>')
    if c["matched"]:   out.append(f'<span class="pill green">✅ {c["matched"]} matched</span>')
    return "\n  ".join(out)

def single_item(tag_cls, tag_label, it):
    img = esc(it["img"])
    desc = f' <span>— {esc(it["desc"])}</span>' if it.get("desc") else ""
    return f'''<div class="item">
  <div class="cap"><span class="tag {tag_cls}">{tag_label}</span> &nbsp;<b>{esc(it["title"])}</b>{desc}
    <a class="view" href="{img}" target="_blank">open full ↗</a></div>
  <img src="{img}" alt="{esc(it["title"])}">
</div>'''

def diff_item(it):
    desc = f' <span>— {esc(it["desc"])}</span>' if it.get("desc") else ""
    fcap = esc(it.get("figmaCaption","Figma design"))
    scap = esc(it.get("siteCaption","Live site"))
    return f'''<div class="item">
  <div class="cap"><b>{esc(it["title"])}</b>{desc}</div>
  <div class="two">
    <figure><figcaption>{fcap}</figcaption><img src="{esc(it["figmaImg"])}"></figure>
    <figure><figcaption>{scap}</figcaption><img src="{esc(it["siteImg"])}"></figure>
  </div>
</div>'''

def ticket_banner(f):
    url = f.get("ticketUrl")
    if not url:
        return ""
    key = esc(f.get("ticketKey") or "Linear ticket")
    return f'<div class="ticket">🎫 <a href="{esc(url)}" target="_blank">Linear ticket: {key} ↗</a></div>'

def build_report(f, outdir):
    slug = f["slug"]
    counts = {k: len(f.get(k, [])) for k in ("missing","extra","different","matched")}
    parts = []
    parts.append(f'''<!doctype html><html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>{esc(f["page"])} — Figma ↔ Site parity</title><style>{CSS}</style></head><body>
<header>
  <h1>{esc(f["page"])} — component parity: Figma vs live site</h1>
  <div class="links">
    <a href="{esc(f.get("figmaUrl","#"))}" target="_blank">Figma design ↗</a>
    <a href="{esc(f.get("liveUrl","#"))}" target="_blank">Live site ↗</a>
  </div>
  {ticket_banner(f)}
</header>
<div class="summary">
  {pills(counts)}
</div>
<main>''')

    if f.get("missing"):
        parts.append('<h2><span class="dot" style="background:var(--red)"></span>Missing on the live site '
                     '<span style="color:var(--mut);font-weight:400">— in Figma, not built → ticket</span></h2>')
        parts.append('<p class="sub">These components exist in the Figma design but are not on the live page.</p>')
        parts += [single_item("fig","FIGMA",it) for it in f["missing"]]

    if f.get("extra"):
        parts.append('<h2><span class="dot" style="background:var(--amber)"></span>Extra on the live site '
                     '<span style="color:var(--mut);font-weight:400">— live, but not in current Figma → confirm intended</span></h2>')
        parts.append('<p class="sub">These are on the live page but do not appear in the Figma design.</p>')
        parts += [single_item("site","LIVE SITE",it) for it in f["extra"]]

    if f.get("different"):
        parts.append('<h2><span class="dot" style="background:var(--violet)"></span>Matched, but built differently</h2>')
        parts.append('<p class="sub">Present on both — same content, different component. Worth a design decision.</p>')
        parts += [diff_item(it) for it in f["different"]]

    if f.get("matched"):
        parts.append('<h2><span class="dot" style="background:var(--green)"></span>'
                     f'Matched ({counts["matched"]})</h2>')
        parts.append('<p class="sub">' + " · ".join(esc(m) for m in f["matched"]) + '</p>')

    parts.append('</main></body></html>')
    html_path = os.path.join(outdir, f"{slug}.html")
    with open(html_path, "w") as fp:
        fp.write("\n".join(parts))

    meta = {"page": f["page"], "slug": slug, "counts": counts,
            "figmaUrl": f.get("figmaUrl",""), "liveUrl": f.get("liveUrl",""),
            "ticketUrl": f.get("ticketUrl",""), "ticketKey": f.get("ticketKey","")}
    with open(os.path.join(outdir, f"{slug}.meta.json"), "w") as fp:
        json.dump(meta, fp)
    return html_path

def rebuild_index(outdir):
    metas = []
    for mp in sorted(glob.glob(os.path.join(outdir, "*.meta.json"))):
        with open(mp) as fp:
            metas.append(json.load(fp))
    cards = []
    for m in metas:
        tkt = f'<div class="tkt">🎫 {esc(m.get("ticketKey") or "Linear ticket")}</div>' if m.get("ticketUrl") else ""
        cards.append(f'''<a class="card" href="{esc(m["slug"])}.html">
  <div class="name">{esc(m["page"])}</div>
  <div class="summary" style="padding:0">{pills(m["counts"])}</div>
  {tkt}
</a>''')
    body = "\n".join(cards) if cards else '<p class="empty">No pages compared yet.</p>'
    idx = f'''<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>UI-match — parity reports</title><style>{CSS}</style></head><body>
<header><h1>UI-match — Figma ↔ live parity reports</h1></header>
<main class="idx">{body}</main></body></html>'''
    with open(os.path.join(outdir, "index.html"), "w") as fp:
        fp.write(idx)

def main():
    args = [a for a in sys.argv[1:]]
    outdir = "/tmp/ui-match"
    if "--outdir" in args:
        i = args.index("--outdir"); outdir = args[i+1]; del args[i:i+2]
    if not args:
        print("usage: build_report.py <findings.json> [--outdir DIR]"); sys.exit(1)
    os.makedirs(outdir, exist_ok=True)
    with open(args[0]) as fp:
        findings = json.load(fp)
    html_path = build_report(findings, outdir)
    rebuild_index(outdir)
    print(html_path)

if __name__ == "__main__":
    main()

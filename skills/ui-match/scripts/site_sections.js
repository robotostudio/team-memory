// Emit ordered top-level page sections as JSON for cropping.
// Run with: agent-browser eval --stdin < site_sections.js
// Output: [{ "i":0, "top":138, "height":1345, "label":"Your in-house team's..." }, ...]
// Picks the densest top-level container (usually <main>), lists its direct children,
// skips hidden/near-zero-height nodes, and labels each by its first heading (fallback: first text).
(() => {
  const candidates = [document.querySelector('main'), document.body].filter(Boolean);
  let host = candidates[0] || document.body;
  // If <main> has a single wrapper child, descend into it so we get real sections.
  let guard = 0;
  while (host && host.children.length === 1 && guard++ < 4) host = host.children[0];

  const out = [];
  const kids = Array.from(host.children);
  kids.forEach((el, i) => {
    const r = el.getBoundingClientRect();
    const top = Math.round(r.top + window.scrollY);
    const height = Math.round(r.height);
    if (height < 40) return;                       // skip spacers / hidden
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden') return;
    const h = el.querySelector('h1,h2,h3');
    let label = h ? h.innerText : (el.innerText || '');
    label = label.replace(/\s+/g, ' ').trim().slice(0, 60);
    out.push({ i: out.length, top, height, label });
  });
  return JSON.stringify(out);
})();

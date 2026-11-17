/*
  Roboto mark: the highlights for PR videos (design.md → Showing a change → Mark).
  Lines only. Nothing fades, nothing is filled.

    RobotoMark.underline(tl, { in, target, at, out, on, tone })   // a line draws under a word, a number or one line of text
    RobotoMark.box(tl, { in, target, at, out, on, tone, gapX, gapY }) // a square of four lines draws around something a line can't sit under:
                                                                   // a control, an image, a block of several lines, a region

  Options
    in      the positioned panel (a POC, a card, a screenshot panel)
    target  an element, or for a screenshot a box {x, y, w, h} in the panel's own px.
            For underline, an element's text is measured, not its container.
    at/out  seconds on tl. `out` is optional; when omitted the lines stay.
    on      "dark" | "light": the UI under the lines, not the film's theme (default "dark")
    tone    "ink" (default) | "bad" (red, a broken before state) | "good" (green, the fixed after state)
    gapX/Y  box only: free space to the nearest neighbour when it is tight; the padding never exceeds half of it

  Fixed by the helper
    line      2px, solid, sharp
    underline 6px under the text, exactly its width; draws left → right in 0.35s, retracts to the right in 0.25s
    box       12px above/below and 16px left/right of the target, never closer than 14px to the panel's edge;
              draws from the top-left corner both ways at once (top and left, then right and bottom) in 0.5s,
              and retracts the same way in 0.3s
  Deterministic: it measures once when the timeline is built and only adds GSAP tweens.
*/
(function (global) {
  var LINE = 2, GAP = 6, PAD_X = 16, PAD_Y = 12, EDGE = 14;
  var HUE = { bad: "#d6453d", good: "#2e9e6b" };
  function color(o) { return HUE[o.tone] || ((o.on || "dark") === "light" ? "#0a0a0a" : "#fafafa"); }
  function isEl(v) { return v && typeof v.getBoundingClientRect === "function"; }
  function scaleOf(host) { return host.offsetWidth ? host.getBoundingClientRect().width / host.offsetWidth : 1; }
  function boxOf(target, host, text) {
    if (!isEl(target)) return target;
    var e = target.getBoundingClientRect(), t = e, h = host.getBoundingClientRect(), s = scaleOf(host);
    if (text && target.childNodes.length) {   // the text, not its container; clipped to the container (a rolling number shows one row)
      var r = document.createRange(); r.selectNodeContents(target); var c = r.getBoundingClientRect();
      var l = Math.max(c.left, e.left), tp = Math.max(c.top, e.top);
      t = { left: l, top: tp, width: Math.min(c.right, e.right) - l, height: Math.min(c.bottom, e.bottom) - tp };
    }
    return { x: (t.left - h.left) / s, y: (t.top - h.top) / s, w: t.width / s, h: t.height / s };
  }
  function line(host, c, x, y, w, h) {
    var el = document.createElement("div");
    el.setAttribute("data-rm", ""); el.setAttribute("data-layout-ignore", "");
    el.style.cssText = "position:absolute;pointer-events:none;background:" + c + ";left:" + x + "px;top:" + y + "px;width:" + w + "px;height:" + h + "px;";
    host.appendChild(el); return el;
  }
  function hide(tl, el, prop, origin) {
    var v = { transformOrigin: origin }; v[prop] = 0;
    tl.fromTo(el, v, Object.assign({ duration: 0.01 }, v), 0);
  }
  function underline(tl, o) {
    var b = boxOf(o.target, o.in, true);
    var el = line(o.in, color(o), Math.round(b.x), Math.round(b.y + b.h + GAP), Math.round(b.w), LINE);
    hide(tl, el, "scaleX", "left center");
    tl.to(el, { scaleX: 1, duration: 0.35, ease: "power2.inOut" }, o.at);
    if (o.out != null) {
      tl.set(el, { transformOrigin: "right center" }, o.out);
      tl.to(el, { scaleX: 0, duration: 0.25, ease: "power2.in" }, o.out);
    }
    return el;
  }
  function box(tl, o) {
    var host = o.in, b = boxOf(o.target, host, false), px = PAD_X, py = PAD_Y;
    if (o.gapX != null) px = Math.min(px, Math.max(2, Math.floor(o.gapX / 2)));
    if (o.gapY != null) py = Math.min(py, Math.max(2, Math.floor(o.gapY / 2)));
    var x = Math.max(Math.round(b.x - px), EDGE), y = Math.max(Math.round(b.y - py), EDGE);
    var x2 = Math.min(Math.round(b.x + b.w + px), host.offsetWidth - EDGE), y2 = Math.min(Math.round(b.y + b.h + py), host.offsetHeight - EDGE);
    var w = x2 - x, h = y2 - y, c = color(o);
    var top = line(host, c, x, y, w, LINE), left = line(host, c, x, y, LINE, h);
    var right = line(host, c, x2 - LINE, y, LINE, h), bottom = line(host, c, x, y2 - LINE, w, LINE);
    hide(tl, top, "scaleX", "left center"); hide(tl, left, "scaleY", "center top");
    hide(tl, right, "scaleY", "center top"); hide(tl, bottom, "scaleX", "left center");
    // two strokes leave the top-left corner together and meet at the bottom-right
    tl.to(top, { scaleX: 1, duration: 0.25, ease: "power2.in" }, o.at);
    tl.to(left, { scaleY: 1, duration: 0.25, ease: "power2.in" }, o.at);
    tl.to(right, { scaleY: 1, duration: 0.25, ease: "power2.out" }, o.at + 0.25);
    tl.to(bottom, { scaleX: 1, duration: 0.25, ease: "power2.out" }, o.at + 0.25);
    if (o.out != null) {   // it leaves the way it came: the far sides pull back first
      tl.to(right, { scaleY: 0, duration: 0.15, ease: "power2.in" }, o.out);
      tl.to(bottom, { scaleX: 0, duration: 0.15, ease: "power2.in" }, o.out);
      tl.to(top, { scaleX: 0, duration: 0.15, ease: "power2.out" }, o.out + 0.15);
      tl.to(left, { scaleY: 0, duration: 0.15, ease: "power2.out" }, o.out + 0.15);
    }
    return [top, right, bottom, left];
  }
  global.RobotoMark = { underline: underline, box: box };
})(window);

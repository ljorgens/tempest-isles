// Pan & pinch-zoom for the map. Works by moving the SVG viewBox, so every
// layer inside the map keeps drawing in map coordinates. Phones open zoomed in
// to fill the screen; a drag or pinch never counts as a country click.

const MAX_ZOOM = 4;
const PHONE = '(max-width: 760px)';

export function initMapView(svg: SVGSVGElement, W: number, H: number) {
  let s = 1;
  let cx = W / 2;
  let cy = H / 2;

  // The s = 1 view: the whole map, padded to the element's aspect ratio so the
  // viewBox and the element always share a shape (no letterboxing to correct for).
  const base = () => {
    const r = svg.getBoundingClientRect();
    const a = r.width > 0 && r.height > 0 ? r.width / r.height : W / H;
    return W / H > a ? { bw: W, bh: W / a } : { bw: H * a, bh: H };
  };
  const view = () => {
    const { bw, bh } = base();
    return { w: bw / s, h: bh / s };
  };
  const apply = () => {
    const { w, h } = view();
    cx = w >= W ? W / 2 : Math.min(Math.max(cx, w / 2), W - w / 2);
    cy = h >= H ? H / 2 : Math.min(Math.max(cy, h / 2), H - h / 2);
    svg.setAttribute('viewBox', `${cx - w / 2} ${cy - h / 2} ${w} ${h}`);
  };
  const setZoom = (z: number) => {
    s = Math.min(Math.max(z, 1), MAX_ZOOM);
    apply();
  };
  // Zoom that makes the map fill the element edge to edge.
  const fillZoom = () => {
    const { bw, bh } = base();
    return Math.max(bh / H, bw / W);
  };
  const fit = () => {
    cx = W / 2;
    cy = H / 2;
    setZoom(matchMedia(PHONE).matches ? Math.min(fillZoom(), 2.5) : 1);
  };

  // ----- gestures -----
  const pts = new Map<number, { x: number; y: number }>();
  let moved = 0;
  let pinch: { d: number; s: number; mx: number; my: number } | null = null;

  const toMap = (x: number, y: number) => {
    const r = svg.getBoundingClientRect();
    const { w, h } = view();
    return { x: cx - w / 2 + ((x - r.left) / r.width) * w, y: cy - h / 2 + ((y - r.top) / r.height) * h };
  };
  const pair = () => {
    const [a, b] = [...pts.values()];
    return { d: Math.hypot(a.x - b.x, a.y - b.y), x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
  };

  svg.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pts.size === 1) moved = 0;
    if (pts.size === 2) {
      const p = pair();
      const m = toMap(p.x, p.y);
      pinch = { d: p.d, s, mx: m.x, my: m.y };
    }
  });

  window.addEventListener('pointermove', (e) => {
    const prev = pts.get(e.pointerId);
    if (!prev) return;
    const cur = { x: e.clientX, y: e.clientY };
    pts.set(e.pointerId, cur);
    const r = svg.getBoundingClientRect();
    if (pts.size === 1) {
      const dx = cur.x - prev.x;
      const dy = cur.y - prev.y;
      moved += Math.abs(dx) + Math.abs(dy);
      const { w, h } = view();
      cx -= (dx / r.width) * w;
      cy -= (dy / r.height) * h;
      apply();
    } else if (pts.size === 2 && pinch) {
      moved = Infinity;
      const p = pair();
      s = Math.min(Math.max((pinch.s * p.d) / pinch.d, 1), MAX_ZOOM);
      // Keep the map point that started under the fingers under them.
      const { w, h } = view();
      cx = pinch.mx - ((p.x - r.left) / r.width - 0.5) * w;
      cy = pinch.my - ((p.y - r.top) / r.height - 0.5) * h;
      apply();
    }
  });

  const release = (e: PointerEvent) => {
    pts.delete(e.pointerId);
    if (pts.size < 2) pinch = null;
  };
  window.addEventListener('pointerup', release);
  window.addEventListener('pointercancel', release);

  // A drag that ends over a country must not select it.
  svg.addEventListener(
    'click',
    (e) => {
      if (moved > 10) {
        e.stopPropagation();
        e.preventDefault();
      }
      moved = 0;
    },
    true,
  );

  // ----- zoom buttons -----
  const ctl = document.createElement('div');
  ctl.className = 'map-zoom';
  ctl.innerHTML = `<button type="button" aria-label="Zoom in">+</button>
    <button type="button" aria-label="Zoom out">−</button>
    <button type="button" aria-label="Fit map">⤢</button>`;
  const [zin, zout, zfit] = ctl.querySelectorAll('button');
  zin.addEventListener('click', () => setZoom(s * 1.5));
  zout.addEventListener('click', () => setZoom(s / 1.5));
  zfit.addEventListener('click', fit);
  svg.parentElement!.appendChild(ctl);

  window.addEventListener('resize', apply);
  return { fit };
}

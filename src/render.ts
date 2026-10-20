// SVG map renderer: ocean, rhumb lines, compass rose, sea lanes, islands,
// countries, labels, and battle/disaster effects.
import type { WorldMap } from './geometry';
import type { GameState } from './types';

const NS = 'http://www.w3.org/2000/svg';

function el<K extends keyof SVGElementTagNameMap>(
  tag: K,
  attrs: Record<string, string | number> = {},
  parent?: Element,
): SVGElementTagNameMap[K] {
  const node = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, String(v));
  parent?.appendChild(node);
  return node;
}

export class Renderer {
  svg!: SVGSVGElement;
  countryEls: SVGPathElement[] = [];
  countEls: SVGTextElement[] = [];
  numEls: SVGTextElement[] = [];
  arrowEl!: SVGGElement;
  fxLayer!: SVGGElement;
  focusRing!: SVGGElement;
  onCountryClick: (id: number) => void = () => {};
  playerColors: string[] = [];
  /** The country the keyboard was last on, so focus can return to it. */
  lastFocused: number | null = null;

  constructor(public world: WorldMap) {}

  init(svg: SVGSVGElement) {
    this.svg = svg;
    const { width: w, height: h } = this.world;
    svg.setAttribute('viewBox', `0 0 ${w} ${h}`);

    // ----- defs -----
    const defs = el('defs', {}, svg);
    const grad = el('radialGradient', { id: 'ocean', cx: '0.5', cy: '0.42', r: '0.85' }, defs);
    el('stop', { offset: '0%', 'stop-color': '#17405e' }, grad);
    el('stop', { offset: '60%', 'stop-color': '#102e47' }, grad);
    el('stop', { offset: '100%', 'stop-color': '#0a1f33' }, grad);

    const water = el('filter', { id: 'waterTex', x: '-5%', y: '-5%', width: '110%', height: '110%' }, defs);
    el('feTurbulence', { type: 'fractalNoise', baseFrequency: '0.012 0.02', numOctaves: 2, seed: 7, result: 'n' }, water);
    el('feColorMatrix', { in: 'n', type: 'matrix', values: '0 0 0 0 0.4  0 0 0 0 0.55  0 0 0 0 0.7  0 0 0 0.05 0' }, water);
    el('feComposite', { in2: 'SourceGraphic', operator: 'over' }, water);

    const paper = el('filter', { id: 'landTex', x: '-8%', y: '-8%', width: '116%', height: '116%' }, defs);
    el('feTurbulence', { type: 'fractalNoise', baseFrequency: '0.9', numOctaves: 2, seed: 3, result: 'g' }, paper);
    el('feColorMatrix', { in: 'g', type: 'matrix', values: '0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.06 0', result: 'grain' }, paper);
    el('feComposite', { in: 'grain', in2: 'SourceGraphic', operator: 'over' }, paper);

    const shadow = el('filter', { id: 'isleShadow', x: '-20%', y: '-20%', width: '140%', height: '140%' }, defs);
    el('feDropShadow', { dx: 0, dy: 5, stdDeviation: 6, 'flood-color': '#020a14', 'flood-opacity': 0.55 }, shadow);

    // ----- ocean -----
    el('rect', { x: 0, y: 0, width: w, height: h, fill: 'url(#ocean)' }, svg);
    el('rect', { x: 0, y: 0, width: w, height: h, fill: '#fff', opacity: 0.04, filter: 'url(#waterTex)' }, svg);

    // rhumb lines radiating from the compass rose
    const rhumbs = el('g', { stroke: '#9db9cf', 'stroke-width': 0.6, opacity: 0.07 }, svg);
    const rcx = w - 92, rcy = h - 86;
    for (let i = 0; i < 16; i++) {
      const a = (i * Math.PI) / 8;
      el('line', { x1: rcx, y1: rcy, x2: rcx + Math.cos(a) * 1400, y2: rcy + Math.sin(a) * 1400 }, rhumbs);
    }

    // compass rose
    const rose = el('g', { transform: `translate(${rcx} ${rcy})`, opacity: 0.5, 'aria-hidden': 'true' }, svg);
    el('circle', { r: 34, fill: 'none', stroke: '#c8b78a', 'stroke-width': 1 }, rose);
    el('circle', { r: 27, fill: 'none', stroke: '#c8b78a', 'stroke-width': 0.5, 'stroke-dasharray': '2 3' }, rose);
    let star = '';
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4 - Math.PI / 2;
      const ro = i % 2 === 0 ? 30 : 12;
      star += `${i ? 'L' : 'M'}${Math.cos(a) * ro} ${Math.sin(a) * ro}`;
    }
    el('path', { d: star + 'Z', fill: '#c8b78a', opacity: 0.85 }, rose);
    const nText = el('text', { y: -40, 'text-anchor': 'middle', fill: '#c8b78a', 'font-size': 13, class: 'rose-n' }, rose);
    nText.textContent = 'N';

    // ----- sea lanes -----
    const lanes = el('g', {}, svg);
    for (const [a, b] of this.world.lanes) {
      const [x1, y1] = this.world.countries[a].centroid;
      const [x2, y2] = this.world.countries[b].centroid;
      const mx = (x1 + x2) / 2 + (y2 - y1) * 0.12;
      const my = (y1 + y2) / 2 + (x1 - x2) * 0.12;
      el('path', {
        d: `M${x1} ${y1} Q${mx} ${my} ${x2} ${y2}`,
        class: 'lane',
        fill: 'none',
      }, lanes);
    }

    // ----- islands ----- (sand rim + shadow under countries)
    const isles = el('g', { filter: 'url(#isleShadow)' }, svg);
    for (const isl of this.world.islands) {
      el('path', { d: isl.path, fill: '#d8c693', stroke: '#caa968', 'stroke-width': 7, 'stroke-linejoin': 'round' }, isles);
    }

    // ----- countries -----
    // Each country is a button for keyboard and screen-reader play; only the
    // ones a prompt is waiting on are in the Tab order (see setPickable).
    const countriesG = el('g', { filter: 'url(#landTex)' }, svg);
    for (const c of this.world.countries) {
      const path = el('path', {
        d: c.path,
        class: 'country',
        'data-id': c.id,
        role: 'button',
        tabindex: -1,
        'aria-disabled': 'true',
      }, countriesG);
      const isl = this.world.islands[c.island];
      const tip = el('title', {}, path);
      tip.textContent = `Country ${c.id + 1} — ${isl.name} (+${isl.bonus})`;
      path.addEventListener('click', () => this.onCountryClick(c.id));
      // A mouse click shouldn't focus the country: that would hijack the
      // arrow keys and Space from page scrolling.
      path.addEventListener('mousedown', (e) => e.preventDefault());
      this.countryEls[c.id] = path;
    }

    // Keyboard focus ring: a copy of the focused country's outline drawn above
    // every country, so neighbors can't cover half of it. Dark under light
    // reads against any fill and the sea.
    this.focusRing = el('g', { class: 'focus-ring', visibility: 'hidden', 'pointer-events': 'none', 'aria-hidden': 'true' }, svg);
    el('path', { class: 'ring-under' }, this.focusRing);
    el('path', { class: 'ring-over' }, this.focusRing);
    svg.addEventListener('focusin', (e) => {
      const id = this.countryIdOf(e.target);
      if (id === null) return;
      this.lastFocused = id;
      if (!(e.target as Element).matches(':focus-visible')) return;
      for (const p of this.focusRing.children) p.setAttribute('d', this.world.countries[id].path);
      this.focusRing.setAttribute('visibility', 'visible');
    });
    svg.addEventListener('focusout', () => this.focusRing.setAttribute('visibility', 'hidden'));

    // Enter/Space choose the focused country; arrow keys hop to the nearest
    // pickable country in that direction.
    const DIRS: Record<string, [number, number]> = {
      ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0],
    };
    svg.addEventListener('keydown', (e) => {
      const id = this.countryIdOf(e.target);
      if (id === null || e.altKey || e.ctrlKey || e.metaKey) return;
      // Outside a prompt the keys keep their usual jobs (scrolling the page).
      if (!this.countryEls[id].classList.contains('pickable')) return;
      if (e.key === 'Enter' || e.key === ' ') {
        // Also stops the key from re-firing on whatever the next prompt focuses.
        e.preventDefault();
        this.onCountryClick(id);
      } else if (DIRS[e.key]) {
        e.preventDefault();
        const next = this.nearestPickable(id, DIRS[e.key]);
        if (next !== null) this.countryEls[next].focus();
      }
    });
    // island name plaques
    const names = el('g', {}, svg);
    for (const isl of this.world.islands) {
      const t = el('text', {
        x: isl.labelAt[0],
        y: isl.labelAt[1],
        class: 'isle-name',
        'text-anchor': 'middle',
      }, names);
      t.textContent = `${isl.name.toUpperCase()} · ${isl.bonus}`;
    }

    // ----- labels -----
    // Hidden from screen readers: each country's own label already says this.
    const labels = el('g', { 'pointer-events': 'none', 'aria-hidden': 'true' }, svg);
    for (const c of this.world.countries) {
      const [x, y] = c.centroid;
      const num = el('text', { x, y: y - 7.5, class: 'c-num', 'text-anchor': 'middle' }, labels);
      num.textContent = String(c.id + 1);
      const count = el('text', { x, y: y + 7, class: 'c-count', 'text-anchor': 'middle' }, labels);
      count.textContent = '1';
      this.numEls[c.id] = num;
      this.countEls[c.id] = count;
    }

    // selection arrow
    this.arrowEl = el('g', { class: 'sel-arrow', visibility: 'hidden', 'pointer-events': 'none' }, svg);
    el('path', { d: 'M0 0 L-9 -16 L-3 -16 L-3 -30 L3 -30 L3 -16 L9 -16 Z', fill: '#ffe9a8', stroke: '#5b4a17', 'stroke-width': 1.2 }, this.arrowEl);

    this.fxLayer = el('g', { 'pointer-events': 'none' }, svg);
  }

  setPlayerColors(colors: string[]) {
    this.playerColors = colors;
  }

  refresh(st: GameState) {
    for (const c of this.world.countries) {
      const pEl = this.countryEls[c.id];
      pEl.style.fill = this.playerColors[st.owner[c.id]];
      const count = this.countEls[c.id];
      count.textContent = String(st.armies[c.id]);
      const prod = st.prodCenters.includes(c.id);
      count.classList.toggle('prod', prod);
      this.numEls[c.id].textContent = prod ? `⚓${c.id + 1}` : String(c.id + 1);
      // Accessible name, e.g. "Country 5, Ember Atoll, yours, 5 armies".
      const owner = st.players[st.owner[c.id]];
      const n = st.armies[c.id];
      pEl.setAttribute(
        'aria-label',
        `Country ${c.id + 1}, ${this.world.islands[c.island].name}, ` +
          `${owner?.name === 'You' ? 'yours' : `held by ${owner?.name ?? 'no one'}`}, ` +
          `${n} ${n === 1 ? 'army' : 'armies'}${prod ? ', production center' : ''}`,
      );
    }
  }

  setPickable(ids: number[]) {
    const set = new Set(ids);
    this.world.countries.forEach((c) => {
      const on = set.has(c.id);
      const pEl = this.countryEls[c.id];
      pEl.classList.toggle('pickable', on);
      // Off-prompt countries stay focusable by script (-1) so focus isn't
      // dropped to the page when a pick resolves.
      pEl.setAttribute('tabindex', on ? '0' : '-1');
      pEl.setAttribute('aria-disabled', String(!on));
    });
  }

  /** Where keyboard focus belongs for the current prompt: the focused country
   *  if it is still pickable, else the last one visited, else the first. */
  pickTarget(): SVGPathElement | undefined {
    const ok = (e?: SVGPathElement) => e?.classList.contains('pickable');
    const active = this.countryEls.find((e) => e === document.activeElement);
    if (ok(active)) return active;
    const last = this.lastFocused === null ? undefined : this.countryEls[this.lastFocused];
    if (ok(last)) return last;
    return this.countryEls.find(ok);
  }

  private countryIdOf(t: EventTarget | null): number | null {
    return t instanceof SVGPathElement && t.classList.contains('country') ? Number(t.dataset.id) : null;
  }

  /** The pickable country closest to `from` in direction `d`, favoring ones
   *  straight ahead over ones off to the side. */
  private nearestPickable(from: number, [dx, dy]: [number, number]): number | null {
    const [x0, y0] = this.world.countries[from].centroid;
    let best: number | null = null;
    let bestScore = Infinity;
    for (const c of this.world.countries) {
      if (c.id === from || !this.countryEls[c.id].classList.contains('pickable')) continue;
      const vx = c.centroid[0] - x0;
      const vy = c.centroid[1] - y0;
      const along = vx * dx + vy * dy;
      if (along <= 0) continue;
      const score = along + 2 * Math.abs(vx * dy - vy * dx);
      if (score < bestScore) {
        bestScore = score;
        best = c.id;
      }
    }
    return best;
  }

  arrow(id: number | null) {
    if (id === null) {
      this.arrowEl.setAttribute('visibility', 'hidden');
    } else {
      const [x, y] = this.world.countries[id].centroid;
      this.arrowEl.setAttribute('transform', `translate(${x} ${y - 10})`);
      this.arrowEl.setAttribute('visibility', 'visible');
    }
  }

  shake(ids: number[]) {
    for (const id of ids) {
      const elx = this.countryEls[id];
      elx.classList.remove('shaking');
      void elx.getBoundingClientRect();
      elx.classList.add('shaking');
    }
  }

  /** Pulse a bright, glowing outline in `color` over the given countries —
   *  used to call attention to disaster/event effects as they land. */
  flash(ids: number[], color = '#8fd0ff') {
    for (const id of ids) {
      const elx = this.countryEls[id];
      elx.style.setProperty('--flash', color);
      elx.classList.remove('flashing');
      void elx.getBoundingClientRect();
      elx.classList.add('flashing');
      setTimeout(() => elx.classList.remove('flashing'), 1300);
    }
  }

  floatText(id: number, text: string, color = '#fff') {
    const [x, y] = this.world.countries[id].centroid;
    const t = el('text', {
      x, y: y - 12,
      class: 'float-num',
      'text-anchor': 'middle',
      fill: color,
    }, this.fxLayer);
    t.textContent = text;
    setTimeout(() => t.remove(), 1700);
  }
}

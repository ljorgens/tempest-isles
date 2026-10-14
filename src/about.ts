// About panel: why this remake exists, credit to the original, and where to
// find the source, report bugs, or leave a tip.

export const SOURCE_URL = 'https://github.com/ljorgens/tempest-isles';
export const ISSUES_URL = `${SOURCE_URL}/issues/new`;
// Tip-jar link: a Stripe Payment Link (customer chooses price, $5 suggested, $3 min, $100 max).
// Empty hides the tip button everywhere. Always call it a "tip", never a "donation".
export const TIP_URL = '';

const $ = <T extends HTMLElement>(sel: string) => document.querySelector(sel) as T;

const ext = (href: string, label: string, kind = 'ghost') =>
  `<a class="btn ${kind}" href="${href}" target="_blank" rel="noopener">${label}</a>`;

export function showAbout() {
  const m = $('#modal');
  $('#modal-scrim').hidden = false;
  m.innerHTML = `<h2>About Tempest Isles</h2>
    <div class="help-body about-body">
      <p class="about-story">I spent hours playing <em>Isle Wars Pro</em> as a kid: pushing armies across
      nine little islands, cursing the earthquakes, and praying a flood wouldn't wipe out my best stack.
      Years later I went looking for it and found it hard to get running on a modern computer.
      So I rebuilt it from scratch to play it again, and I'm sharing it so anyone who remembers it,
      or never got the chance, can play the way I used to.
      <span class="about-sig">— Driftwood Games</span></p>

      <p><strong>Credit.</strong> Tempest Isles is an unofficial, fan-made tribute to
      <em>Isle Wars Pro</em> by William Soleau of Soleau Software. The rules follow the original's
      manual; the code, map, art and sound are all new. This project is not affiliated with or
      endorsed by Soleau Software. All credit for the game's design goes to them.</p>

      <p><strong>Free &amp; open source.</strong> The game is free to play, and its code is MIT-licensed.
      Fork it, fix it, add the feature you always wanted. Found a bug, or remember a rule differently?
      Please let me know.</p>
      ${
        TIP_URL
          ? `<p><strong>Tips.</strong> Tempest Isles will always be free. If it brought back good memories,
      you can leave a tip to help with hosting and the time I put into it. Tips are completely optional,
      unlock nothing, and aren't a charitable donation (they're not tax-deductible).</p>`
          : ''
      }
    </div>
    <div class="m-actions">
      ${ext(SOURCE_URL, 'View the Code')}
      ${ext(ISSUES_URL, 'Report a Bug / Idea')}
      ${TIP_URL ? ext(TIP_URL, '☕ Tip the Developer', 'primary') : ''}
      <button class="btn ghost" id="m-close">Close</button>
    </div>`;
  m.querySelector('#m-close')!.addEventListener('click', () => ($('#modal-scrim').hidden = true));
}

// Title-screen footer links.
export function initAboutLinks() {
  $('#t-about').addEventListener('click', showAbout);
  ($('#t-source') as unknown as HTMLAnchorElement).href = SOURCE_URL;
  const tip = $('#t-tip') as unknown as HTMLAnchorElement;
  if (TIP_URL) tip.href = TIP_URL;
  else tip.remove();
}

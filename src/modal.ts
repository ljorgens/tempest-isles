// The one modal dialog. Opening it makes the page behind inert (no clicks, no
// Tab focus) and moves focus inside; closing restores focus. Informational
// dialogs can be dismissed with Escape or a click on the backdrop, which acts
// like their Close button so any pending promise still resolves. Prompts the
// engine is waiting on are not dismissable.

const $ = <T extends HTMLElement>(sel: string) => document.querySelector(sel) as T;

let dismissable = false;
let returnFocus: HTMLElement | null = null;

const screens = () => [$('#title-screen'), $('#game-screen')];

export function isModalOpen() {
  return !$('#modal-scrim').hidden;
}

export function openModal(html: string, opts: { dismissable?: boolean } = {}): HTMLElement {
  const scrim = $('#modal-scrim');
  const modal = $('#modal');
  if (scrim.hidden) returnFocus = document.activeElement as HTMLElement | null;
  dismissable = !!opts.dismissable;
  modal.innerHTML = html;
  modal.querySelector('h2')?.setAttribute('id', 'modal-title');
  scrim.hidden = false;
  for (const s of screens()) s.inert = true;
  modal.scrollTop = 0;
  modal.focus(); // the dialog itself, so a long one isn't scrolled to its first link; Tab moves in
  return modal;
}

export function closeModal() {
  $('#modal-scrim').hidden = true;
  for (const s of screens()) s.inert = false;
  returnFocus?.focus?.({ preventScroll: true });
  returnFocus = null;
}

/** A themed yes/no question, in place of window.confirm(). */
export function confirmModal(title: string, text: string, yes: string, no: string): Promise<boolean> {
  const m = openModal(
    `<h2>${title}</h2>
    <p class="m-note">${text}</p>
    <div class="m-actions">
      <button class="btn danger" id="m-yes">${yes}</button>
      <button class="btn ghost" id="m-close">${no}</button>
    </div>`,
    { dismissable: true },
  );
  return new Promise((resolve) => {
    m.querySelector('#m-yes')!.addEventListener('click', () => {
      closeModal();
      resolve(true);
    });
    m.querySelector('#m-close')!.addEventListener('click', () => {
      closeModal();
      resolve(false);
    });
  });
}

function dismiss() {
  if (!isModalOpen() || !dismissable) return;
  const close = $('#modal').querySelector<HTMLButtonElement>('#m-close');
  if (close) close.click();
  else closeModal();
}

export function initModal() {
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') dismiss();
  });
  $('#modal-scrim').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) dismiss();
  });
}

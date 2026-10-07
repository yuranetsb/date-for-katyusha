'use strict';
const content = document.querySelector('#content');
const bunny = document.querySelector('#bunny');
const notice = document.querySelector('#notice');
const places = ['Ужин в ресторане', 'СПА', 'Поездка за город', 'Пострелять в стрелковом центре «Булат»'];
const times = ['12:00', '14:00', '16:00', '18:00', '20:00'];
const state = { date: '', time: '', place: '' };
const firstDate = '2026-10-16';
function sticker(name) {
  bunny.src = 'assets/stickers/' + name + '.webp';
  bunny.parentElement.dataset.emotion = name;
}
function availableTimes(date) {
  const day = new Date(date + 'T12:00:00+03:00').getUTCDay();
  return day === 0 || day === 6 ? times : ['19:00', '20:00'];
}
function earliestDate() { return today() > firstDate ? today() : firstDate; }

function today() {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Moscow', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date());
  const get = key => parts.find(p => p.type === key).value;
  return `${get('year')}-${get('month')}-${get('day')}`;
}
function validDate(value) { return /^\d{4}-\d{2}-\d{2}$/.test(value) && value >= earliestDate() && !Number.isNaN(Date.parse(value + 'T12:00:00+03:00')); }
function prettyDate() { return new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long', weekday: 'long', year: 'numeric' }).format(new Date(state.date + 'T12:00:00')); }
function show(html, happy = false) {
  notice.textContent = '';
  content.innerHTML = html;
  sticker(happy ? 'happy' : 'love');
  content.classList.remove('enter'); void content.offsetWidth; content.classList.add('enter');
  bunny.alt = happy ? 'Радостный котик Peach' : 'Котики Peach и Goma с сердечком';
  content.querySelector('h1').setAttribute('tabindex', '-1');
  content.querySelector('h1').focus({ preventScroll: true });
}
function button(text, fn, className = 'primary') {
  const b = document.createElement('button');
  b.type = 'button'; b.textContent = text; b.className = className;
  b.addEventListener('click', fn);
  return b;
}
function invite() {
  show('<h1>Катюша, пошли<br>на свидание?</h1><p>У меня есть один маленький план.<br>И в нём очень не хватает тебя ♡</p><div class="actions"></div>');
  const actions = content.querySelector('.actions');
  actions.append(button('Да 💗', celebrate), button('Нет', () => { sticker('hope'); bunny.alt = 'Котик под листиком просит сказать да'; notice.textContent = 'А если очень мило попросить? 🥺'; }, 'secondary'));
}
function celebrate() {
  show('<h1>Ура-а-а! 💕</h1><p>Так и знал, что ты скажешь «да».<br>Давай придумаем наш идеальный день.</p><div class="actions"></div>', true);
  content.querySelector('.actions').append(button('Когда пойдём?', dateStep));
}
function dateStep() {
  show('<h1>Выбери наш день ♡</h1><form><label for="date">Дата свидания</label><input id="date" type="date" required><div class="actions"><button class="primary" type="submit">Дальше 💗</button></div></form>');
  sticker('think'); bunny.alt = 'Задумчивый котик Goma';
  const input = content.querySelector('input');
  input.min = earliestDate(); input.value = validDate(state.date) ? state.date : earliestDate();
  content.querySelector('form').addEventListener('submit', event => {
    event.preventDefault();
    if (!validDate(input.value)) { notice.textContent = 'Выбери дату не раньше 16 октября и не в прошлом ♡'; return; }
    state.date = input.value;
    if (!availableTimes(state.date).includes(state.time)) state.time = '';
    timeStep();
  });
  content.append(button('Назад', invite, 'back'));
}
function timeStep() {
  show('<h1>Во сколько?</h1><div class="choices"></div><div class="actions"></div>');
  sticker('think'); bunny.alt = 'Задумчивый котик Goma';
  const allowed = availableTimes(state.date);
  if (!allowed.includes(state.time)) state.time = '';
  const choices = content.querySelector('.choices');
  choices.classList.toggle('weekday-times', allowed.length === 2);
  const next = button('Дальше 💗', () => {
    if (!allowed.includes(state.time)) { notice.textContent = 'Выбери время встречи ♡'; return; }
    placeStep();
  });
  function mark() {
    content.querySelectorAll('[data-time]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.time === state.time)));
    next.disabled = !allowed.includes(state.time);
  }
  for (const t of allowed) {
    const b = button(t, () => { state.time = t; notice.textContent = ''; mark(); }, 'choice');
    b.dataset.time = t; choices.append(b);
  }
  content.querySelector('.actions').append(next); mark();
  content.append(button('Назад', dateStep, 'back'));
}
function placeStep() {
  show('<h1>Что выберем?</h1><p>Мне главное — провести<br>это время с тобой.</p><div class="choices places"></div>');
  sticker('think'); bunny.alt = 'Задумчивый котик Goma';
  for (const p of places) content.querySelector('.choices').append(button(p, () => { state.place = p; confirmStep(); }, 'choice'));
  content.append(button('Назад', timeStep, 'back'));
}
function summary() {
  const box = document.createElement('div'); box.className = 'summary';
  for (const line of [prettyDate(), state.time, state.place]) {
    const p = document.createElement('p'); p.textContent = line; box.append(p);
  }
  content.append(box);
}
function confirmStep() {
  show('<h1>Наше свидание</h1><p>Всё так, как тебе хочется?</p>'); summary();
  content.append(button('Договорились', () => {
    const selected = new Date(`${state.date}T${state.time}:00+03:00`);
    if (!validDate(state.date) || selected <= new Date()) { dateStep(); notice.textContent = 'Это время уже прошло. Выберем новый день?'; return; }
    if (!availableTimes(state.date).includes(state.time)) { timeStep(); notice.textContent = 'Выбери доступное время ♡'; return; }
    done();
  }, 'primary wide'), button('Изменить выбор', dateStep, 'back'));
}
function done() {
  show('<div class="eyebrow final-label">ЭТО БУДЕТ НАШ ДЕНЬ</div><h1>Договорились!</h1><p>Осталось только дождаться встречи.<br>А котики уже радуются за нас.</p>', true);
  sticker('love'); bunny.alt = 'Peach и Goma рядом с сердечком'; summary();
  const send = button('Отправь мне ответ', () => {
    const panel = content.querySelector('.share-panel');
    panel.hidden = !panel.hidden;
    send.setAttribute('aria-expanded', String(!panel.hidden));
  }, 'primary wide');
  send.setAttribute('aria-expanded', 'false'); send.setAttribute('aria-controls', 'share-panel');
  content.append(send, sharePanel(), button('Изменить наши планы', dateStep, 'back'));
}
if (!restoreAnswer()) invite();

function answer() {
  return `Да, пошли на свидание!\nДата: ${prettyDate()}\nВремя: ${state.time}\nПланы: ${state.place}`;
}
function answerUrl() {
  if (!/^https?:$/.test(location.protocol)) return '';
  const url = new URL(location.href);
  url.hash = ''; url.search = '';
  url.searchParams.set('date', state.date);
  url.searchParams.set('time', state.time);
  url.searchParams.set('place', String(places.indexOf(state.place)));
  return url.href;
}
function sharePanel() {
  const panel = document.createElement('div');
  panel.id = 'share-panel'; panel.className = 'share-panel'; panel.hidden = true;
  const text = answer(), url = answerUrl();
  const hint = document.createElement('p');
  hint.textContent = url ? '' : '';
  panel.append(hint);
  if (url) {
    const links = document.createElement('div'); links.className = 'share-options';
    for (const [label, href] of [
      ['Telegram', 'https://t.me/share/url?' + new URLSearchParams({url, text})],
      ['ВКонтакте', 'https://vk.com/share.php?' + new URLSearchParams({url, title: text, noparse: 'true'})]
    ]) {
      const link = document.createElement('a'); link.className = 'button secondary'; link.textContent = label;
      link.href = href; link.target = '_blank'; link.rel = 'noopener noreferrer'; links.append(link);
    }
    panel.append(links);
    const vkHint = document.createElement('p'); vkHint.className = 'share-hint';
    vkHint.textContent = '';
    panel.append(vkHint);
  }
  panel.append(button('', async () => {
    try { await navigator.clipboard.writeText(text); notice.textContent = ''; }
    catch {
      let field = panel.querySelector('textarea');
      if (!field) { field = document.createElement('textarea'); field.readOnly = true; field.setAttribute('aria-label', 'Текст ответа'); panel.append(field); }
      field.value = text; field.focus(); field.select(); notice.textContent = '';
    }
  }, 'back'));
  return panel;
}
function restoreAnswer() {
  const params = new URLSearchParams(location.search);
  const date = params.get('date'), time = params.get('time'), place = params.get('place');
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date) || date < firstDate) return false;
  const parsed = new Date(date + 'T12:00:00Z');
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== date) return false;
  if (!availableTimes(date).includes(time) || !/^[0-3]$/.test(place || '')) return false;
  state.date = date; state.time = time; state.place = places[Number(place)];
  done(); return true;
}

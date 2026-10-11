/*
 * Infodemic: Disinformation & Policy Simulator engine.
 * Plain browser JavaScript, no dependencies, works from file://.
 */
(function () {
  'use strict';

  const CASES = window.SN_CASES || {};
  const GLOSSARY = window.SN_GLOSSARY || {};

  /* ---------------------------------------------------------------- config */

  const REVEAL_DELAY_MS = (location.hash && location.hash.length > 1) ? 50 : 600;   // pause between posts appearing in the feed
  const POINTS_EXACT = 2;        // best answer
  const POINTS_CLOSE = 1;        // one step off (e.g. "unsure" when the answer was "unlikely")

  const CHOICES = [
    { id: 'true',   key: '1', label: 'Likely true',  short: 'Likely true' },
    { id: 'unsure', key: '2', label: 'Unsure',        short: 'Unsure' },
    { id: 'false',  key: '3', label: 'Likely false', short: 'Likely false' }
  ];
  const CHOICE_RANK = { 'true': 0, 'unsure': 1, 'false': 2 };

  const ROLE_LABELS = {
    reliable: 'Reliable source',
    ordinary: 'Ordinary user',
    misinfo:  'Spread misinformation',
    disinfo:  'Disinformation account',
    bot:      'Bot'
  };

  const RANKS = [
    { min: 90, title: 'Disinformation Detective',
      text: 'You weighed the evidence, spotted the manipulation tactics and knew when to wait for more information. Excellent work.' },
    { min: 75, title: 'Sharp Skeptic',
      text: 'You saw through most of the manipulation. Go through the review below to sharpen your judgement even further.' },
    { min: 55, title: 'Getting There',
      text: 'You caught some of the tricks, but others got past you. The red flags below are worth a second look.' },
    { min: 0,  title: 'Easy Target (for now)',
      text: 'Disinformation is designed to be convincing, and a lot of it got through this time. The review below shows what to look for. Try again!' }
  ];

  /* ------------------------------------------------------------------ DOM */

  const $ = (id) => document.getElementById(id);
  const screens = { home: $('screen-home'), game: $('screen-game'), end: $('screen-end') };
  const ui = {
    caseList: $('case-list'),
    quit: $('quit-btn'),
    phaseLabel: $('phase-label'),
    progress: $('progress'),
    timer: $('timer'),
    news: $('news'),
    feed: $('feed'),
    sidePanel: $('side-panel'),
    controls: $('controls'),
    jumpPill: $('jump-pill'),
    results: $('results'),
    dialog: $('profile-dialog')
  };

  /** Tiny element builder. Strings become text nodes, so content is never parsed as HTML. */
  function el(tag, props, ...children) {
    const node = document.createElement(tag);
    if (props) {
      for (const [key, value] of Object.entries(props)) {
        if (value === null || value === undefined || value === false) continue;
        if (key === 'class') node.className = value;
        else if (key === 'text') node.textContent = value;
        else if (key.startsWith('on') && typeof value === 'function') node.addEventListener(key.slice(2), value);
        else node.setAttribute(key, value === true ? '' : String(value));
      }
    }
    for (const child of children.flat(Infinity)) {
      if (child === null || child === undefined || child === false) continue;
      node.append(child instanceof Node ? child : document.createTextNode(String(child)));
    }
    return node;
  }

  /** Safe replacement function that strips null/undefined/false values to prevent "null" text nodes. */
  function replaceContent(parent, ...children) {
    if (!parent) return;
    const valid = children.flat(Infinity).filter((c) => c !== null && c !== undefined && c !== false);
    parent.replaceChildren(...valid);
  }

  /* ---------------------------------------------------------------- state */

  const state = {
    caseData: null,
    selectedTrack: 'health',
    selectedDiff: 'medium',
    selectedFormat: 'social',
    posts: {},          // post id -> post item
    questions: [],      // all question items, in order
    phaseIndex: 0,
    itemIndex: 0,
    answers: [],        // { question, phase, choice, points, ms }
    active: null,       // { question, card } while waiting for an answer
    questionShownAt: 0,
    pending: null       // reveal timeout id
  };

  /* ---------------------------------------------------------------- timer */

  const timer = { accumulated: 0, startedAt: null, running: false, interval: null, hidden: false };

  function timerElapsed() {
    return timer.accumulated + (timer.startedAt !== null ? performance.now() - timer.startedAt : 0);
  }
  function timerStart() {
    timerStop();
    timer.accumulated = 0;
    timer.running = true;
    timer.startedAt = document.hidden ? null : performance.now();
    timer.interval = setInterval(renderTimer, 250);
    renderTimer();
  }
  function timerPause() {
    if (timer.startedAt !== null) {
      timer.accumulated += performance.now() - timer.startedAt;
      timer.startedAt = null;
    }
  }
  function timerResume() {
    if (timer.running && timer.startedAt === null) timer.startedAt = performance.now();
  }
  function timerStop() {
    timerPause();
    timer.running = false;
    if (timer.interval !== null) clearInterval(timer.interval);
    timer.interval = null;
  }
  function renderTimer() {
    ui.timer.textContent = timer.hidden ? 'Show timer' : formatDuration(timerElapsed());
    ui.timer.classList.toggle('is-hidden', timer.hidden);
  }
  // Only count time while the page is actually visible.
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) timerPause(); else timerResume();
  });
  ui.timer.addEventListener('click', () => { timer.hidden = !timer.hidden; renderTimer(); });

  function formatDuration(ms) {
    const total = Math.max(0, Math.floor(ms / 1000));
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    const pad = (n) => String(n).padStart(2, '0');
    return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
  }

  /* -------------------------------------------------------------- helpers */

  function showScreen(name) {
    for (const [key, node] of Object.entries(screens)) node.hidden = key !== name;
    window.scrollTo(0, 0);
  }

  function currentPhase() {
    return state.caseData.phases[state.phaseIndex];
  }

  function choiceById(id) {
    return CHOICES.find((c) => c.id === id);
  }

  function prefersReducedMotion() {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function isNearBottom() {
    return window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 160;
  }

  function initials(name) {
    const words = name.replace(/[^\p{L}\p{N}\s]/gu, ' ').trim().split(/\s+/).filter(Boolean);
    const letters = words.filter((w) => !/^(dr|phd)$/i.test(w));
    const picked = (letters.length ? letters : words).slice(0, 2).map((w) => w[0].toUpperCase());
    return picked.join('') || '?';
  }

  function hue(str) {
    let h = 0;
    for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) % 360;
    return h;
  }

  function avatar(account, size) {
    return el('span', {
      class: 'avatar' + (size === 'large' ? ' avatar-large' : ''),
      style: `background:hsl(${hue(account.handle)},30%,88%)`,
      'aria-hidden': 'true'
    }, initials(account.name));
  }

  function badge(account) {
    if (account.badge === 'org') return el('span', { class: 'badge badge-org', title: 'Verified organisation' }, '\u2713');
    if (account.badge === 'paid') return el('span', { class: 'badge badge-paid', title: 'Paid checkmark' }, '\u2713');
    return null;
  }

  /** Account age relative to the current phase of the story. */
  function accountFacts(account) {
    if (account.joinedDaysBeforeStart === undefined) {
      return { joined: account.joined, posts: account.posts };
    }
    const offsets = [0, 3, 8, 29, 299];
    const phaseOffset = offsets[state.phaseIndex] !== undefined ? offsets[state.phaseIndex] : (state.phaseIndex * 7);
    const ageDays = account.joinedDaysBeforeStart + phaseOffset;
    const posts = Math.round(account.postsPerDay * Math.max(ageDays, 1));
    return {
      joined: relativeAge(ageDays),
      posts: posts.toLocaleString('en-US'),
      activity: `about ${account.postsPerDay} posts per day`
    };
  }

  function relativeAge(days) {
    const plural = (n, unit) => `${n} ${unit}${n === 1 ? '' : 's'} ago`;
    if (days <= 0) return 'today';
    if (days < 14) return plural(days, 'day');
    if (days < 60) return plural(Math.floor(days / 7), 'week');
    if (days < 365) return plural(Math.floor(days / 30), 'month');
    return plural(Math.floor(days / 365), 'year');
  }

  /* ------------------------------------------------------------- home */

  function renderHome() {
    const key = `${state.selectedTrack}_${state.selectedDiff}`;
    const activeCase = CASES[key] || CASES.outbreak || Object.values(CASES)[0];
    if (!activeCase) return;

    const count = activeCase.phases.reduce((n, p) => n + p.feed.filter((i) => i.kind === 'question').length, 0);
    const diffBadge = activeCase.diffLabel || (state.selectedDiff === 'easy' ? '🟢 Easy' : state.selectedDiff === 'hard' ? '🔴 Hard' : '🟡 Medium');

    replaceContent(ui.caseList,
      el('article', { class: 'case-card' },
        el('p', { class: 'eyebrow' }, `Case Scenario \u00B7 ${diffBadge}`),
        el('h2', null, activeCase.title),
        el('p', null, activeCase.teaser),
        el('p', { class: 'muted small' }, `${count} decisions \u00B7 about ${activeCase.estimate}`),
        el('button', { type: 'button', class: 'btn btn-primary', onclick: () => startGame(activeCase.id) }, 'Start Simulation')
      )
    );
  }

  /* ------------------------------------------------------------- game */

  function startGame(caseId) {
    const data = CASES[caseId];
    if (!data) return;
    clearPending();
    state.caseData = data;
    state.posts = {};
    state.questions = [];
    for (const phase of data.phases) {
      for (const item of phase.feed) {
        if (item.kind === 'post') state.posts[item.id] = item;
        else if (item.kind === 'question') state.questions.push(item);
      }
    }
    state.answers = [];
    state.active = null;
    showScreen('game');
    timerStart();
    startPhase(0);
  }

  function startPhase(index) {
    clearPending();
    state.phaseIndex = index;
    state.itemIndex = 0;
    state.active = null;
    const phase = currentPhase();
    ui.phaseLabel.textContent = phase.label;
    renderNews(index);
    replaceContent(ui.feed);
    replaceContent(ui.controls);
    renderSideDefault();
    updateProgress();
    updateJumpPill();
    window.scrollTo(0, 0);
    schedule(step);
  }

  function renderSideDefault() {
    replaceContent(ui.sidePanel,
      el('div', { class: 'side-placeholder' },
        el('div', { class: 'side-icon' }, '\uD83D\uDD0D'),
        el('h3', null, 'Evaluation Desk'),
        el('p', { class: 'muted small' }, 'Incoming feed posts will pause here when a claim or question requires your analysis.')
      )
    );
  }

  function clearPending() {
    if (state.pending !== null) clearTimeout(state.pending);
    state.pending = null;
  }

  function isTestMode() {
    return Boolean(window.location && window.location.hash && window.location.hash.length > 1);
  }

  function schedule(fn, customDelay) {
    clearPending();
    const delay = isTestMode() ? 0 : (customDelay !== undefined ? customDelay : (prefersReducedMotion() ? 0 : REVEAL_DELAY_MS));
    if (delay === 0) {
      fn();
    } else {
      state.pending = setTimeout(() => { state.pending = null; fn(); }, delay);
    }
  }

  /** Reveal the next feed item. Posts keep flowing; questions pause the feed. */
  function step() {
    const phase = currentPhase();
    if (state.itemIndex >= phase.feed.length) {
      renderPhaseEnd();
      return;
    }
    const item = phase.feed[state.itemIndex++];
    if (item.kind === 'question') {
      schedule(() => renderQuestion(item), (prefersReducedMotion() || (location.hash && location.hash.length > 1)) ? 0 : 450);
    } else {
      renderPost(item);
      schedule(step);
    }
  }

  function updateProgress() {
    ui.progress.textContent = `${state.answers.length}/${state.questions.length} answered`;
  }

  function appendToFeed(node) {
    const follow = isNearBottom();
    ui.feed.append(node);
    if (follow) node.scrollIntoView({ block: 'nearest', behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
  }

  /* ------------------------------------------------------------- news */

  function renderNews(index) {
    const phases = state.caseData.phases;
    const phase = phases[index];
    const earlier = phases.slice(0, index).reverse();
    replaceContent(ui.news,
      el('section', { class: 'news', 'aria-label': 'News update' },
        el('p', { class: 'eyebrow' }, `News update \u00B7 ${phase.label}`),
        el('h2', { class: 'news-headline' }, phase.news.headline),
        phase.news.body.map((p) => el('p', null, p)),
        el('p', { class: 'muted small' }, `Source: ${phase.news.source}`),
        earlier.length ? el('details', { class: 'news-earlier' },
          el('summary', null, `Earlier updates (${earlier.length})`),
          earlier.map((ph) => el('div', { class: 'earlier-item' },
            el('p', { class: 'earlier-title' }, `${ph.label}: ${ph.news.headline}`),
            ph.news.body.map((p) => el('p', null, p))
          ))
        ) : null
      )
    );
  }

  /* ------------------------------------------------------------- posts */

  function renderPost(item) {
    const account = state.caseData.accounts[item.author];
    const parent = item.replyTo ? state.posts[item.replyTo] : null;
    const parentAccount = parent ? state.caseData.accounts[parent.author] : null;
    const open = () => openProfile(account);

    state.posts[item.id] = item;

    if (item.replyTo) {
      const parentPostNode = $(`post-${item.replyTo}`);
      const parentGroup = parentPostNode ? parentPostNode.closest('.post-group') : null;
      if (parentGroup) {
        const repliesWrapper = parentGroup.querySelector('.replies-wrapper');
        const toggleLink = parentGroup.querySelector('.reply-toggle-link');
        if (repliesWrapper) {
          const node = el('article', {
            class: 'post post-reply',
            id: `post-${item.id}`
          },
            el('button', { type: 'button', class: 'avatar-btn', onclick: open, 'aria-label': `View profile of ${account.name}` }, avatar(account)),
            el('div', { class: 'post-body' },
              el('div', { class: 'post-head' },
                el('button', { type: 'button', class: 'name-btn', onclick: open }, account.name),
                badge(account),
                el('span', { class: 'muted handle' }, account.handle),
                el('span', { class: 'muted' }, `\u00B7 ${item.time}`)
              ),
              parentAccount ? el('p', { class: 'replying muted small' }, 'Replying to ', el('span', { class: 'mention' }, parentAccount.handle)) : null,
              el('p', { class: 'post-text' }, item.text),
              el('p', { class: 'post-stats muted small' },
                `${item.stats.replies} replies \u00B7 ${item.stats.reposts} reposts \u00B7 ${item.stats.likes} likes`)
            )
          );
          repliesWrapper.append(node);
          const count = repliesWrapper.children.length;
          if (toggleLink) {
            toggleLink.hidden = false;
            toggleLink.textContent = repliesWrapper.hidden
              ? `\u00B7 💬 ${count} ${count === 1 ? 'reply' : 'replies'}`
              : `\u00B7 💬 Hide replies`;
          }
        }
        return;
      }
    }

    // Root head post
    const repliesWrapper = el('div', { class: 'replies-wrapper', hidden: true });
    const replyToggleLink = el('button', {
      type: 'button',
      class: 'reply-toggle-link',
      hidden: true,
      onclick: () => {
        repliesWrapper.hidden = !repliesWrapper.hidden;
        replyToggleLink.classList.toggle('is-expanded', !repliesWrapper.hidden);
        const count = repliesWrapper.children.length;
        replyToggleLink.textContent = repliesWrapper.hidden
          ? `\u00B7 💬 ${count} ${count === 1 ? 'reply' : 'replies'}`
          : `\u00B7 💬 Hide replies`;
      }
    }, '');

    const node = el('article', {
      class: 'post post-root',
      id: `post-${item.id}`
    },
      el('button', { type: 'button', class: 'avatar-btn', onclick: open, 'aria-label': `View profile of ${account.name}` }, avatar(account)),
      el('div', { class: 'post-body' },
        el('div', { class: 'post-head' },
          el('button', { type: 'button', class: 'name-btn', onclick: open }, account.name),
          badge(account),
          el('span', { class: 'muted handle' }, account.handle),
          el('span', { class: 'muted' }, `\u00B7 ${item.time}`)
        ),
        el('p', { class: 'post-text' }, item.text),
        el('p', { class: 'post-stats muted small' },
          `${item.stats.replies} replies \u00B7 ${item.stats.reposts} reposts \u00B7 ${item.stats.likes} likes `,
          replyToggleLink
        )
      )
    );

    const postGroup = el('div', { class: 'post-group', id: `postgroup-${item.id}` },
      node,
      repliesWrapper
    );
    appendToFeed(postGroup);
  }

  /* ------------------------------------------------------------- profile */

  function openProfile(account) {
    const facts = accountFacts(account);
    const rows = [
      ['Joined', facts.joined],
      ['Posts', facts.posts],
      facts.activity ? ['Activity', facts.activity] : null,
      ['Followers', account.followers],
      ['Following', account.following]
    ].filter(Boolean);

    let badgeNote = 'No checkmark. Many genuine people and experts don\u2019t have one.';
    if (account.badge === 'org') badgeNote = 'Gold check: verified organisation. The platform has confirmed who runs this account.';
    if (account.badge === 'paid') badgeNote = 'Blue check: paid subscription. Anyone can buy one. It does not confirm who runs the account.';

    replaceContent(ui.dialog,
      el('div', { class: 'profile' },
        el('div', { class: 'profile-top' },
          avatar(account, 'large'),
          el('div', null,
            el('h3', { id: 'profile-name', class: 'profile-name' }, account.name, ' ', badge(account)),
            el('p', { class: 'muted' }, account.handle)
          )
        ),
        el('p', { class: 'profile-bio' }, account.bio || el('span', { class: 'muted' }, '(no bio)')),
        el('dl', { class: 'profile-facts' }, rows.map(([k, v]) => el('div', null, el('dt', null, k), el('dd', null, v)))),
        el('p', { class: 'small' }, badgeNote),
        el('form', { method: 'dialog' }, el('button', { class: 'btn' }, 'Close'))
      )
    );
    if (typeof ui.dialog.showModal === 'function') ui.dialog.showModal();
    else ui.dialog.setAttribute('open', '');
  }

  // Close the profile when clicking the backdrop.
  ui.dialog.addEventListener('click', (e) => { if (e.target === ui.dialog) ui.dialog.close(); });

  /* ------------------------------------------------------------- questions */

  function renderQuestion(question) {
    const post = question.post ? state.posts[question.post] : null;
    const account = post ? state.caseData.accounts[post.author] : null;
    const target = question.post ? $(`post-${question.post}`) : null;
    if (target) {
      document.querySelectorAll('.post').forEach((p) => p.classList.remove('is-target', 'highlight-pulse'));
      target.classList.add('is-target');
      const parentRepliesWrapper = target.closest('.replies-wrapper');
      if (parentRepliesWrapper) {
        parentRepliesWrapper.hidden = false;
        const parentGroup = parentRepliesWrapper.closest('.post-group');
        const toggleLink = parentGroup ? parentGroup.querySelector('.reply-toggle-link') : null;
        if (toggleLink) {
          toggleLink.classList.add('is-expanded');
          toggleLink.textContent = `\u00B7 💬 Hide replies`;
        }
      }
      target.scrollIntoView({ block: 'center', behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
    }

    const number = state.answers.length + 1;
    const promptText = question.prompt || (post ? 'Assess Claim' : 'General Question');

    const card = el('section', { class: 'question' + (post ? '' : ' question-general'), 'aria-label': `Decision ${number}` },
      el('p', { class: 'eyebrow' }, `Decision ${number} of ${state.questions.length}`),
      el('p', { class: 'q-prompt' }, promptText),
      post ? el('div', { class: 'target-pointer-box' },
        el('button', {
          type: 'button',
          class: 'target-pointer-btn',
          onclick: () => {
            if (target) {
              target.scrollIntoView({ block: 'center', behavior: 'smooth' });
              target.classList.add('highlight-pulse');
              setTimeout(() => {
                target.classList.remove('highlight-pulse');
              }, 1200);
            }
          },
          title: 'Focus post in feed'
        },
          el('span', { class: 'pointer-icon' }, '👈'),
          el('span', null, `${account.name} (${account.handle})`)
        )
      ) : null,
      el('blockquote', { class: 'q-claim' }, question.claim),
      el('div', { class: 'choices', role: 'group', 'aria-label': 'Select Verdict' },
        CHOICES.map((c) => el('button', {
          type: 'button', class: `choice choice-${c.id}`, 'data-choice': c.id,
          onclick: () => answer(question, c.id)
        }, el('span', { class: 'key', 'aria-hidden': 'true' }, c.key), c.label))
      ),
      el('div', { class: 'feedback', role: 'status', 'aria-live': 'polite' })
    );

    state.active = { question, card };
    state.questionShownAt = timerElapsed();
    replaceContent(ui.sidePanel, card);
    updateJumpPill();
  }


  function scoreFor(question, choice) {
    const distance = Math.abs(CHOICE_RANK[choice] - CHOICE_RANK[question.answer]);
    return distance === 0 ? POINTS_EXACT : distance === 1 ? POINTS_CLOSE : 0;
  }

  function partialNote(question, choice) {
    if (choice === question.answer) return null;
    if (question.answer === 'unsure') {
      return 'The evidence wasn\u2019t strong enough yet to be confident either way.';
    }
    if (choice === 'unsure') {
      return question.answer === 'false'
        ? 'Unsure is safer than believing it, but the evidence here was strong enough to rate it false/misleading.'
        : 'Caution is healthy, but the verified evidence here confirmed the claim 100%.';
    }
    return question.answer === 'false'
      ? 'This claim was misleading or fabricated. Primary source checks revealed key contradictions.'
      : 'This claim was actually 100% verified by primary sources. Remember: verify, then trust.';
  }

  function answer(question, choice) {
    if (!state.active || state.active.question !== question) return;
    const { card } = state.active;
    state.active = null;

    const points = scoreFor(question, choice);
    state.answers.push({
      question,
      phase: currentPhase(),
      choice,
      points,
      ms: timerElapsed() - state.questionShownAt
    });
    updateProgress();
    updateJumpPill();

    for (const btn of card.querySelectorAll('.choice')) {
      btn.disabled = true;
      const id = btn.getAttribute('data-choice');
      if (id === choice) btn.classList.add('is-picked');
      if (id === question.answer) btn.classList.add('is-best');
    }
    const hint = card.querySelector('.hint');
    if (hint) hint.remove();

    const verdict = points === POINTS_EXACT
      ? { cls: 'correct', text: '\u2713 Forensic Diagnosis Confirmed' }
      : points === POINTS_CLOSE
        ? { cls: 'partial', text: '\u25D0 Partly Right' }
        : { cls: 'wrong', text: '\u2717 Diagnosis Misaligned' };
    card.classList.add(`is-${verdict.cls}`);

    // Pin Community Note to post if false/misleading
    if (question.post && (question.answer === 'false' || question.answer === 'unsure')) {
      const targetPostNode = $(`post-${question.post}`);
      if (targetPostNode && !targetPostNode.querySelector('.cn-banner')) {
        const cnText = (question.signals && question.signals[0]) || question.explanation.slice(0, 150);
        const banner = el('div', { class: 'cn-banner' },
          el('strong', null, '\uD83D\uDCCD Pinned Community Context Note'),
          el('span', null, cnText)
        );
        const postBody = targetPostNode.querySelector('.post-body');
        if (postBody) postBody.append(banner);
      }
    }

    const note = partialNote(question, choice);
    const tags = question.tags.filter((t) => GLOSSARY[t]);
    const continueBtn = el('button', { type: 'button', class: 'btn btn-primary' }, 'Continue Feed \u2192');

    const feedback = card.querySelector('.feedback');
    replaceContent(feedback,
      el('p', { class: `verdict verdict-${verdict.cls}` }, verdict.text,
        points !== POINTS_EXACT ? el('span', { class: 'muted' }, ` \u00B7 Best Stamp: ${choiceById(question.answer).label}`) : null),
      note ? el('p', { class: 'note-line' }, note) : null,
      el('p', null, question.explanation),
      tags.length ? el('div', { class: 'fb-block' },
        el('p', { class: 'fb-title' }, 'Red flags & Fallacies'),
        el('ul', { class: 'fb-list' }, tags.map((t) => el('li', null, el('strong', null, GLOSSARY[t].name), ': ', GLOSSARY[t].def)))
      ) : null,
      question.signals.length ? el('div', { class: 'fb-block' },
        el('p', { class: 'fb-title' }, 'Credibility & Primary Signals'),
        el('ul', { class: 'fb-list' }, question.signals.map((s) => el('li', null, s)))
      ) : null,
      continueBtn
    );

    continueBtn.addEventListener('click', () => {
      const target = question.post ? $(`post-${question.post}`) : null;
      if (target) target.classList.remove('is-target');
      renderSideDefault();
      step();
    }, { once: true });

    feedback.scrollIntoView({ block: 'nearest', behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
    continueBtn.focus({ preventScroll: true });
  }

  function renderPhaseEnd() {
    const phases = state.caseData.phases;
    const isLast = state.phaseIndex === phases.length - 1;
    const next = phases[state.phaseIndex + 1];
    const btn = el('button', {
      type: 'button', class: 'btn btn-primary',
      onclick: () => (isLast ? finish() : startPhase(state.phaseIndex + 1))
    }, isLast ? 'See your results' : `Continue to ${next.label} \u2192`);

    const follow = isNearBottom();
    replaceContent(ui.controls,
      el('div', { class: 'phase-end' },
        el('p', { class: 'muted' }, isLast ? 'That\u2019s the end of the simulation.' : `End of ${currentPhase().label}. The story continues\u2026`),
        btn
      )
    );
    if (follow) btn.scrollIntoView({ block: 'nearest', behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
  }

  /* --------------------------------------------- "your call is waiting" pill */

  const pillObserver = 'IntersectionObserver' in window
    ? new IntersectionObserver((entries) => {
        for (const entry of entries) {
          const waiting = state.active && state.active.card === entry.target;
          ui.jumpPill.hidden = !waiting || entry.isIntersecting;
        }
      })
    : null;

  function updateJumpPill() {
    if (pillObserver) pillObserver.disconnect();
    ui.jumpPill.hidden = true;
    if (state.active && pillObserver) pillObserver.observe(state.active.card);
  }

  ui.jumpPill.addEventListener('click', () => {
    if (state.active) state.active.card.scrollIntoView({ block: 'center', behavior: 'smooth' });
  });

  /* ------------------------------------------------------------- keyboard */

  document.addEventListener('keydown', (e) => {
    if (!state.active || screens.game.hidden || ui.dialog.open) return;
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const choice = CHOICES.find((c) => c.key === e.key);
    if (choice) {
      e.preventDefault();
      answer(state.active.question, choice.id);
    }
  });

  /* ------------------------------------------------------------- quit */

  ui.quit.addEventListener('click', () => {
    if (!window.confirm('Quit this simulation? Your progress will be lost.')) return;
    clearPending();
    timerStop();
    state.active = null;
    updateJumpPill();
    showScreen('home');
  });

  /* ------------------------------------------------------------- results */

  /* ------------------------------------------------------------- results */

  function finish() {
    clearPending();
    timerStop();
    renderResults();
    showScreen('end');
  }

  function renderResults() {
    const data = state.caseData;
    const answers = state.answers;
    const maxPoints = state.questions.length * POINTS_EXACT;
    const points = answers.reduce((sum, a) => sum + a.points, 0);
    const percent = maxPoints ? Math.round((points / maxPoints) * 100) : 0;
    const rank = RANKS.find((r) => percent >= r.min);
    const totalMs = timerElapsed();
    const avgMs = answers.length ? answers.reduce((s, a) => s + a.ms, 0) / answers.length : 0;

    const exact = answers.filter((a) => a.points === POINTS_EXACT).length;
    const fellFor = answers.filter((a) => a.question.answer === 'false' && a.choice === 'true').length;
    const dismissed = answers.filter((a) => a.question.answer === 'true' && a.choice === 'false').length;
    const overconfident = answers.filter((a) => a.question.answer === 'unsure' && a.choice !== 'unsure').length;

    // Personal feedback tip
    const mistakes = [
      { n: fellFor, text: 'Your biggest risk: believing posts that weren\u2019t credible. Check author bios, account age, and sources before trusting claims.' },
      { n: dismissed, text: 'Your biggest risk: dismissing credible information. Healthy skepticism means weighing evidence, not rejecting everything.' },
      { n: overconfident, text: 'Your biggest risk: being too certain too early. When evidence is preliminary, "unsure" is the honest answer.' }
    ].sort((a, b) => b.n - a.n);
    const tip = mistakes[0].n > 0 ? mistakes[0].text : 'No major blind spots! You balanced trust and skepticism expertly.';

    const byType = ['true', 'unsure', 'false'].map((type) => {
      const subset = answers.filter((a) => a.question.answer === type);
      return {
        label: type === 'true' ? 'Credible Claims' : type === 'unsure' ? 'Uncertain Claims' : 'Misleading or False Claims',
        right: subset.filter((a) => a.points === POINTS_EXACT).length,
        total: subset.length
      };
    });

    const techniqueOrder = [];
    const techniqueMissed = {};
    for (const a of answers) {
      for (const t of a.question.tags) {
        if (!GLOSSARY[t]) continue;
        if (!(t in techniqueMissed)) { techniqueOrder.push(t); techniqueMissed[t] = false; }
        if (a.points !== POINTS_EXACT) techniqueMissed[t] = true;
      }
    }

    const seen = [];
    for (const phase of data.phases) {
      for (const item of phase.feed) {
        if (item.kind === 'post' && !seen.includes(item.author)) seen.push(item.author);
      }
    }

    const stat = (value, label, icon) => el('div', { class: 'stat-card' },
      el('div', { class: 'stat-icon' }, icon),
      el('div', { class: 'stat-val' }, value),
      el('div', { class: 'stat-lbl' }, label)
    );

    replaceContent(ui.results,
      // Section 1: Hero Card with Score & Rank
      el('div', { class: 'results-hero-card' },
        el('p', { class: 'eyebrow' }, `Simulation Complete \u00B7 ${data.title}`),
        el('div', { class: 'hero-score-ring' }, `${percent}%`),
        el('h1', { class: 'rank-title' }, rank.title),
        el('p', { class: 'rank-desc' }, rank.text),
        el('div', { class: 'feedback-callout' },
          el('strong', null, '💡 Performance Analysis: '),
          el('span', null, tip)
        )
      ),

      // Section 2: Stat Grid Card
      el('div', { class: 'results-card' },
        el('h2', { class: 'card-title' }, '📈 Key Metrics'),
        el('div', { class: 'stat-grid' },
          stat(`${points}/${maxPoints}`, 'Total Points', '🎯'),
          stat(`${exact}/${answers.length}`, 'Best Verdicts', '✅'),
          stat(String(fellFor), 'False Believed', '⚠️'),
          stat(String(dismissed), 'Credible Dismissed', '❌'),
          stat(formatDuration(totalMs), 'Total Duration', '⏱️'),
          stat(formatDuration(avgMs), 'Avg / Decision', '⚡')
        )
      ),

      // Section 3: Performance by Claim Type
      el('div', { class: 'results-card' },
        el('h2', { class: 'card-title' }, '📊 Accuracy by Claim Category'),
        el('table', { class: 'type-table' },
          el('tbody', null, byType.map((r) => {
            const pct = r.total ? Math.round((r.right / r.total) * 100) : 0;
            return el('tr', null,
              el('td', { class: 'type-label' }, r.label),
              el('td', { class: 'type-bar-cell' },
                el('div', { class: 'bar-track' },
                  el('div', { class: 'bar-fill', style: `width: ${pct}%` })
                )
              ),
              el('td', { class: 'num' }, `${r.right} / ${r.total} (${pct}%)`)
            );
          }))
        )
      ),

      // Section 4: Detailed Decision Review
      el('div', { class: 'results-card' },
        el('h2', { class: 'card-title' }, '📋 Decision Log & Review'),
        el('div', { class: 'review-list' }, answers.map((a, i) => {
          const post = a.question.post ? state.posts[a.question.post] : null;
          const acc = post ? data.accounts[post.author] : null;
          const labelText = acc ? acc.handle : 'General Claim';
          const cls = a.points === POINTS_EXACT ? 'correct' : a.points === POINTS_CLOSE ? 'partial' : 'wrong';
          const badgeText = cls === 'correct' ? '✓ Best Verdict' : cls === 'partial' ? '◑ Partial' : '✗ Incorrect';

          return el('details', { class: `review-item review-${cls}` },
            el('summary', null,
              el('span', { class: `verdict-badge badge-${cls}` }, badgeText),
              el('div', { class: 'review-header-text' },
                el('span', { class: 'muted small' }, `#${i + 1} \u00B7 ${a.phase.label} \u00B7 ${labelText}`),
                el('span', { class: 'review-claim' }, a.question.claim)
              )
            ),
            el('div', { class: 'review-body' },
              el('p', { class: 'user-choice-line' },
                el('strong', null, 'Your Choice: '), choiceById(a.choice).short,
                a.choice !== a.question.answer ? el('span', { class: 'best-choice-note' }, ` (Best Answer: ${choiceById(a.question.answer).short})`) : null
              ),
              el('p', { class: 'explain-text' }, a.question.explanation)
            )
          );
        }))
      ),

      // Section 5: Manipulation Tactics Spot Check
      techniqueOrder.length ? el('div', { class: 'results-card' },
        el('h2', { class: 'card-title' }, '🚩 Manipulation Tactics Encountered'),
        el('ul', { class: 'technique-list' }, techniqueOrder.map((t) => el('li', null,
          el('span', { class: techniqueMissed[t] ? 'tag tag-missed' : 'tag tag-spotted' }, techniqueMissed[t] ? 'Missed' : 'Spotted'),
          el('div', { class: 'tactic-detail' },
            el('strong', null, GLOSSARY[t].name),
            el('p', { class: 'muted small' }, GLOSSARY[t].def)
          )
        )))
      ) : null,

      // Section 6: Account Unmasking Directory
      el('div', { class: 'results-card' },
        el('h2', { class: 'card-title' }, '👥 Account Directory & Role Unmasking'),
        el('ul', { class: 'who-list' }, seen.map((key) => {
          const acc = data.accounts[key];
          return el('li', { class: 'who-card' },
            avatar(acc),
            el('div', { class: 'who-info' },
              el('div', { class: 'who-name-line' },
                el('strong', null, acc.name), ' ',
                el('span', { class: 'muted' }, acc.handle), ' ',
                el('span', { class: `role role-${acc.role}` }, ROLE_LABELS[acc.role] || acc.role)
              ),
              el('div', { class: 'small reveal-text' }, acc.reveal)
            )
          );
        }))
      ),

      // Action Buttons
      el('div', { class: 'results-actions' },
        el('button', { type: 'button', class: 'btn btn-primary btn-lg', onclick: () => startGame(data.id) }, '🔄 Replay Simulation'),
        el('button', { type: 'button', class: 'btn btn-outline btn-lg', onclick: () => showScreen('home') }, '🏠 Back to Dashboard')
      )
    );
  }

  /* ------------------------------------------------------------- boot */

  const TRACK_NAMES = {
    highschool: 'Track: High School',
    youngadults: 'Track: Young Adults',
    health: 'Track: Health',
    defense: 'Track: Defense',
    seniors: 'Track: Seniors'
  };

  function setDifficulty(level) {
    state.selectedDiff = level;
    document.querySelectorAll('#home-diff-selector [data-level]').forEach((btn) => {
      btn.classList.toggle('active', btn.getAttribute('data-level') === level);
    });
    renderHome();
  }

  function setTrack(trackId) {
    state.selectedTrack = trackId;
    document.querySelectorAll('#home-track-selector [data-track]').forEach((btn) => {
      btn.classList.toggle('active', btn.getAttribute('data-track') === trackId);
    });
    renderHome();
  }

  function setFormat(formatId) {
    state.selectedFormat = formatId;
    document.querySelectorAll('#home-format-selector [data-format]').forEach((btn) => {
      btn.classList.toggle('active', btn.getAttribute('data-format') === formatId);
    });
    renderHome();
  }

  document.querySelectorAll('#home-diff-selector [data-level]').forEach((btn) => {
    btn.addEventListener('click', () => setDifficulty(btn.getAttribute('data-level')));
  });

  document.querySelectorAll('#home-track-selector [data-track]').forEach((btn) => {
    btn.addEventListener('click', () => setTrack(btn.getAttribute('data-track')));
  });

  document.querySelectorAll('#home-format-selector [data-format]').forEach((btn) => {
    btn.addEventListener('click', () => setFormat(btn.getAttribute('data-format')));
  });

  renderHome();
  showScreen('home');

  // Exposed for automated testing only.
  window.SN_GAME = { state, startGame, CHOICES };
})();


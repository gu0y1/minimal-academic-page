/**
 * common.js — Shared utilities for the academic homepage.
 * Centralised header/footer + auto-loading item lists.
 *
 * ============================================================
 *  SITE CONFIG — Edit this section to update every page at once
 * ============================================================
 */
var SITE = {
  name: 'Your Name',
  nav: [
    { label: 'Research',     href: 'research/' },
    { label: 'Publications', href: 'publications/' },
    { label: 'Teaching',     href: 'teaching/' },
    { label: 'Contact',      href: 'contact/' }
  ],
  footer: '&copy; 2025 Your Name. Last updated: March 2025.'
};

/**
 * Inject the shared header and footer into the page.
 * @param {string} base - relative path to site root, e.g. '' | '../' | '../../'
 */
function initLayout(base) {
  base = base || '';

  var header = document.getElementById('site-header');
  if (header) {
    var navHtml = SITE.nav.map(function (n) {
      return '<a href="' + base + n.href + '">' + n.label + '</a>';
    }).join('');
    header.innerHTML =
      '<div class="container">' +
        '<h1><a href="' + base + '">' + SITE.name + '</a></h1>' +
        '<nav>' + navHtml + '</nav>' +
      '</div>';
  }

  var footer = document.getElementById('site-footer');
  if (footer) {
    footer.innerHTML = SITE.footer;
  }
}

/**
 * Load items from items.json and render them into a container.
 * @param {string} containerId - ID of the target container element
 * @param {string} section - 'publications' | 'research' | 'teaching'
 * @param {Object} opts
 * @param {string} opts.jsonPath - path to items.json (default: 'items.json')
 * @param {string} opts.basePath - prefix for item folder paths (default: '')
 * @param {number} opts.limit   - max items to show, 0 = all (default: 0)
 */
async function loadItems(containerId, section, opts) {
  var o = opts || {};
  var jsonPath = o.jsonPath || 'items.json';
  var basePath = o.basePath || '';
  var limit = o.limit || 0;
  var container = document.getElementById(containerId);
  if (!container) return;

  try {
    var res = await fetch(jsonPath);
    if (!res.ok) throw new Error('not found');
    var items = await res.json();

    if (items.length === 0) {
      container.innerHTML = '<p class="empty-note">No items yet.</p>';
      return;
    }

    var list = document.createElement('div');
    list.className = 'item-list';
    var display = limit > 0 ? items.slice(0, limit) : items;

    display.forEach(function (item) {
      list.appendChild(renderItem(item, section, basePath));
    });

    container.appendChild(list);
  } catch (e) {
    container.innerHTML =
      '<p class="empty-note">Run <code>python build.py</code> to generate the item list.</p>';
  }
}

function renderItem(item, section, basePath) {
  var el = document.createElement('div');
  el.className = 'item';

  // Thumbnail
  if (item.thumbnail) {
    var img = document.createElement('img');
    img.className = 'item-thumbnail';
    img.src = basePath + item.folder + '/' + item.thumbnail;
    img.alt = item.title;
    img.loading = 'lazy';
    el.appendChild(img);
  }

  var body = document.createElement('div');
  body.className = 'item-body';

  // Title
  var title = document.createElement('div');
  title.className = 'item-title';
  if (item.has_page) {
    var a = document.createElement('a');
    a.href = basePath + item.folder + '/';
    a.textContent = item.title;
    title.appendChild(a);
  } else {
    title.textContent = item.title;
  }
  body.appendChild(title);

  // Section-specific metadata
  if (section === 'publications') {
    if (item.authors) addMeta(body, item.authors, true);
    if (item.venue || item.year) {
      var v = '<em>' + (item.venue || '') + '</em>';
      if (item.year) v += ', ' + item.year;
      addMeta(body, v, true);
    }
  } else if (section === 'research') {
    if (item.status) addMeta(body, item.status);
  } else if (section === 'teaching') {
    var parts = [item.semester, item.role].filter(Boolean).join(' · ');
    if (parts) addMeta(body, parts);
  }

  // Summary
  if (item.summary) {
    var sum = document.createElement('div');
    sum.className = 'item-summary';
    sum.textContent = item.summary;
    body.appendChild(sum);
  }

  // Tags
  if (item.tags && item.tags.length) {
    var tags = document.createElement('div');
    tags.className = 'item-tags';
    item.tags.forEach(function (t) {
      var span = document.createElement('span');
      span.className = 'tag';
      span.textContent = t;
      tags.appendChild(span);
    });
    body.appendChild(tags);
  }

  // Links (publications)
  if (item.links) {
    var links = document.createElement('div');
    links.className = 'item-links';
    Object.keys(item.links).forEach(function (label) {
      var la = document.createElement('a');
      la.href = item.links[label];
      la.textContent = '[' + label + ']';
      links.appendChild(la);
    });
    body.appendChild(links);
  }

  el.appendChild(body);
  return el;
}

function addMeta(parent, html, useHtml) {
  var d = document.createElement('div');
  d.className = 'item-meta';
  if (useHtml) d.innerHTML = html; else d.textContent = html;
  parent.appendChild(d);
}

/* MebTech Search Routing — IQIT search form -> native PrestaShop results.
 * Only changes form submission, not IQIT autocomplete/suggestion endpoints.
 * Works with the existing Warehouse desktop and mobile search forms.
 * No effect on product/category pages or Amazzing Filter itself.
 */
(function () {
  'use strict';

  var FORM_SELECTOR = '#search_widget form, #search-widget-mobile form';
  var IQIT_PARAMS = ['fc', 'module', 'controller'];

  function searchUrl() {
    var first = window.location.pathname.split('/')[1];
    var language = first === 'uk' || first === 'ru'
      ? first
      : (document.documentElement.lang || '').toLowerCase().indexOf('ru') === 0
        ? 'ru'
        : 'uk';
    return window.location.origin + '/' + language + '/search';
  }

  function adaptForm(form) {
    if (!form || form.tagName !== 'FORM') return;
    var query = form.querySelector('input[name="s"]');
    if (!query) return;

    // Keep data-search-controller-url untouched: IQIT autocomplete can
    // continue to query its own endpoint while Enter/search submits natively.
    form.setAttribute('action', searchUrl());
    IQIT_PARAMS.forEach(function (name) {
      form.querySelectorAll('input[type="hidden"][name="' + name + '"]')
        .forEach(function (input) { input.remove(); });
    });
  }

  function adaptScope(root) {
    if (!root || root.nodeType !== 1) return;
    if (root.matches && root.matches(FORM_SELECTOR)) adaptForm(root);
    if (root.querySelectorAll) {
      root.querySelectorAll(FORM_SELECTOR).forEach(adaptForm);
    }
  }

  function boot() {
    document.querySelectorAll(FORM_SELECTOR).forEach(adaptForm);

    // Reapply just before a native submission if another script has
    // restored the old action. Capture phase runs before bubble listeners.
    document.addEventListener('submit', function (event) {
      var form = event.target;
      if (form && form.matches && form.matches(FORM_SELECTOR)) {
        adaptForm(form);
      }
    }, true);

    // Some Warehouse/mobile header variants are inserted after page load.
    var observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        mutation.addedNodes.forEach(adaptScope);
      });
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }
})();

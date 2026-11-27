/* MebTech PDP — display native "Відпускається" unit next to price.
 * Presentation only: no price calculation, checkout, cart or stock changes.
 * Independent opt-in asset for immediate rollback.
 */
(function () {
  'use strict';
  var root = document.querySelector('#main-product-wrapper');
  if (!root || window.MebTechPDPSaleUnit) return;

  var BAD_VALUES = /^(?:-|—|–|н\/д|немає|не вказано|не указано|undefined|null)$/i;
  var UNIT_CLASS = 'mt-pdp-sale-unit';
  var PRICE_SELECTOR = '.product-prices .current-price';

  function text(node) {
    return ((node && node.textContent) || '').replace(/\s+/g, ' ').trim();
  }

  function saleUnit() {
    // Source of truth: native PrestaShop product feature, not product name.
    var lists = root.querySelectorAll('.product-features dl.data-sheet, #product-details dl.data-sheet');
    for (var i = 0; i < lists.length; i++) {
      var children = lists[i].children;
      for (var j = 0; j < children.length - 1; j++) {
        if (children[j].tagName !== 'DT' || children[j + 1].tagName !== 'DD') continue;
        var label = text(children[j]).replace(/\s*[:：]\s*$/, '').toLowerCase();
        if (label !== 'відпускається' && label !== 'отпускается') continue;
        var value = text(children[j + 1]);
        if (!value || value.length > 50 || BAD_VALUES.test(value)) return '';
        return value;
      }
    }
    return '';
  }

  function sync() {
    if (!root.isConnected) return;
    var price = root.querySelector(PRICE_SELECTOR);
    var existing = root.querySelector('.' + UNIT_CLASS);
    var unit = saleUnit();
    if (!price || !unit || !text(price.querySelector('[itemprop="price"], .current-price-value, .price'))) {
      if (existing) existing.remove();
      return;
    }
    if (!existing) {
      existing = document.createElement('span');
      existing.className = UNIT_CLASS;
      existing.setAttribute('aria-label', /^ru/i.test(document.documentElement.lang || '') ? 'Цена за единицу продажи' : 'Ціна за одиницю продажу');
    }
    if (existing.parentNode !== price) price.appendChild(existing);
    var display = '/ ' + unit;
    if (existing.textContent !== display) existing.textContent = display;
  }

  function boot() {
    if (!document.querySelector('#' + 'mt-pdp-sale-unit-style')) {
      var style = document.createElement('style');
      style.id = 'mt-pdp-sale-unit-style';
      style.textContent = '.' + UNIT_CLASS + '{display:inline-block;margin-inline-start:.5rem;font-size:.55em;font-weight:500;color:var(--color-text-secondary,#5F5E5A);vertical-align:baseline;white-space:nowrap}';
      document.head.appendChild(style);
    }
    var timer = null;
    function schedule() {
      clearTimeout(timer);
      timer = setTimeout(sync, 100);
    }
    sync();
    if (window.prestashop && typeof window.prestashop.on === 'function') {
      window.prestashop.on('updatedProduct', schedule);
    }
    root.addEventListener('change', function (event) {
      if (event.target.closest && event.target.closest('.product-variants')) schedule();
    });
    var observer = new MutationObserver(function (mutations) {
      for (var i = 0; i < mutations.length; i++) {
        var m = mutations[i];
        if (m.target.closest && m.target.closest('.' + UNIT_CLASS)) continue;
        if (m.target.closest && (m.target.closest('.product-prices') ||
            m.target.closest('.product-features') || m.target.closest('#product-details'))) {
          schedule();
          return;
        }
      }
    });
    observer.observe(root, {childList:true,subtree:true,characterData:true});
    window.MebTechPDPSaleUnit = {version:'test-1',sync:sync};
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, {once:true});
  } else {
    boot();
  }
}());

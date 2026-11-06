/* MebTech PDP · price clarification placement · 2026-11-06
   Moves the ORIGINAL price information node immediately after native .product-prices.
   No copy, price, stock, service, order, payment or carrier rules modified. */
(function () {
  'use strict';
  var root = document.querySelector('#main-product-wrapper.mt-pdp-v4.mt-pdp-v5');
  if (!root || window.MebTechPriceInfoPlacement07) return;

  function sync() {
    var purchase = root.querySelector('.mt-pdp-v4-purchase');
    if (!purchase) return;
    var prices = purchase.querySelector('.product-prices');
    var info = purchase.querySelector('.delivery-information');
    if (!prices || !info || prices.contains(info)) return;

    // Keep the real text node, not a duplicate or a recreated message.
    // Use the native product-prices as a stable anchor after AJAX combinations.
    if (info.parentElement !== prices.parentElement ||
        info.previousElementSibling !== prices) {
      prices.insertAdjacentElement('afterend', info);
    }
    info.classList.add('mt-pdp-price-info-attached');
    prices.classList.add('mt-pdp-has-price-info');
  }

  var timer;
  function schedule() {
    window.clearTimeout(timer);
    timer = window.setTimeout(sync, 180);
  }
  document.addEventListener('change', function (event) {
    if (root.contains(event.target) && event.target.closest &&
        event.target.closest('.product-variants')) schedule();
  });
  if (window.prestashop && typeof window.prestashop.on === 'function') {
    window.prestashop.on('updatedProduct', schedule);
    window.prestashop.on('handleError', schedule);
  }
  window.MebTechPriceInfoPlacement07 = {version:'07',sync:schedule};
  schedule();
}());

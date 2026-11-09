/* MebTech PDP: half-sheet preorder status PRESENTATION ONLY · 2026-11-06
   Confirmed rule: choosing half sheet always displays "Під замовлення".
   Never replace the native stock node/content, AJAX logic, price, cart,
   readiness, delivery terms or return policies. */
(function () {
  'use strict';
  var root = document.querySelector('#main-product-wrapper.mt-pdp-v4.mt-pdp-v5');
  if (!root || window.MebTechHalfPreorderUI) return;

  function sync() {
    var nativeStatus = root.querySelector('#product-availability');
    var overlay = root.querySelector('.mt-pdp-half-preorder-status');
    var half = root.classList.contains('mt-pdp-v4-half-selected');

    if (!nativeStatus || !half) {
      root.classList.remove('mt-pdp-half-preorder-ui');
      if (overlay) overlay.remove();
      return;
    }

    if (!overlay) {
      overlay = document.createElement('span');
      overlay.className = 'mt-pdp-half-preorder-status';
      overlay.setAttribute('role', 'status');
      overlay.setAttribute('aria-live', 'polite');
      overlay.textContent = window.MebTechI18n.t("preorder");
    }

    // Place alongside, not inside, the real PrestaShop availability element.
    // Native status remains unchanged for PrestaShop and AJAX to own.
    if (overlay.parentNode !== nativeStatus.parentNode ||
        overlay.previousElementSibling !== nativeStatus) {
      nativeStatus.insertAdjacentElement('afterend', overlay);
    }
    root.classList.add('mt-pdp-half-preorder-ui');
  }

  function afterCore() {
    window.requestAnimationFrame(sync);
    window.setTimeout(sync, 180);
  }
  document.addEventListener('change', function (event) {
    if (root.contains(event.target) && event.target.closest &&
        event.target.closest('.product-variants')) afterCore();
  });
  if (window.prestashop && typeof window.prestashop.on === 'function') {
    window.prestashop.on('updatedProduct', afterCore);
    window.prestashop.on('handleError', afterCore);
  }
  window.MebTechHalfPreorderUI = { version: '1.0', sync: afterCore };
  afterCore();
}());

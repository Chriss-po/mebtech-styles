/* MebTech PDP · Low-stock quantity + warning · TEST / opt-in.
 * For last-items only; keeps PDP core as owner of inventory and variant state.
 * Does not infer a quantity or change stock, price, checkout or order logic.
 * Remove this standalone script to roll back.
 */
(function () {
  'use strict';
  var root = document.querySelector('#main-product-wrapper.mt-pdp-v4.mt-pdp-v5');
  if (!root || window.MebTechLastItemsStockFix) return;

  var currentAjax = null;
  var variantPending = false;
  var timer = null;
  var isWriting = false;

  function txt(node) {
    return (node && node.textContent || '').replace(/\s+/g, ' ').trim();
  }

  function getData(input) {
    try {
      if (!input) return null;
      var node = typeof input === 'string'
        ? new DOMParser().parseFromString(input, 'text/html').querySelector('[data-product]')
        : (input.matches && input.matches('[data-product]') ? input : input.querySelector('[data-product]'));
      return node ? JSON.parse(node.getAttribute('data-product')) : null;
    } catch (error) { return null; }
  }

  function variantMatches(data) {
    if (!data || !Number.isFinite(Number(data.quantity))) return false;
    var form = root.querySelector('#add-to-cart-or-refresh');
    var id = form && form.querySelector('input[name="id_product"]');
    if (id && String(data.id_product) !== id.value) return false;
    var groups = data.attributes || {};
    var inputs = root.querySelectorAll('.product-variants [data-product-attribute], .product-variants select[name^="group["]');
    if (inputs.length && !Object.keys(groups).length) return false;
    for (var groupId in groups) {
      if (!Object.prototype.hasOwnProperty.call(groups, groupId)) continue;
      var current = null;
      root.querySelectorAll('.product-variants [name]').forEach(function (field) {
        if (field.name === 'group[' + groupId + ']' && (field.tagName === 'SELECT' || field.checked)) {
          current = String(field.value);
        }
      });
      if (current === null || current !== String(groups[groupId].id_attribute)) return false;
    }
    return true;
  }

  function halfSheetSelected() {
    var items = root.querySelectorAll('.product-variants-item');
    for (var i = 0; i < items.length; i++) {
      var group = items[i];
      if (!/формат|format/i.test(txt(group.querySelector('.form-control-label')))) continue;
      var radio = group.querySelector('input[type="radio"]:checked');
      var value = radio ? txt(radio.closest('.input-container') && radio.closest('.input-container').querySelector('.radio-label')) : '';
      var select = group.querySelector('select');
      if (!value && select && select.selectedOptions.length) value = txt(select.selectedOptions[0]);
      if (/^(половин|пів\s*лист)/i.test(value)) return true;
    }
    return false;
  }

  function clearWarning() {
    var warning = root.querySelector('.mt-pdp-last-items-warning');
    if (warning) warning.remove();
  }

  function warningAfter(label) {
    var warning = root.querySelector('.mt-pdp-last-items-warning');
    if (!warning) {
      warning = document.createElement('span');
      warning.className = 'mt-pdp-last-items-warning';
      warning.setAttribute('role', 'note');
      warning.textContent = /^ru/i.test(document.documentElement.lang || '')
        ? 'Последние единицы на складе'
        : 'Останні одиниці на складі';
    }
    if (warning.previousElementSibling !== label || warning.parentNode !== label.parentNode) {
      label.insertAdjacentElement('afterend', warning);
    }
  }

  function sync() {
    if (variantPending || isWriting || !root.isConnected) return;
    var label = root.querySelector('.mt-pdp-v4-stock');
    var status = root.querySelector('#product-availability');
    if (!label || !status || halfSheetSelected()) { clearWarning(); return; }

    // Need explicit native last-items status, not an arbitrary low numeric threshold.
    var statusText = txt(status);
    var last = /останн[іия]|last\s+(?:remaining\s+)?items/i.test(statusText);
    var unavailable = /під замовлення|під заказ|предзаказ|немає|відсутн|out of stock/i.test(statusText);
    if (!last || unavailable) { clearWarning(); return; }

    var data = currentAjax;
    if (!variantMatches(data)) data = getData(root.querySelector('#product-details-tab') || root);
    var qty = data && Number(data.quantity);
    // "last_remaining_items" and "available" are both sellable statuses.
    // Never display a number unless the current combination is verified.
    if (!variantMatches(data) || data.show_availability === false ||
        (data.availability !== 'last_remaining_items' && data.availability !== 'available') ||
        !Number.isInteger(qty) || qty <= 0) {
      clearWarning();
      return;
    }

    if (label.hidden || !txt(label)) {
      var nativeUnit = typeof data.quantity_label === 'string' ? data.quantity_label.trim() : '';
      var unit = nativeUnit && !/^(од\.?|шт\.?|штук)$/i.test(nativeUnit) ? nativeUnit : 'шт.';
      isWriting = true;
      label.textContent = 'На складі: ' + qty.toLocaleString('uk-UA') + ' ' + unit;
      label.hidden = false;
      root.classList.remove('mt-pdp-v4-stock-hidden');
      isWriting = false;
    }

    warningAfter(label);
    // Separate PDP unit module keeps the characteristic as the unit source.
    if (window.MebTechPDPSaleUnit && typeof window.MebTechPDPSaleUnit.sync === 'function') {
      window.MebTechPDPSaleUnit.sync();
    }
  }

  function schedule() {
    clearTimeout(timer);
    timer = setTimeout(sync, 220);
  }

  function boot() {
    var style = document.createElement('style');
    style.id = 'mt-pdp-last-items-style';
    style.textContent = '.mt-pdp-last-items-warning{display:block;margin-top:4px;font-size:12px;line-height:1.4;font-weight:500;color:var(--color-status-warning,#9C6B0B)}';
    if (!document.getElementById(style.id)) document.head.appendChild(style);
    root.addEventListener('change', function (event) {
      if (event.target.closest && event.target.closest('.product-variants')) {
        variantPending = true;
        currentAjax = null;
        clearWarning();
      }
    });
    if (window.prestashop && typeof window.prestashop.on === 'function') {
      window.prestashop.on('updateProduct', function () {
        variantPending = true;
        currentAjax = null;
        clearWarning();
      });
      window.prestashop.on('updatedProduct', function (response) {
        currentAjax = getData(response && response.product_details);
        variantPending = false;
        schedule();
      });
      window.prestashop.on('handleError', function () {
        variantPending = false;
        currentAjax = null;
        schedule();
      });
    }
    // Core can re-render/hide the stock node on PDP refresh; restore only
    // when the validated "last items" state still holds.
    var observer = new MutationObserver(function (mutations) {
      if (isWriting || variantPending) return;
      for (var i = 0; i < mutations.length; i++) {
        var t = mutations[i].target;
        if (!t.closest) continue;
        if (t.closest('.mt-pdp-last-items-warning')) continue;
        if (t.closest('.mt-pdp-v4-stock, #product-availability, #product-details-tab')) {
          schedule();
          return;
        }
      }
    });
    observer.observe(root, {childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['hidden','class','data-product']});
    schedule();
    window.MebTechLastItemsStockFix = {version:'test-1',sync:sync};
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
}());

/* MebTech PDP — approved delivery copy alignment · 2026-11-06
   UI copy ONLY; does not change native carrier selection, shipment availability,
   prices charged at checkout, fulfillment, pickup hours or payment logic.
   Carrier transit estimate is from Nova Poshta (1–3 days depending on route).
   Must run after PDP Core + MTP05. */
(function () {
  'use strict';
  var root = document.querySelector('#main-product-wrapper.mt-pdp-v4.mt-pdp-v5');
  if (!root || window.MebTechDeliveryCopy06) return;
  var savedPrices = new WeakMap();
  function txt(node) { return (node && node.textContent || '').replace(/\s+/g, ' ').trim(); }
  function group() {
    var dl = root.querySelector('.mt-pdp-v4-specifications dl.data-sheet, dl.data-sheet');
    if (!dl) return '';
    for (var dt = dl.firstElementChild; dt; dt = dt.nextElementSibling) {
      if (dt.tagName === 'DT' && /група\s+товару/i.test(txt(dt))) return txt(dt.nextElementSibling).toLowerCase();
    }
    return '';
  }
  function kind() {
    var g = group();
    var name = txt(root.querySelector('.mt-pdp-v5-identity h1, .page-title')).toLowerCase();
    var service = /послуг|порізк|розкр|допил|крайкуван|свердлінн|присадк/.test(g) ||
      /^(послуг|порізк|розкр|допил|крайкуван|свердлінн|присадк)/.test(name);
    // Only confirmed furniture-hardware groups get explicit NP prices.
    // Product-title fallback is deliberately conservative.
    var hardware = !service && (
      /фурнітур|фурнитур|кріплен|крепеж|петель|петл[ія]|напрямн|направляющ|ручк[аи]|меблев(і|ої)\s+опор|механізм|механизм|газліфт|газлифт|підйомник|замк[иі]|доводчик|демпфер/.test(g) ||
      /^(ручка меблев|петля меблев|напрямн|направляющ|газліфт|підйомник|доводчик|меблев[аи]\s+опор)/.test(name)
    );
    return { service: service, hardware: hardware };
  }
  function setOptionSub(option, copy) {
    var subtitle = option && option.querySelector('.delivery-sub');
    if (subtitle && txt(subtitle) !== copy) subtitle.textContent = copy;
  }
  function updateCarrierPrice(option, hardware) {
    if (!option) return;
    var price = option.querySelector('.delivery-price');
    if (!price) return;
    // Save the original provider price markup once, then restore it if
    // PrestaShop switches to a hardware item without replacing the node.
    if (!savedPrices.has(price)) savedPrices.set(price, {
      html: price.innerHTML,
      free: price.classList.contains('free')
    });
    if (hardware) {
      if (price.classList.contains('mt-dc06-tariff')) {
        var stored = savedPrices.get(price);
        price.innerHTML = stored.html;
        price.classList.toggle('free', stored.free);
        price.classList.remove('mt-dc06-tariff');
      }
    } else {
      if (!price.classList.contains('mt-dc06-tariff')) {
        // Preserve the newest native price if a combination AJAX swapped it.
        savedPrices.set(price, {html:price.innerHTML, free:price.classList.contains('free')});
      }
      price.textContent = 'За тарифами перевізника';
      price.classList.remove('free');
      price.classList.add('mt-dc06-tariff');
    }
  }
  function update() {
    var card = root.querySelector('#mt-pdp-v4-panel-shipping #iqithtmlandbanners-block-3 .delivery-card');
    if (!card) return;
    var m = kind();
    var city = card.querySelector('.content-mykolaiv');
    var country = card.querySelector('.content-other');
    if (!city || !country) return;
    var cityOptions = Array.prototype.slice.call(city.querySelectorAll(':scope > .delivery-option'));
    var countryOptions = Array.prototype.slice.call(country.querySelectorAll(':scope > .delivery-option'));
    if (m.service) {
      // Changes copy only: no action on availability/hide flags.
      cityOptions.forEach(function (option) {
        var title = txt(option.querySelector('.delivery-left > div:not(.delivery-icon) > div:first-child'));
        if (/самовивіз/i.test(title)) setOptionSub(option, 'Після підтвердження готовності майстром');
        else if (/нов(ої|а|ою)\s+пошт/i.test(title)) setOptionSub(option, 'Після підтвердження готовності майстром, орієнтовно 1–3 дні в дорозі');
        else setOptionSub(option, 'Після підтвердження готовності майстром');
      });
      countryOptions.forEach(function (option) {
        setOptionSub(option, 'Після підтвердження готовності майстром, орієнтовно 1–3 дні в дорозі');
      });
    }
    // Native shipping prices only remain displayed for confirmed hardware.
    // Every other goods/service class shows provider tariffs for NP options.
    cityOptions.concat(countryOptions).forEach(function (option) {
      var title = txt(option.querySelector('.delivery-left > div:not(.delivery-icon) > div:first-child'));
      if (/нов(ої|а|ою)\s+пошт|кур.?єр/i.test(title)) updateCarrierPrice(option, m.hardware);
    });
  }
  var scheduled = false;
  function schedule() {
    if (scheduled) return;
    scheduled = true;
    window.setTimeout(function () {
      scheduled = false;
      try { update(); } catch (error) { if (window.console) console.warn('[MebTech Delivery Copy 06]', error); }
    }, 260);
  }
  document.addEventListener('change', function (event) {
    if (root.contains(event.target) && event.target.closest &&
        event.target.closest('.product-variants, .city-switch')) schedule();
  });
  if (window.prestashop && typeof window.prestashop.on === 'function') {
    window.prestashop.on('updatedProduct', schedule);
    window.prestashop.on('handleError', schedule);
  }
  window.MebTechDeliveryCopy06 = {version:'06', sync:schedule};
  schedule();
}());

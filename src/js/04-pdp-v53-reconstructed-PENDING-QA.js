/* ARCHIVED / PENDING FULL LIVE JS VERIFICATION. Reconstructed from core v5.3 and approved REPLACEMENT 05; PATCH02 JS is not recovered. Do NOT load as a second PDP script. */
/**
 * MebTech Product Detail v5.3 — Editorial Commerce — PrestaShop + IQIT/Warehouse.
 * Replace BOTH previous PDP v1/v2 scripts; do not stack scripts.
 * The native cart, SKU, variants, stock, Slick gallery and CMS delivery/payment
 * modules remain the real, functional DOM elements. No fake product data.
 */
(function () {
  'use strict';

  var root = document.querySelector('#main-product-wrapper.product-container');
  // Some catalog-only products have no native add-to-cart form; render status-only PDP there too.
  if (!root) return;
  if (window.MebTechPDPv4 && window.MebTechPDPv4.initialized) return;

  var row = root.querySelector('.product-info-row');
  var gallery = row && row.querySelector('.col-product-image');
  var purchase = row && row.querySelector('.col-product-info');
  var aside = row && row.querySelector('.product-sidebar');
  if (!row || !gallery || !purchase || !aside) return;

  var DEBUG = false;
  function log() {
    if (!DEBUG || !window.console) return;
    console.info.apply(console, ['[MebTech PDP v5.3]'].concat(Array.prototype.slice.call(arguments)));
  }
  function stringOf(node) {
    return ((node && node.textContent) || '').replace(/\s+/g, ' ').trim();
  }
  function removeNode(node) {
    if (node && node.parentElement) node.parentElement.removeChild(node);
  }
  function firstOf(node, selectors) {
    for (var i = 0; i < selectors.length; i++) {
      var found = node.querySelector(selectors[i]);
      if (found) return found;
    }
    return null;
  }
  function ensureSlot(parent, name) {
    var slot = parent.querySelector(':scope > .' + name);
    if (!slot) {
      slot = document.createElement('div');
      slot.className = name;
      parent.appendChild(slot);
    }
    return slot;
  }

  // Cleanup of previous custom versions. This is not a dependency on them:
  // it also works on original unmodified IQIT markup.
  function removeLegacyPDP() {
    root.querySelectorAll('.mt-pdp-features-copy, .mt-pdp-v2-photo-dots, .mt-pdp-v2-brand')
      .forEach(removeNode);
    root.querySelectorAll('.mt-pdp-features-native-hidden, .mt-pdp-description-native-hidden, .mt-pdp-native-tab-hidden')
      .forEach(function (node) {
        node.classList.remove('mt-pdp-features-native-hidden', 'mt-pdp-description-native-hidden', 'mt-pdp-native-tab-hidden');
      });
    removeNode(root.querySelector('#mt-pdp-description')); // v1-only generated content
    root.classList.remove('mt-pdp-v2', 'mt-pdp-v3');
    row.classList.remove('mt-pdp-grid', 'mt-pdp-v2-row', 'mt-pdp-v3-row');
    gallery.classList.remove('mt-pdp-gallery-col', 'mt-pdp-v2-gallery', 'mt-pdp-v3-gallery');
    purchase.classList.remove('mt-pdp-buy-col', 'mt-pdp-v2-purchase', 'mt-pdp-v3-purchase');
    aside.classList.remove('mt-pdp-aside', 'mt-pdp-v2-aside', 'mt-pdp-v3-aside');
    document.body.classList.remove('mt-pdp-ready');
  }

  function prepareFeatures() {
    var nativeFeatures = Array.prototype.find.call(
      aside.querySelectorAll('.product-features'),
      function (node) { return !node.classList.contains('mt-pdp-features-copy'); }
    );
    if (!nativeFeatures) return;
    var headings = Array.prototype.slice.call(aside.querySelectorAll('.block-title'));
    var heading = headings.find(function (node) { return /характеристик/i.test(stringOf(node)); });
    var holder = ensureSlot(aside, 'mt-pdp-v4-specifications');
    if (aside.firstElementChild !== holder) aside.insertBefore(holder, aside.firstChild);
    if (heading && heading.parentElement !== holder) holder.insertBefore(heading, holder.firstChild);
    nativeFeatures.classList.remove('mt-pdp-features-native-hidden');
    // Do not reappend on every AJAX refresh: the disclosure button must stay BELOW the list.
    if (nativeFeatures.parentElement !== holder) holder.appendChild(nativeFeatures);

    // Remove ONLY empty containers left by the previous custom script.
    aside.querySelectorAll('.mt-pdp-features-slot, .mt-pdp-v2-specifications').forEach(function (node) {
      if (node !== holder && !node.children.length && !stringOf(node)) removeNode(node);
    });
  }

  // Progressive disclosure: five native rows visible, all rows preserved.
  // Do not clone or change the actual product features, which may be AJAX updated.
  function prepareCompactFeatures() {
    var holder = aside.querySelector('.mt-pdp-v4-specifications');
    var list = holder && holder.querySelector('.product-features dl.data-sheet');
    if (!holder || !list) return;
    var children = Array.prototype.slice.call(list.children);
    var rows = [];
    for (var i = 0; i < children.length - 1; i++) {
      if (children[i].tagName === 'DT' && children[i + 1].tagName === 'DD') {
        rows.push([children[i], children[i + 1]]);
        i++;
      }
    }
    var button = holder.querySelector('.mt-pdp-v51-features-toggle');
    if (rows.length <= 5) {
      rows.forEach(function (pair) { pair[0].hidden = false; pair[1].hidden = false; });
      removeNode(button);
      return;
    }
    if (!list.id) list.id = 'mt-pdp-v51-feature-list';
    if (!button) {
      button = document.createElement('button');
      button.className = 'mt-pdp-v51-features-toggle';
      button.type = 'button';
      button.setAttribute('aria-controls', list.id);
      button.setAttribute('aria-expanded', 'false');
      button.addEventListener('click', function () {
        button.setAttribute('aria-expanded', button.getAttribute('aria-expanded') === 'true' ? 'false' : 'true');
        prepareCompactFeatures();
      });
      holder.appendChild(button);
    }
    var expanded = button.getAttribute('aria-expanded') === 'true';
    rows.forEach(function (pair, index) {
      pair[0].hidden = pair[1].hidden = !expanded && index >= 5;
    });
    button.textContent = expanded ? 'Згорнути характеристики' : 'Показати всі характеристики';
  }

  function findModule(id) {
    var candidates = Array.prototype.slice.call(root.querySelectorAll('[id="' + id + '"]'));
    if (!candidates.length) return null;
    var form = root.querySelector('#add-to-cart-or-refresh');
    // A module inside the purchase form is the original IQIT source, preferred
    // over a stale clone left by previous custom scripts.
    return candidates.find(function (node) { return form && form.contains(node); }) || candidates[0];
  }

  // Native CMS modules are moved once into semantic, keyboard-accessible
  // accordions. Internal city radio controls and payment markup are preserved.
  function ensureAccordion(holder, key, title) {
    var section = holder.querySelector('.mt-pdp-v4-accordion[data-panel="' + key + '"]');
    if (section) return section;
    section = document.createElement('section');
    section.className = 'mt-pdp-v4-accordion';
    section.dataset.panel = key;
    var button = document.createElement('button');
    button.type = 'button';
    button.className = 'mt-pdp-v4-accordion-trigger';
    button.id = 'mt-pdp-v4-trigger-' + key;
    button.setAttribute('aria-expanded', 'false');
    button.setAttribute('aria-controls', 'mt-pdp-v4-panel-' + key);
    button.textContent = title;
    var content = document.createElement('div');
    content.id = 'mt-pdp-v4-panel-' + key;
    content.className = 'mt-pdp-v4-accordion-panel';
    content.setAttribute('role', 'region');
    content.setAttribute('aria-labelledby', button.id);
    content.hidden = true;
    button.addEventListener('click', function () {
      // Native-style disclosure: content appears directly below its trigger.
      // Do not change scroll position when opening or closing.
      var open = button.getAttribute('aria-expanded') === 'true';
      button.setAttribute('aria-expanded', String(!open));
      content.hidden = open;
    });
    section.appendChild(button);
    section.appendChild(content);
    holder.appendChild(section);
    return section;
  }

  function preserveFormAssociation(module, form) {
    if (!module || !form || !form.id || !form.contains(module)) return;
    module.querySelectorAll('input[name], select[name], textarea[name]').forEach(function (field) {
      if (!field.hasAttribute('form')) field.setAttribute('form', form.id);
    });
  }

  function prepareCMSModules() {
    var delivery = findModule('iqithtmlandbanners-block-3');
    var payment = findModule('iqithtmlandbanners-block-4');
    if (!delivery && !payment) return;
    var holder = ensureSlot(purchase, 'mt-pdp-v4-delivery-and-payment');
    var purchaseForm = root.querySelector('#add-to-cart-or-refresh');
    [delivery, payment].forEach(function (module) {
      preserveFormAssociation(module, purchaseForm);
    });

    var shipping = ensureAccordion(holder, 'shipping', 'Доставка й оплата');
    var returns = ensureAccordion(holder, 'returns', 'Повернення й обмін');
    var shippingPanel = shipping.querySelector('.mt-pdp-v4-accordion-panel');
    var returnsPanel = returns.querySelector('.mt-pdp-v4-accordion-panel');
    // Some IQIT versions replace .product-additional-info on each combination
    // refresh. Retain only the newest source; never create duplicate CMS IDs.
    [delivery, payment].forEach(function (module) {
      if (!module) return;
      var old = shippingPanel.querySelector('[id="' + module.id + '"]');
      if (old && old !== module) removeNode(old);
      if (module.parentElement !== shippingPanel) shippingPanel.appendChild(module);
    });

    // Take the original warranty/returns paragraph out of the payment CMS block.
    // It includes the store's own return-policy link; never invent legal rules.
    var paymentBody = payment && payment.querySelector('.rte-content > div');
    var returnParagraph = paymentBody && Array.prototype.find.call(paymentBody.children, function (child) {
      return !!child.querySelector('a[href*="povernennya"]');
    });
    if (returnParagraph && returnParagraph.parentElement !== returnsPanel) {
      // A fresh CMS fragment may also replace the old returns paragraph.
      // Keep exactly one real source of terms, not old + new duplicates.
      Array.prototype.forEach.call(returnsPanel.children, removeNode);
      returnsPanel.appendChild(returnParagraph);
    }
    // If the store CMS content differs, only link the real existing policy.
    if (!returnsPanel.children.length) {
      var link = document.querySelector('a[href*="pravila-povernennya-ta-obminu"]');
      if (link && link.href) {
        var p = document.createElement('p');
        p.className = 'mt-pdp-v4-return-link';
        var a = document.createElement('a');
        a.href = link.href;
        a.textContent = 'Переглянути правила повернення та обміну';
        p.appendChild(a);
        returnsPanel.appendChild(p);
      } else {
        // Avoid empty nonfunctional accordion if no verified policy source.
        returns.hidden = true;
      }
    }
    // Remove only empty containers created by older PDP variants.
    root.querySelectorAll('.mt-pdp-delivery-slot, .mt-pdp-v2-delivery-and-payment, .mt-pdp-v3-delivery-and-payment').forEach(function (node) {
      if (node !== holder && !node.children.length && !stringOf(node)) removeNode(node);
    });
  }

  function prepareBrand() {
    var header = purchase.querySelector('.product_header_container');
    var h1 = header && header.querySelector('h1.page-title');
    if (!header || !h1 || header.querySelector('.mt-pdp-v4-brand') || aside.querySelector('.mt-pdp-v5-identity .mt-pdp-v4-brand')) return;
    var source = root.querySelector('#product-details .product-manufacturer a[href]');
    var image = source && source.querySelector('img[alt]');
    var brandName = image && image.getAttribute('alt');
    if (!brandName || !brandName.trim()) return;
    var link = document.createElement('a');
    link.className = 'mt-pdp-v4-brand';
    link.href = source.href;
    link.textContent = brandName.trim();
    h1.insertAdjacentElement('beforebegin', link);
  }

  // Product reference: one native SKU, no badge; leading copy action.
  // Copy always reads the CURRENT [itemprop="sku"], not the initial product.
  function prepareSkuCopy() {
    var ref = aside.querySelector('.mt-pdp-v5-identity > .product-reference') || purchase.querySelector('.product-prices > .product-reference');
    var value = ref && ref.querySelector('[itemprop="sku"]');
    if (!ref || !value || !stringOf(value)) return;
    var button = ref.querySelector('.mt-pdp-v4-copy-sku');
    if (!button) {
      button = document.createElement('button');
      button.type = 'button';
      button.className = 'mt-pdp-v4-copy-sku';
      button.setAttribute('aria-label', 'Скопіювати артикул');
      button.title = 'Скопіювати артикул';
      button.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><rect x="8" y="8" width="12" height="12" rx="2"></rect><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"></path></svg>';
      var feedback = document.createElement('span');
      feedback.className = 'mt-pdp-v4-sr-only mt-pdp-v4-copy-feedback';
      feedback.setAttribute('role', 'status');
      feedback.setAttribute('aria-live', 'polite');
      ref.insertBefore(button, ref.firstChild);
      ref.appendChild(feedback);
      button.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        var sku = stringOf(ref.querySelector('[itemprop="sku"]'));
        if (!sku) return;
        var copyFallback = function () {
          var field = document.createElement('textarea');
          field.value = sku;
          field.setAttribute('readonly', '');
          field.style.cssText = 'position:fixed;top:-9999px;left:-9999px;opacity:0';
          document.body.appendChild(field);
          field.select();
          var ok = false;
          try { ok = document.execCommand('copy'); } catch (err) { ok = false; }
          document.body.removeChild(field);
          return ok;
        };
        var setFeedback = function (success) {
          if (!button.isConnected) return;
          var message = success ? 'Артикул скопійовано' : 'Не вдалося скопіювати артикул';
          button.title = message;
          button.setAttribute('aria-label', message);
          button.dataset.copied = String(success);
          feedback.textContent = message;
          if (button._mtCopyTimeout) clearTimeout(button._mtCopyTimeout);
          button._mtCopyTimeout = setTimeout(function () {
            if (!button.isConnected) return;
            button.title = 'Скопіювати артикул';
            button.setAttribute('aria-label', 'Скопіювати артикул');
            button.dataset.copied = '';
          }, 1500);
        };
        if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
          navigator.clipboard.writeText(sku).then(function () {
            setFeedback(true);
          }, function () {
            setFeedback(copyFallback());
          });
        } else {
          setFeedback(copyFallback());
        }
      });
    }
  }


  /* PDP v5 editorial composition.
     Left: native brand/title/SKU + original features and short description.
     Centre: original Slick gallery. Right: native prices, cart and CMS panels.
     Moving nodes (not cloning) retains existing IQIT and PrestaShop handlers. */
  function prepareEditorialColumns() {
    var identity = ensureSlot(aside, 'mt-pdp-v5-identity');
    var spec = aside.querySelector('.mt-pdp-v4-specifications');
    if (identity !== aside.firstElementChild) aside.insertBefore(identity, aside.firstChild);
    var header = purchase.querySelector('.product_header_container');
    if (header) {
      var title = header.querySelector('h1.page-title');
      var brand = header.querySelector('.mt-pdp-v4-brand');
      if (title) {
        var oldTitle = identity.querySelector('h1.page-title');
        if (oldTitle && oldTitle !== title) removeNode(oldTitle);
        identity.appendChild(title);
      }
      if (brand) identity.insertBefore(brand, identity.firstChild);
      var freshReference = header.querySelector('.product-prices > .product-reference');
      if (freshReference) {
        var oldReference = identity.querySelector('.product-reference');
        if (oldReference && oldReference !== freshReference) removeNode(oldReference);
        identity.appendChild(freshReference);
      }
    }
    if (spec && spec.previousElementSibling !== identity) {
      identity.insertAdjacentElement('afterend', spec);
    }
    var context = ensureSlot(aside, 'mt-pdp-v5-context');
    if (spec && context.previousElementSibling !== spec) spec.insertAdjacentElement('afterend', context);
    // Move native short description below the real purchase button ONLY on
    // purchasable product pages. Do not move it into a hidden purchase form
    // on catalog/status-only pages (including native missing/zero prices).
    // Prefer fresh PrestaShop AJAX content over stale moved description.
    var freshDescription = purchase.querySelector('.product-information [id^="product-description-short"]');
    var oldDescription = purchase.querySelector(':scope > [id^="product-description-short"]') ||
      context.querySelector('[id^="product-description-short"]');
    if (freshDescription && oldDescription && freshDescription !== oldDescription) removeNode(oldDescription);
    var description = freshDescription || oldDescription;
    var nativeInfo = purchase.querySelector('.product-information');
    var addToCart = nativeInfo && nativeInfo.querySelector('.product-add-to-cart');
    var button = addToCart && addToCart.querySelector('button.add-to-cart[data-button-action="add-to-cart"]');
    var priceNode = purchase.querySelector('.product-prices [itemprop="price"], .product-prices .product-price');
    var rawPrice = priceNode && (priceNode.getAttribute('content') || stringOf(priceNode));
    var priceAmount = rawPrice ? Number(String(rawPrice).replace(/\u00a0/g, '').replace(/\s/g, '').replace(/,(?=\d{1,2}$)/, '.').replace(/[^0-9.]/g, '')) : NaN;
    var purchasable = !!(button && !button.disabled && Number.isFinite(priceAmount) && priceAmount > 0 &&
      nativeInfo && window.getComputedStyle(nativeInfo).display !== 'none');
    if (description && purchasable && addToCart) {
      if (description.parentElement !== addToCart.parentElement ||
          description.previousElementSibling !== addToCart) {
        addToCart.insertAdjacentElement('afterend', description);
      }
      description.classList.add('mt-pdp-short-after-cart');
      description.classList.remove('mt-pdp-short-no-cart');
    } else if (description && nativeInfo) {
      // Restore a visible position immediately after price/status, outside
      // the form that PDP no-price rules can hide. Never delete the copy.
      var header = purchase.querySelector('.product_header_container');
      var anchor = purchase.querySelector('.delivery-information.mt-pdp-price-info-attached') || header;
      if (anchor && (description.parentElement !== purchase ||
          description.previousElementSibling !== anchor)) {
        anchor.insertAdjacentElement('afterend', description);
      }
      description.classList.remove('mt-pdp-short-after-cart');
      description.classList.add('mt-pdp-short-no-cart');
    }
    // Retain all real content, but remove empty old wrappers when safe.
    aside.querySelectorAll('.mt-pdp-features-slot, .mt-pdp-delivery-slot').forEach(function (empty) {
      if (!empty.children.length && !stringOf(empty)) removeNode(empty);
    });
  }

  // IQIT can append a fresh share component on each combination refresh.
  // Remove all existing share components from PDP instead of relocating them.
  // This is intentionally scoped to the product container (not the site header).
  function removeProductSocialSharing() {
    root.querySelectorAll('.social-sharing, .product-social-sharing').forEach(removeNode);
  }

  // A moved native SKU lies outside PrestaShop's AJAX replacement subtree.
  // Update it from an explicitly REFRESHED combination response, not from the
  // embedded base-product reference (which can stay unchanged across variants).
  var confirmedAjaxSku = null;
  var skuRefreshAttempted = false;
  var initialSku = null;
  function extractSkuFromResponse(response) {
    if (!response || typeof response !== 'object') return null;
    var fragments = [response.product_details, response.product_reference,
      response.product_prices, response.product_details_html];
    for (var i = 0; i < fragments.length; i++) {
      if (typeof fragments[i] !== 'string' || !fragments[i].trim()) continue;
      var doc = new DOMParser().parseFromString(fragments[i], 'text/html');
      var skuElement = doc.querySelector('.product-reference [itemprop="sku"], .product-reference span:not(.label)');
      var text = stringOf(skuElement);
      if (text) return text;
    }
    // Explicit serialized combination reference is safer than parent SKU.
    if (typeof response.reference_to_display === 'string' && response.reference_to_display.trim()) {
      return response.reference_to_display.trim();
    }
    if (response.product && typeof response.product.reference_to_display === 'string' &&
        response.product.reference_to_display.trim()) {
      return response.product.reference_to_display.trim();
    }
    // The product_details fragment can also supply embedded data-product JSON.
    var fresh = parseProductData(response.product_details);
    if (fresh && selectedCombinationMatches(fresh) &&
        fresh.id_product_attribute != null) {
      var attributes = fresh.attributes || {};
      for (var key in attributes) {
        if (Object.prototype.hasOwnProperty.call(attributes,key) &&
            typeof attributes[key].reference === 'string' && attributes[key].reference.trim()) {
          return attributes[key].reference.trim();
        }
      }
      // Do NOT fall back to fresh.reference: it can be the common base-product
      // article, not the selected combination SKU. If the theme omits a variant
      // reference, keep it hidden until PrestaShop supplies one.
    }
    return null;
  }
  function syncEditorialSku() {
    var ref = aside.querySelector('.mt-pdp-v5-identity .product-reference');
    if (!ref) return;
    var node = ref.querySelector('[itemprop="sku"]');
    if (!node) return;
    if (initialSku === null) initialSku = stringOf(node);
    if (variantPending) {
      ref.classList.add('mt-pdp-v52-sku-pending');
      return;
    }
    if (!skuRefreshAttempted) {
      ref.classList.remove('mt-pdp-v52-sku-pending');
      return;
    }
    var value = confirmedAjaxSku;
    if (!value) {
      var data = parseProductData(root.querySelector('#product-details-tab') || root);
      // Page markup can be re-rendered after updatedProduct; only consider a
      // clearly matched combination, never a stale parent SKU.
      if (data && selectedCombinationMatches(data) && data.id_product_attribute != null &&
          typeof data.reference_to_display === 'string') value = data.reference_to_display.trim();
    }
    if (value) {
      node.textContent = value;
      ref.classList.remove('mt-pdp-v52-sku-pending');
    } else {
      // Missing data is NOT a reason to display the previous combination SKU.
      node.textContent = '';
      ref.classList.add('mt-pdp-v52-sku-pending');
      log('No trusted SKU in AJAX response; hiding previous combination reference.');
    }
  }

  function syncAvailabilityPresentation() {
    var node = purchase.querySelector('#product-availability');
    if (!node) return;
    var label = stringOf(node).toLowerCase();
    var kind = /під замовлення|предзамовлення|передзамовлен|під заказ|pre.?order/i.test(label)
      ? 'preorder'
      : (/немає|відсутн|немає в наявності|out of stock/i.test(label)
        ? 'unavailable'
        : (node.classList.contains('product-available') || /в наявності|на складі|in stock/i.test(label))
          ? 'available' : 'neutral');
    node.dataset.mtPdpStatus = kind;
  }

  // Empty tab sometimes contains only a manufacturer logo after native
  // characteristics have been moved to the left. Keep the brand by the H1,
  // but never show its duplicate logo or an empty white details strip below.
  function cleanOrphanedDetailsTab() {
    var tabs = root.querySelector('.product-tabs');
    var details = tabs && tabs.querySelector('#product-details-tab');
    if (!details) return;
    var brand = details.querySelector('.product-manufacturer');
    if (brand) brand.hidden = true;
    var containsUsefulContent = false;
    Array.prototype.forEach.call(tabs.querySelectorAll('.tab-pane'), function (panel) {
      if (containsUsefulContent) return;
      if (panel !== details) {
        if (stringOf(panel) || panel.querySelector('img,video,a[href]')) containsUsefulContent = true;
        return;
      }
      Array.prototype.forEach.call(panel.querySelectorAll('a, p, dl, ul, table, .product-attachments, .product-out-of-stock'), function (el) {
        if (el.closest('.product-manufacturer')) return;
        if (el.closest('.product-features')) return;
        if (el.closest('.product-reference')) return;
        if (el.closest('.product-quantities')) return;
        if (stringOf(el) && !el.closest('.mt-pdp-v4-specifications')) containsUsefulContent = true;
      });
    });
    tabs.classList.toggle('mt-pdp-v52-tabs-empty', !containsUsefulContent);
  }

  function prepareQuantityLabel() {
    var quantity = purchase.querySelector('.product-quantity');
    var input = quantity && quantity.querySelector('#quantity_wanted');
    if (!quantity || !input) return;
    if (!quantity.querySelector('.mt-pdp-v4-qty-label')) {
      var label = document.createElement('label');
      label.className = 'mt-pdp-v4-qty-label';
      label.htmlFor = input.id;
      label.textContent = 'Кількість';
      quantity.insertBefore(label, quantity.firstChild);
    }
    quantity.querySelectorAll('.bootstrap-touchspin-up, .bootstrap-touchspin-down').forEach(function (button) {
      if (!button.hasAttribute('aria-label')) {
        button.setAttribute('aria-label', button.classList.contains('bootstrap-touchspin-up') ? 'Збільшити кількість' : 'Зменшити кількість');
      }
    });
  }

  // Selected-combination stock is intentionally not computed from totals.
  // PrestaShop's product-details data carries quantity for a resolved variant.
  // Suppress stock during AJAX and whenever the snapshot does not match the
  // selected combination; never show a stale quantity from another variant.
  var variantPending = false;
  var latestProductData = null;
  function parseProductData(source) {
    if (!source) return null;
    try {
      var node;
      if (typeof source === 'string') {
        var doc = new DOMParser().parseFromString(source, 'text/html');
        node = doc.querySelector('[data-product]');
      } else {
        node = source.querySelector('[data-product]');
      }
      return node ? JSON.parse(node.getAttribute('data-product')) : null;
    } catch (err) { return null; }
  }
  function selectedCombinationMatches(data) {
    if (!data || !Number.isFinite(Number(data.quantity))) return false;
    var form = root.querySelector('#add-to-cart-or-refresh');
    var idField = form && form.querySelector('input[name="id_product"]');
    if (idField && String(data.id_product) !== idField.value) return false;
    var groups = data.attributes || {};
    var inputs = root.querySelectorAll('.product-variants [data-product-attribute], .product-variants select[name^="group["]');
    if (inputs.length && !Object.keys(groups).length) return false;
    for (var groupId in groups) {
      if (!Object.prototype.hasOwnProperty.call(groups, groupId)) continue;
      var group = groups[groupId];
      var name = 'group[' + groupId + ']';
      var fields = root.querySelectorAll('.product-variants [name]');
      var current = null;
      Array.prototype.forEach.call(fields, function (field) {
        if (field.name !== name) return;
        if (field.tagName === 'SELECT' || field.checked) current = String(field.value);
      });
      if (current === null || current !== String(group.id_attribute)) return false;
    }
    return true;
  }
  function makeStockLabel() {
    var quantity = purchase.querySelector('.product-quantity');
    if (!quantity) return null;
    var label = quantity.querySelector('.mt-pdp-v4-stock');
    if (!label) {
      label = document.createElement('span');
      label.className = 'mt-pdp-v4-stock';
      label.setAttribute('role', 'status');
      label.setAttribute('aria-live', 'polite');
      label.hidden = true;
      quantity.appendChild(label);
    }
    return label;
  }
  // Half-sheet is an on-demand cut, not a physical half-sheet in stock.
  // Detect by the native FORMAT group label and its CURRENT selected option,
  // never by product id, dimensions, quantity or an outdated AJAX snapshot.
  function selectedFormatGroup() {
    return Array.prototype.find.call(root.querySelectorAll('.product-variants-item'), function (group) {
      var title = stringOf(group.querySelector('.form-control-label'));
      return /формат|format/i.test(title) &&
        Array.prototype.some.call(group.querySelectorAll('.radio-label, option'), function (choice) {
          return /^(половин|пів\s*лист)/i.test(stringOf(choice));
        });
    }) || null;
  }

  function selectedFormatText(group) {
    if (!group) return '';
    var active = group.querySelector('input[type="radio"]:checked');
    if (active) {
      var container = active.closest('.input-container');
      return stringOf(container && container.querySelector('.radio-label'));
    }
    var dropdown = group.querySelector('select');
    return dropdown && dropdown.selectedOptions.length
      ? stringOf(dropdown.selectedOptions[0]) : '';
  }

  function isHalfSheet() {
    return /^(половин|пів\s*лист)/i.test(selectedFormatText(selectedFormatGroup()));
  }

  function syncHalfSheetMessage() {
    var group = selectedFormatGroup();
    var half = !!group && isHalfSheet();
    root.classList.toggle('mt-pdp-v4-half-selected', half);
    // A module may already supply this exact business notice; don't clone it.
    if (!group) return;
    var own = group.querySelector('.mt-pdp-v4-half-note');
    var elsewhere = Array.prototype.some.call(group.querySelectorAll('*'), function (el) {
      if (el.closest('.mt-pdp-v4-half-note')) return false;
      if (el.children.length) return false;
      return /мінімальн(ий|ого)\s+допил|на складі зберігаються лише цілі листи/i.test(stringOf(el));
    });
    if (!own && !elsewhere) {
      own = document.createElement('div');
      own.className = 'mt-pdp-v4-half-note';
      own.setAttribute('role', 'note');
      own.setAttribute('aria-live', 'polite');
      group.appendChild(own);
    }
    if (own) {
      // Stable, text-based symbol: no icon font or theme SVG size inheritance.
      // This block contains business copy only, NEVER adds a cutting service to cart.
      var serviceLink = 'https://mebteh.com.ua/uk/24475-12603-dopil-pitnikh-materialiv#/108-tovshhina-18/281-material-ldsp_mdf/288-raspil-minimalnij_do_4_m';
      if (!own.querySelector('.mt-pdp-v52-cut-link') || !own.querySelector('.mt-pdp-v52-info-icon')) {
        own.replaceChildren();
        var heading = document.createElement('div');
        heading.className = 'mt-pdp-v4-half-note__heading';
        var symbol = document.createElement('span');
        symbol.className = 'mt-pdp-v52-info-icon';
        symbol.setAttribute('aria-hidden', 'true');
        symbol.textContent = 'i';
        var strong = document.createElement('strong');
        strong.textContent = 'Зверніть увагу';
        heading.append(symbol, strong);
        var paragraph = document.createElement('p');
        paragraph.append('При замовленні половини листа додається послуга ');
        var a = document.createElement('a');
        a.className = 'mt-pdp-v52-cut-link';
        a.href = serviceLink;
        a.textContent = '«Допил плитних матеріалів» (арт. 41875)';
        paragraph.append(a, '. На складі зберігаються лише цілі листи.');
        own.append(heading, paragraph);
      }
      // Existing element can survive product AJAX updates: keep label/URL current.
      var currentCutLink = own.querySelector('.mt-pdp-v52-cut-link');
      if (currentCutLink) {
        currentCutLink.href = serviceLink;
        currentCutLink.textContent = '«Допил плитних матеріалів» (арт. 41875)';
      }
      own.hidden = !half;
    }
  }

  function refreshStock() {
    var label = makeStockLabel();
    if (!label) return;
    label.hidden = true;
    label.textContent = '';
    root.classList.add('mt-pdp-v4-stock-hidden');
    // Even if a PrestaShop combination has quantity > 0, a half-sheet is NOT
    // a physically stocked half-sheet. No stock number should be shown.
    if (isHalfSheet() || variantPending) return;
    var data = latestProductData;
    if (!selectedCombinationMatches(data)) {
      data = parseProductData(root.querySelector('#product-details-tab') || root);
    }
    if (!selectedCombinationMatches(data)) return;
    // Availability label is the native PrestaShop source for whether the
    // selected configuration is in stock; do not show for preorders.
    var status = root.querySelector('#product-availability');
    if (!status || !status.classList.contains('product-available') ||
        /під замовлення|немає|відсутн|передзамовлен/i.test(stringOf(status))) return;
    if (data.show_availability === false || data.availability !== 'available') return;
    var qty = Number(data.quantity);
    if (!Number.isInteger(qty) || qty <= 0) return;
    // Product quantities are individual sellable pieces. Where the native
    // label specifies another unit (e.g. metres), preserve it rather than
    // falsely calling that unit pieces.
    var backendUnit = typeof data.quantity_label === 'string'
      ? data.quantity_label.trim() : '';
    var unit = (!backendUnit || /^(од\.?|шт\.?|штук)$/i.test(backendUnit))
      ? 'шт.' : backendUnit;
    label.textContent = 'На складі: ' + qty.toLocaleString('uk-UA') + ' ' + unit;
    label.hidden = false;
    root.classList.remove('mt-pdp-v4-stock-hidden');
  }

  // Native status is shown even if this product/combination has no public price.
  // For a non-priced item, suppress buy UI (variants, quantity, stock, cart,
  // quick actions, delivery/returns) rather than implying checkout is possible.
  // A zero native price is treated as a missing listed price for this storefront.
  function refreshPriceVisibility() {
    if (variantPending) return;
    var data = latestProductData;
    if (!selectedCombinationMatches(data)) {
      data = parseProductData(root.querySelector('#product-details-tab') || root);
    }
    var forbidden = data && selectedCombinationMatches(data) &&
      (data.show_price === false || String(data.show_price) === '0');
    var native = purchase.querySelector('.product-prices [itemprop="price"], .product-prices .product-price');
    var content = native && (native.getAttribute('content') || stringOf(native));
    var priceValue = content ? Number(String(content).replace(/\u00a0/g,'').replace(/\s/g,'').replace(/,(?=\d{1,2}$)/,'.').replace(/[^0-9.]/g,'')) : NaN;
    var hasPrice = !forbidden && native && Number.isFinite(priceValue) && priceValue > 0;
    root.classList.toggle('mt-pdp-v51-no-price', !hasPrice);
  }

  function updateVariants() {
    root.querySelectorAll('.product-variants-item .input-container').forEach(function (container) {
      var input = container.querySelector('input[type="radio"]');
      container.classList.toggle('mt-pdp-v4-selected', !!(input && input.checked));
    });
  }

  function slideIndex(slider) {
    var node = slider && slider.querySelector('.slick-slide.slick-current:not(.slick-cloned)');
    var n = node ? parseInt(node.getAttribute('data-slick-index'), 10) : 0;
    return Number.isFinite(n) && n >= 0 ? n : 0;
  }

  /* Move original IQIT action nodes; never clone them or replace handlers.
     Their old home is .product-quantity, their visual destination is the
     right side of the price row. On combinations, a fresh native node wins. */
  function placeQuickActions() {
    var prices = purchase.querySelector('.product-prices');
    var header = purchase.querySelector('.product_header_container');
    var quantity = purchase.querySelector('.product-quantity');
    if (!prices || !header || !quantity) return;
    // Stable sibling survives AJAX replacement of native .product-prices.
    var holder = header.querySelector('.mt-pdp-v44-price-actions');
    var sources = [
      {id:'iqit-wishlist-product-btn', label:'Додати до списку бажань'},
      {id:'iqit-compare-product-btn', label:'Порівняти товар'}
    ];
    sources.forEach(function (cfg) {
      // Prefer a new native source inserted by PrestaShop on AJAX refresh.
      var fresh = quantity.querySelector('#' + cfg.id);
      var button = fresh || (holder && holder.querySelector('#' + cfg.id));
      if (!button) return;
      if (!holder) {
        holder = document.createElement('div');
        holder.className = 'mt-pdp-v44-price-actions';
        holder.setAttribute('role', 'group');
        holder.setAttribute('aria-label', 'Дії з товаром');
        header.appendChild(holder);
      }
      var cell = button.closest('.col');
      if (!cell || !purchase.contains(cell)) return;
      cell.classList.add('mt-pdp-v44-price-action-cell');
      button.setAttribute('aria-label', cfg.label);
      if (fresh) {
        var previous = holder.querySelector('#' + cfg.id);
        if (previous && previous !== button) {
          var previousCell = previous.closest('.mt-pdp-v44-price-action-cell');
          removeNode(previousCell || previous);
        }
      }
      if (cell.parentElement !== holder) holder.appendChild(cell);
    });
    if (holder && !holder.children.length) removeNode(holder);
  }

  /* The moved original wishlist control must continue referring to the
     selected native combination, rather than the combination selected when
     the page first loaded. Wait for PrestaShop's confirmed response. */
  function syncQuickActionVariant() {
    var wishlist = purchase.querySelector('.product_header_container > .mt-pdp-v44-price-actions #iqit-wishlist-product-btn');
    if (!wishlist) return;
    if (variantPending) {
      wishlist.disabled = true;
      wishlist.setAttribute('aria-busy','true');
      return;
    }
    var data = latestProductData;
    if (!selectedCombinationMatches(data)) {
      data = parseProductData(root.querySelector('#product-details-tab') || root);
    }
    if (data && selectedCombinationMatches(data) && data.id_product_attribute != null) {
      wishlist.setAttribute('data-id-product-attribute',String(data.id_product_attribute));
      wishlist.disabled = false;
      wishlist.removeAttribute('aria-busy');
    } else {
      wishlist.disabled = true;
      wishlist.setAttribute('aria-busy','true');
    }
  }

  /* Every Slick slide has its own native modal expander. The new toolbar
     sits OUTSIDE the picture (no clipped or overlapping control).
     Click the current slide's ORIGINAL .expander, not a copied link. */
  function prepareZoomControl() {
    var images = gallery.querySelector('.images-container');
    var slider = gallery.querySelector('#product-images-large');
    if (!images || !slider) return;
    var original = slider.querySelector('.product-lmage-large > .expander');
    if (!original) return;
    var toolbar = images.querySelector('.mt-pdp-v44-zoom-toolbar');
    if (!toolbar) {
      toolbar = document.createElement('div');
      toolbar.className = 'mt-pdp-v44-zoom-toolbar';
      var button = document.createElement('button');
      button.className = 'mt-pdp-v44-zoom-button';
      button.type = 'button';
      button.setAttribute('aria-label','Збільшити фото товару');
      button.textContent = 'Збільшити';
      button.addEventListener('click', function () {
        var active = slider.querySelector('.slick-slide.slick-current:not(.slick-cloned) .product-lmage-large > .expander') ||
          slider.querySelector('.slick-slide.slick-active:not(.slick-cloned) .product-lmage-large > .expander') ||
          slider.querySelector('.product-lmage-large > .expander');
        if (active) active.click();
      });
      toolbar.appendChild(button);
      var imageRow = images.querySelector(':scope > .row');
      if (imageRow) imageRow.insertAdjacentElement('afterend',toolbar);
      else images.appendChild(toolbar);
    }
  }

  function prepareDots() {
    var slider = gallery.querySelector('#product-images-large');
    var imagesContainer = gallery.querySelector('.images-container');
    if (!slider || !imagesContainer) return;
    var count = slider.querySelectorAll('.slick-slide:not(.slick-cloned)').length;
    var dots = gallery.querySelector('.mt-pdp-v4-photo-dots');
    if (count < 2 || count > 20) { removeNode(dots); return; }
    if (!dots) {
      dots = document.createElement('div');
      dots.className = 'mt-pdp-v4-photo-dots';
      dots.setAttribute('role', 'group');
      dots.setAttribute('aria-label', 'Фотографії товару');
      imagesContainer.insertAdjacentElement('afterend', dots);
    }
    if (dots.children.length !== count) {
      dots.replaceChildren();
      for (var i=0; i<count; i++) {
        (function (index) {
          var button = document.createElement('button');
          button.type = 'button';
          button.className = 'mt-pdp-v4-photo-dot';
          button.setAttribute('aria-label', 'Переглянути фото ' + (index + 1));
          button.addEventListener('click', function () {
            var jq = window.jQuery;
            var active = gallery.querySelector('#product-images-large');
            if (jq && jq.fn && jq.fn.slick && jq(active).hasClass('slick-initialized')) {
              jq(active).slick('slickGoTo', index);
            } else {
              var thumbs = gallery.querySelectorAll('#product-images-thumbs .js-thumb');
              if (thumbs[index]) thumbs[index].click();
            }
          });
          dots.appendChild(button);
        })(i);
      }
    }
    var index = slideIndex(slider);
    Array.prototype.forEach.call(dots.children, function (dot, i) {
      dot.classList.toggle('is-active', i === index);
      if (i === index) dot.setAttribute('aria-current', 'true');
      else dot.removeAttribute('aria-current');
    });
    if (window.jQuery && !slider.dataset.mtPdpV3Bound) {
      slider.dataset.mtPdpV3Bound = '1';
      window.jQuery(slider).on('afterChange.mtPdpV3', prepareDots);
    }
  }

  function prepareBottomThumbnails() {
    var images = gallery.querySelector('.images-container');
    var row = images && images.querySelector(':scope > .row');
    var slider = gallery.querySelector('#product-images-large');
    var nativeStrip = gallery.querySelector('#product-images-thumbs');
    if (!images || !row || !slider || !nativeStrip) return;
    var originals = Array.prototype.slice.call(nativeStrip.querySelectorAll('.slick-slide:not(.slick-cloned) img.js-thumb'));
    if (!originals.length) originals = Array.prototype.slice.call(nativeStrip.querySelectorAll('img.js-thumb'));
    var signature = originals.map(function (img) {
      return img.getAttribute('data-image-medium-src') || img.getAttribute('src') || '';
    }).join('|');
    var strip = images.querySelector('.mt-pdp-v51-bottom-thumbnails');
    if (originals.length < 2) { removeNode(strip); return; }
    if (!strip) {
      strip = document.createElement('div');
      strip.className = 'mt-pdp-v51-bottom-thumbnails';
      strip.setAttribute('role', 'group');
      strip.setAttribute('aria-label', 'Мініатюри фотографій товару');
    }
    if (strip.dataset.signature !== signature) {
      strip.replaceChildren();
      originals.forEach(function (source, index) {
        var button = document.createElement('button');
        button.type = 'button';
        button.className = 'mt-pdp-v51-thumb';
        button.setAttribute('aria-label', 'Показати фотографію ' + (index + 1));
        var img = document.createElement('img');
        img.src = source.getAttribute('data-image-medium-src') || source.getAttribute('src') || '';
        img.alt = '';
        img.loading = 'lazy';
        button.appendChild(img);
        button.addEventListener('click', function () {
          var jq = window.jQuery;
          if (jq && jq.fn && jq.fn.slick && jq(slider).hasClass('slick-initialized')) {
            jq(slider).slick('slickGoTo', index);
          } else if (source.isConnected) {
            source.click();
          }
          updateBottomThumbnailSelection();
        });
        strip.appendChild(button);
      });
      strip.dataset.signature = signature;
    }
    // The thumbnail strip sits right under the cover, before the zoom toolbar.
    if (row.nextElementSibling !== strip) row.insertAdjacentElement('afterend', strip);
    updateBottomThumbnailSelection();
    if (window.jQuery && !slider.dataset.mtPdpV51ThumbsBound) {
      slider.dataset.mtPdpV51ThumbsBound = '1';
      window.jQuery(slider).on('afterChange.mtPdpV51Thumbs', updateBottomThumbnailSelection);
    }
  }

  function updateBottomThumbnailSelection() {
    var strip = gallery.querySelector('.mt-pdp-v51-bottom-thumbnails');
    if (!strip) return;
    var active = slideIndex(gallery.querySelector('#product-images-large'));
    Array.prototype.forEach.call(strip.children, function (button, index) {
      var selected = index === active;
      button.classList.toggle('is-active', selected);
      if (selected) button.setAttribute('aria-current', 'true');
      else button.removeAttribute('aria-current');
    });
  }

  function repositionGallery() {
    var jq = window.jQuery;
    if (!jq || !jq.fn || !jq.fn.slick) return;
    ['#product-images-large', '#product-images-thumbs'].forEach(function (selector) {
      var slider = gallery.querySelector(selector);
      if (slider && jq(slider).hasClass('slick-initialized')) {
        try { jq(slider).slick('setPosition'); }
        catch (error) { log('Slick positioning skipped:', selector); }
      }
    });
  }

  function descriptionWhenPresent() {
    // Existing IQIT desktop tabs and mobile description accordion already work.
    // Only remove the duplicate heading introduced by our PDP script.
    root.querySelectorAll('.mt-pdp-v4-description-title').forEach(removeNode);

    // Cleanup for a previously loaded experimental description accordion:
    // restore the ORIGINAL tab pane before removing our duplicate wrapper.
    var generated = root.querySelector('.mt-pdp-v4-accordion[data-panel="description"]');
    if (generated) {
      var tabs = root.querySelector('.product-tabs');
      var content = tabs && tabs.querySelector('#product-infos-tabs-content');
      var original = generated.querySelector(
        '.tab-pane#description, .tab-pane#product-description, .tab-pane[id$="-description-tab"]'
      );
      if (content && original && original.parentElement !== content) content.appendChild(original);
      removeNode(generated);
    }

    var tabs = root.querySelector('.product-tabs');
    if (tabs) tabs.classList.remove('mt-pdp-v5-description-moved', 'mt-pdp-v5-details-nav-empty');
  }

  var scheduled = false;
  function refresh() {
    scheduled = false;
    prepareFeatures();
    prepareCMSModules();
    prepareBrand();
    prepareEditorialColumns();
    prepareCompactFeatures();
    prepareSkuCopy();
    syncEditorialSku();
    syncAvailabilityPresentation();
    cleanOrphanedDetailsTab();
    prepareQuantityLabel();
    placeQuickActions();
    prepareZoomControl();
    removeProductSocialSharing();
    syncHalfSheetMessage();
    refreshStock();
    refreshPriceVisibility();
    // No-price status is resolved only now; reposition native description
    // outside hidden purchase markup on status-only catalog products.
    prepareEditorialColumns();
    updateVariants();
    prepareBottomThumbnails();
    removeNode(gallery.querySelector('.mt-pdp-v4-photo-dots'));
    descriptionWhenPresent();
  }
  function scheduleRefresh() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(refresh);
  }

  removeLegacyPDP();
  // Align DOM reading/tab order with the approved visual composition.
  // Native nodes remain unchanged and continue to be addressed by class.
  if (row.firstElementChild !== aside) row.insertBefore(aside, row.firstChild);
  root.classList.add('mt-pdp-v4', 'mt-pdp-v5');
  row.classList.add('mt-pdp-v4-row');
  gallery.classList.add('mt-pdp-v4-gallery');
  purchase.classList.add('mt-pdp-v4-purchase');
  aside.classList.add('mt-pdp-v4-aside');
  refresh();
  requestAnimationFrame(function () { requestAnimationFrame(repositionGallery); });

  document.addEventListener('change', function (event) {
    if (event.target.closest && event.target.closest('#main-product-wrapper .product-variants')) {
      variantPending = true;
      latestProductData = null;
      confirmedAjaxSku = null;
      var ref = aside.querySelector('.mt-pdp-v5-identity .product-reference');
      if (ref) ref.classList.add('mt-pdp-v52-sku-pending');
      var label = purchase.querySelector('.mt-pdp-v4-stock');
      if (label) { label.hidden = true; label.textContent = ''; }
      root.classList.add('mt-pdp-v4-stock-hidden');
      syncHalfSheetMessage(); // react immediately; don't wait for AJAX
      updateVariants();
    }
  });
  if (window.prestashop && typeof window.prestashop.on === 'function') {
    window.prestashop.on('updateProduct', function () {
      variantPending = true;
      confirmedAjaxSku = null;
      var ref = aside.querySelector('.mt-pdp-v5-identity .product-reference');
      if (ref) ref.classList.add('mt-pdp-v52-sku-pending');
      var label = purchase.querySelector('.mt-pdp-v4-stock');
      if (label) { label.hidden = true; label.textContent = ''; }
      root.classList.add('mt-pdp-v4-stock-hidden');
      syncHalfSheetMessage();
    });
    window.prestashop.on('updatedProduct', function (response) {
      // The AJAX response includes fragments of the newly selected product.
      latestProductData = parseProductData(response && response.product_details);
      confirmedAjaxSku = extractSkuFromResponse(response);
      skuRefreshAttempted = true;
      variantPending = false;
      scheduleRefresh();
      window.setTimeout(function () { scheduleRefresh(); repositionGallery(); }, 160);
    });
    window.prestashop.on('handleError', function () {
      variantPending = false;
      latestProductData = null;
      confirmedAjaxSku = null;
      skuRefreshAttempted = false; // revert to native existing SKU on failed request
      scheduleRefresh();
    });
  }
  var sizing = false;
  window.addEventListener('resize', function () {
    if (sizing) return;
    sizing = true;
    requestAnimationFrame(function () { sizing = false; repositionGallery(); });
  }, { passive:true });
  window.addEventListener('load', repositionGallery, {once:true});

  window.MebTechPDPv4 = {
    initialized:true,
    version:'5.3',
    refresh:scheduleRefresh,
    status:function () {
      return {
        forms:root.querySelectorAll('#add-to-cart-or-refresh').length,
        features:aside.querySelectorAll('.mt-pdp-v4-specifications > .product-features').length,
        delivery:!!purchase.querySelector('#mt-pdp-v4-panel-shipping #iqithtmlandbanners-block-3'),
        payment:!!purchase.querySelector('#mt-pdp-v4-panel-shipping #iqithtmlandbanners-block-4'),
        quantity:!!purchase.querySelector('.bootstrap-touchspin #quantity_wanted'),
        quickActions:!!purchase.querySelector('.product_header_container > .mt-pdp-v44-price-actions #iqit-wishlist-product-btn') && !!purchase.querySelector('.product_header_container > .mt-pdp-v44-price-actions #iqit-compare-product-btn'),
        zoom:!!gallery.querySelector('.mt-pdp-v44-zoom-button'),
        activeFormat:stringOf(root.querySelector('.product-variants-item .input-radio:checked + .radio-label')),
        sku:stringOf(aside.querySelector('.mt-pdp-v5-identity [itemprop="sku"]')),
        skuPending:!!aside.querySelector('.mt-pdp-v52-sku-pending'),
        statusKind:purchase.querySelector('#product-availability') ? purchase.querySelector('#product-availability').dataset.mtPdpStatus : null,
        emptyDetails:!!root.querySelector('.product-tabs.mt-pdp-v52-tabs-empty'),
        price:stringOf(purchase.querySelector('.product-prices .product-price')),
        stock:stringOf(purchase.querySelector('.mt-pdp-v4-stock')),
        noPrice:root.classList.contains('mt-pdp-v51-no-price'),
        visibleFeatures:aside.querySelectorAll('.product-features dl.data-sheet > dt:not([hidden])').length,
        bottomThumbnails:gallery.querySelectorAll('.mt-pdp-v51-bottom-thumbnails .mt-pdp-v51-thumb').length,
        selectedHalf:isHalfSheet(),
        halfNoticeVisible:!!(root.querySelector('.mt-pdp-v4-half-note') && !root.querySelector('.mt-pdp-v4-half-note').hidden),
        accordions:Array.prototype.map.call(purchase.querySelectorAll('.mt-pdp-v4-accordion-trigger'), function (el) {
          return {title:stringOf(el),expanded:el.getAttribute('aria-expanded')};
        })
      };
    }
  };
  log('Ready', window.MebTechPDPv4.status());
}());

;

/* MebTech PDP v5.3: REPLACEMENT 05. Replace PATCH04, never append it.
 * Requires v5.3 core + PATCH01 CSS + PATCH02 CSS/JS. Does not edit payment CMS.
 * No pipes/FBR/metered goods logic. No backend/cart eligibility changes. */
(function(){
'use strict';
var r=document.querySelector('#main-product-wrapper.mt-pdp-v4.mt-pdp-v5');
if(!r||!window.MebTechPDPv4||window.MebTechPDPv4.version!=='5.3'||window.MTP05)return;
var url='https://mebteh.com.ua/uk/info/22-pravila-povernennya-ta-obminu';
var shapes={
 store:'<path d="M3 9h18l-2-5H5L3 9Z"/><path d="M5 9v11h14V9M9 20v-7h6v7"/>',
 truck:'<path d="M3 5h11v12H3zM14 9h4l3 4v4h-7"/><circle cx="7" cy="18" r="2"/><circle cx="18" cy="18" r="2"/>',
 package:'<path d="m3 7 9-4 9 4v10l-9 4-9-4V7Z M3 7l9 4 9-4 M12 11v10"/>',
 info:'<circle cx="12" cy="12" r="10"/><path d="M12 11v5m0-9h.01"/>',
 clock:'<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
 scissors:'<circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M8.12 8.12 20 20M14.5 9.5 20 4M8.12 15.88l4.37-4.37"/>',
 refresh:'<path d="M20 11a8 8 0 0 0-14.4-4.8L3 9M3 4v5h5M4 13a8 8 0 0 0 14.4 4.8L21 15m0 5v-5h-5"/>'
};
function svg(k){return '<svg class="mt-p05-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+(shapes[k]||shapes.info)+'</svg>';}
function txt(e){return(e&&e.textContent||'').replace(/\s+/g,' ').trim();}
function set(e,s){if(e&&txt(e)!==s)e.textContent=s;}
function html(e,s){if(e&&e.innerHTML!==s)e.innerHTML=s;}
function slot(parent,cls,before){if(!parent)return null;var e=parent.querySelector(':scope > .'+cls);if(!e){e=document.createElement('div');e.className=cls;if(before)parent.insertBefore(e,before);else parent.appendChild(e);}return e;}
function formatHalf(){
 var groups=r.querySelectorAll('.product-variants-item');
 for(var i=0;i<groups.length;i++){
  var g=groups[i];if(!/формат|format/i.test(txt(g.querySelector('.form-control-label'))))continue;
  var radio=g.querySelector('input[type="radio"]:checked');
  var pick=radio?txt(radio.closest('.input-container')&&radio.closest('.input-container').querySelector('.radio-label')):'';
  if(!radio){var sel=g.querySelector('select');pick=sel&&sel.selectedOptions.length?txt(sel.selectedOptions[0]):'';}
  return /^(половин|пів\s*лист)/i.test(pick);
 }
 return r.classList.contains('mt-pdp-v4-half-selected');
}
function group(){var ds=r.querySelector('dl.data-sheet');if(!ds)return '';for(var dt=ds.firstElementChild;dt;dt=dt.nextElementSibling){if(dt.tagName==='DT'&&/група\s+товару/i.test(txt(dt)))return txt(dt.nextElementSibling).toLowerCase();}return '';}
function model(){
 var half=formatHalf(),name=txt(r.querySelector('.mt-pdp-v5-identity h1,.page-title')).toLowerCase(),g=group();
 var avail=r.querySelector('#product-availability');
 var service=/^(послуг|порізк|розкр|допил|крайкуван)/.test(g)||/^(послуг|порізк|розкр|допил|крайкуван)/.test(name);
 var board=!service&&(half||/^(л?дсп|мдф|двп|фанер|плитн|стільниц|столешниц|компакт.?.?плит)/.test(g)||/^(л?дсп\s|мдф\s|двп\s|фанера\s|стільниц[ья]\s|столешниц\s|компакт.?плита\s)/.test(name));
 var pre=!half&&!service&&((avail&&avail.dataset.mtPdpStatus==='preorder')||/під\s*замовлення|передзамовлення|под\s*заказ/i.test(txt(avail)));
 return {half:half,board:board,service:service,pre:pre};
}
function note(heading,body,k){return '<div class="mt-p05-notice">'+svg(k||'info')+'<div><strong>'+heading+'</strong><p>'+body+'</p></div></div>';}
function icon(opt,k){var container=opt&&opt.querySelector('.delivery-icon');if(!container)return;var e=container.querySelector('.mt-p05-svg');var s=svg(k);if(!e||e.outerHTML!==s) {if(e)e.remove();container.insertAdjacentHTML('afterbegin',s);}}
function deliveryOption(el,title,sub,ico){if(!el)return;var t=el.querySelector('.delivery-left > div:not(.delivery-icon) > div:first-child');set(t,title);set(el.querySelector('.delivery-sub'),sub);icon(el,ico);}
function shipping(m){
 var card=r.querySelector('#mt-pdp-v4-panel-shipping #iqithtmlandbanners-block-3 .delivery-card');if(!card)return;
 if(m.service){r.classList.add('mt-p05-ready');return;}
 var city=card.querySelector('.content-mykolaiv'),ua=card.querySelector('.content-other');if(!city||!ua)return;
 var locals=city.querySelectorAll(':scope > .delivery-option'),nation=ua.querySelectorAll(':scope > .delivery-option');
 if(locals.length<3||nation.length<2)return;
 var pickup=locals[0],own=locals[1],localNP=locals[2],courier=nation[0],branch=nation[1];
 var top=card.querySelector('.delivery-top'),lead=slot(card,'mt-p05-lead',top);
 // Only supplier preorders get a top notice; half-sheet readiness is in local pickup.
 var leadText=m.pre?note('Товар під замовлення','Орієнтовне постачання — 2–3 тижні. Термін і ціну підтвердить менеджер.','clock'):'';
 html(lead,leadText);lead.hidden=!leadText;
 [pickup,own,localNP,courier,branch].forEach(function(x){x.removeAttribute('data-mt-p05-hide');});
 deliveryOption(pickup,m.board?'Самовивіз зі складу':'Самовивіз із магазину',m.half?'Наступного дня після підтвердження · до 15:00':m.board?'Після підтвердження готовності · до 15:00':m.pre?'Після надходження · до 16:30':'Після підтвердження готовності · до 16:30','store');
 deliveryOption(own,'Доставка по Миколаєву','Нашим транспортом','truck');
 var tariff=own.querySelector('.tariff-link');if(tariff)set(tariff,'Див. тарифи');
 deliveryOption(localNP,'До відділення Нової пошти',m.pre?'Після надходження товару':'За тарифами перевізника','package');
 deliveryOption(branch,'До відділення Нової пошти',m.pre?'Після надходження товару':'За тарифами перевізника','package');
 deliveryOption(courier,'Кур’єр Нової пошти',m.pre?'Адресна доставка після надходження':'Адресна доставка','truck');
 if(branch.nextElementSibling===null&&courier.parentElement===ua)ua.insertBefore(branch,courier);
 var warning=slot(ua,'mt-p05-restriction',ua.firstElementChild);
 if(m.board){
  [localNP,courier,branch].forEach(function(x){x.setAttribute('data-mt-p05-hide','');});
  html(warning,note('Обмеження доставки',m.half?'Половину листа Новою поштою не відправляємо.':'Цілі плити Новою поштою не відправляємо.','info')+'<div class="mt-p05-carrier">'+svg('truck')+'<div><strong>Забір вашим перевізником</strong><p>За погодженням із менеджером</p><small>Будні · 09:00–14:30 · після повної оплати</small></div></div>');
 }else html(warning,'');
 warning.hidden=!m.board;
 r.classList.add('mt-p05-ready');
}
function returns(m){
 var panel=r.querySelector('#mt-pdp-v4-panel-returns');if(!panel)return;
 var cut=m.half||m.service;
 var copy=cut?'Послугу можна скасувати до початку виконання. Після виконання повернення оплати за належно надану послугу не передбачене. Претензії щодо недоліків розглядаються окремо.':
 m.pre?'Товари під замовлення поверненню не підлягають.':
 'Обмін або повернення протягом 14 днів за умови дотримання правил повернення товарів належної якості.';
 var holder=slot(panel,'mt-p05-returns',panel.firstChild);
 html(holder,'<div class="mt-p05-return-row">'+svg(cut?'scissors':m.pre?'info':'refresh')+'<div><p>'+copy+'</p><a href="'+url+'">Правила повернення та обміну</a></div></div>');
 panel.classList.add('mt-p05-returns-ready');
}
function halfQty(m){
 r.classList.toggle('mt-p05-half',m.half);
 if(!m.half)return;
 var q=r.querySelector('.mt-pdp-v4-purchase #quantity_wanted');if(q&&q.value!=='1')q.value='1';
}
function refresh(){try{var m=model();halfQty(m);shipping(m);returns(m);}catch(e){console.warn('MTP05',e);}}
var timer;function later(){clearTimeout(timer);timer=setTimeout(refresh,80);}
document.addEventListener('change',function(e){if(r.contains(e.target)&&e.target.closest&&e.target.closest('.product-variants')){refresh();setTimeout(refresh,180);setTimeout(refresh,550);}});
document.addEventListener('submit',function(e){if(!formatHalf()||!r.contains(e.target))return;var q=e.target.querySelector('#quantity_wanted');if(q)q.value='1';},true);
if(window.prestashop&&window.prestashop.on){window.prestashop.on('updatedProduct',function(){later();setTimeout(refresh,280);setTimeout(refresh,700);});}
window.MTP05={version:'05',refresh:refresh};refresh();
}());

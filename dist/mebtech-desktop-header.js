/* MebTech Desktop Header v4.5 — native IQIT global menu.
   Load once after PrestaShop/IQIT markup, independently of Hero JS.
   Requires matching v4.5 CSS in dist/mebtech.css. */
(function () {
  'use strict';
  function boot() {
    var header = document.querySelector('#header.desktop-header-style-w-2');
    var desktop = document.querySelector('#desktop-header.desktop-header-style-2');
    if (!header || !desktop || header.classList.contains('mt-desktop-nav-ready')) return;
    if (!window.matchMedia('(min-width: 992px)').matches ||
        getComputedStyle(desktop).display === 'none') return;

    header.classList.add('mt-desktop-nav-booting');
    var row = desktop.querySelector('.header-top #desktop-header-container > .row');
    var logoCol = row && row.querySelector(':scope > .col-header-left');
    var searchCol = row && row.querySelector(':scope > .col-header-center');
    var rightCol = row && row.querySelector(':scope > .col-header-right');
    var actionsRow = rightCol && rightCol.querySelector(':scope > .row');
    var catalogSource = desktop.querySelector('#cbp-hrmenu-tab-57');
    // Only use the *global/header instance* created by the IQIT Vertical menu setting.
    // NEVER take the sidebar/Home Elementor #cbp-hrmenu1 (outside #header).
    var nativeVertical = desktop.querySelector('nav.cbp-hrmenu.cbp-vertical') ||
                         header.querySelector('nav.cbp-hrmenu.cbp-vertical');
    if (!nativeVertical) {
      console.info('[MebTech Header v4.5] IQIT Header Vertical Menu is absent. Enable the native global/header placement in Theme Editor; Home/sidebar menu is deliberately untouched.');
      return;
    }
    if (nativeVertical.closest('#mobile-header')) return;
    var utilityLeft = header.querySelector('.header-nav .left-nav');
    var utilityRight = header.querySelector('.header-nav .right-nav');
    var language = header.querySelector('#language_selector');
    if (!row || !logoCol || !searchCol || !rightCol || !actionsRow || !nativeVertical || !utilityLeft || !utilityRight || !language) {header.classList.remove('mt-desktop-nav-booting');return;}

    var russian = /(?:^|\/)ru(?:\/|$)/.test(location.pathname) || document.documentElement.lang.toLowerCase().startsWith('ru');
    var words = russian ? {
      catalog: 'Каталог', buyers: 'Покупателям', offers:'Акции', news:'Новости', custom:'Мебель на заказ',
      city:'Николаев', placeholder:'Поиск по каталогу...', open:'Открыть каталог', close:'Закрыть каталог'
    } : {
      catalog: 'Каталог', buyers: 'Покупцям', offers:'Акції', news:'Новини', custom:'Меблі на замовлення',
      city:'Миколаїв', placeholder:'Пошук по каталогу...', open:'Відкрити каталог', close:'Закрити каталог'
    };
    function svg(kind) {
      var paths = {
        grid:'<rect x="3" y="3" width="7" height="7" rx="1.6"/><rect x="14" y="3" width="7" height="7" rx="1.6"/><rect x="3" y="14" width="7" height="7" rx="1.6"/><rect x="14" y="14" width="7" height="7" rx="1.6"/>',
        pin:'<path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',
        chevron:'<path d="m6 9 6 6 6-6"/>',
        close:'<path d="M18 6 6 18M6 6l12 12"/>'
      };
      return '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+paths[kind]+'</svg>';
    }
    function safeCloneLink(selector, title, className) {
      var source = desktop.querySelector(selector);
      if (!source) source = header.querySelector(selector);
      if (!source) return null;
      var href = source.getAttribute('href');
      if (!href || /^(?:javascript|data):/i.test(href)) return null;
      var a = document.createElement('a');
      a.href = href;
      a.textContent = title;
      a.className = className || '';
      return a;
    }
    function stripDuplicateIds(root) {
      root.querySelectorAll('[id],script,[onclick],[onmouseover],[onmouseenter]').forEach(function (el) {
        if (el.tagName.toLowerCase() === 'script') {el.remove();return;}
        el.removeAttribute('id');
        for (var i=el.attributes.length-1;i>=0;i--) {
          if (/^on/i.test(el.attributes[i].name)) el.removeAttribute(el.attributes[i].name);
        }
      });
    }

    // Mount ONLY the IQIT Header-owned vertical menu in the full-width panel.
    // Do not clone category data, and do not move the Home/Elementor menu.
    // Preserve original position so responsive cleanup is reversible.
    var nativeHome = nativeVertical.parentNode;
    var nativeNext = nativeVertical.nextSibling;
    var nativeHidden = nativeVertical.hidden;
    var nativeStyle = nativeVertical.getAttribute('style');
    var originalNavAria = nativeVertical.getAttribute('aria-label');
    var originalMenuId = nativeVertical.id;
    var nativeUl = nativeVertical.querySelector(':scope > ul.cbp-hrmenu-ul, :scope > ul[id], :scope > ul');
    var originalUlId = nativeUl && nativeUl.id;
    // Distinct accessible ID even when Home Elementor also renders #cbp-hrmenu1.
    nativeVertical.id = 'mt-header-native-catalog';
    if (nativeUl) {
      nativeUl.classList.add('mt-native-root-list');
      nativeUl.id = 'mt-header-native-catalog-list';
    }
    var slot = document.createElement('div');
    slot.className = 'mt-desktop-catalog-slot';
    var button = document.createElement('button');
    button.type = 'button';
    button.className = 'mt-desktop-catalog-button';
    button.setAttribute('aria-expanded','false');
    button.setAttribute('aria-controls','mt-header-native-catalog');
    button.setAttribute('aria-label',words.open);
    button.innerHTML = svg('grid')+'<span>'+words.catalog+'</span>';
    slot.appendChild(button);
    logoCol.insertAdjacentElement('afterend',slot);
    var panel = nativeVertical;
    panel.classList.add('mt-native-catalog');
    panel.setAttribute('aria-label',words.catalog);
    panel.hidden = true;
    slot.appendChild(panel);

    // Runtime geometry: actual site .container, not a newly invented DS width.
    // The theme may set a positioned ancestor *inside* the header. Absolute
    // coordinates must therefore be measured against panel.offsetParent.
    function findSiteContainer() {
      var candidates = Array.from(document.querySelectorAll('#wrapper .container, #main .container, main .container, .container'))
        .filter(function(el) {
          if (header.contains(el) || el.closest('#mobile-header') || panel.contains(el)) return false;
          var r = el.getBoundingClientRect();
          return r.width >= 700 && r.width <= document.documentElement.clientWidth + 1 && r.height > 0;
        });
      // The actual page-level (widest) fixed container takes priority over
      // nested narrower cards and the overridden 1280px Header container.
      candidates.sort(function(a,b) {return b.getBoundingClientRect().width - a.getBoundingClientRect().width;});
      return candidates[0] || null;
    }
    function setMeasuredContainer() {
      var ref = findSiteContainer();
      if (ref) {
        var box = ref.getBoundingClientRect(), style = getComputedStyle(ref);
        var padL = parseFloat(style.paddingLeft) || 0;
        var padR = parseFloat(style.paddingRight) || 0;
        header.style.setProperty('--mt-site-container-width',box.width+'px');
        header.style.setProperty('--mt-site-content-left',Math.max(0,box.left+padL)+'px');
        header.style.setProperty('--mt-site-content-right',Math.max(0,document.documentElement.clientWidth-box.right+padR)+'px');
      } else {
        // User-confirmed maximum of existing site layout; only a fallback
        // if the real external content container cannot be resolved.
        var w = Math.min(document.documentElement.clientWidth,1366);
        var gutter = (document.documentElement.clientWidth-w)/2+16;
        header.style.setProperty('--mt-site-container-width',w+'px');
        header.style.setProperty('--mt-site-content-left',gutter+'px');
        header.style.setProperty('--mt-site-content-right',gutter+'px');
      }
    }
    function measureOverlay() {
      if (panel.hidden || !header.classList.contains('mt-desktop-nav-ready')) return;
      setMeasuredContainer();
      var shell = desktop.querySelector(':scope > .header-top');
      var offsetParent = panel.offsetParent;
      if (!shell || !offsetParent) return;
      var shellRect = shell.getBoundingClientRect();
      var parentRect = offsetParent.getBoundingClientRect();
      var viewportWidth = document.documentElement.clientWidth;
      var left = -parentRect.left - offsetParent.clientLeft + offsetParent.scrollLeft;
      var top = shellRect.bottom - parentRect.top - offsetParent.clientTop + offsetParent.scrollTop;
      var available = Math.max(180,window.innerHeight - Math.max(shellRect.bottom,0) - 12);
      var height = Math.min(680,available);
      panel.style.setProperty('--mt-overlay-left',left+'px');
      panel.style.setProperty('--mt-overlay-top',top+'px');
      panel.style.setProperty('--mt-overlay-width',viewportWidth+'px');
      panel.style.setProperty('--mt-overlay-height',height+'px');
      panel.classList.add('mt-overlay-measured');
    }
    // Resolve native page layout once before user interacts with Catalog.
    setMeasuredContainer();

    // Native IQIT content is reused, never copied. IQIT's original submenu
    // lives inside a scrollable UL; that clips flyouts on the live site.
    // Show precisely one ORIGINAL submenu in a sibling presentation host,
    // then return it to its owning LI when switching/closing/resizing.
    var nativeCategoryEvents = new AbortController();
    var flyoutHost = document.createElement('div');
    flyoutHost.className = 'mt-native-flyout-host';
    flyoutHost.setAttribute('aria-label',russian ? 'Подкатегории' : 'Підкатегорії');
    panel.appendChild(flyoutHost);
    var activeCategory = null, activeSubmenu = null;
    var rootEntries = nativeUl ? Array.from(nativeUl.children).filter(function(el){
      return el.classList.contains('cbp-hrmenu-tab');
    }) : [];
    function restoreFlyout() {
      if (activeCategory) activeCategory.classList.remove('mt-category-active','mt-initial-active');
      if (activeCategory && activeSubmenu && activeSubmenu.parentNode === flyoutHost) {
        activeCategory.appendChild(activeSubmenu);
      }
      activeCategory = null;
      activeSubmenu = null;
      flyoutHost.classList.remove('mt-flyout-has-content');
    }
    function setActiveCategory(item) {
      if (!item || !rootEntries.includes(item)) return;
      var submenu = item.querySelector(':scope > .cbp-hrsub-wrapper');
      if (item === activeCategory && activeSubmenu) return;
      if (!submenu) return; // Keep the last usable submenu, never an empty right pane.
      restoreFlyout();
      activeCategory = item;
      activeSubmenu = submenu;
      item.classList.add('mt-category-active');
      flyoutHost.appendChild(submenu); // original DOM node: native links/images intact
      flyoutHost.classList.add('mt-flyout-has-content');
      flyoutHost.scrollTop = 0;
    }
    function primeInitialCategory() {
      // Entry #2 is «Меблева фурнітура» in the confirmed native IQIT HTML.
      var furniture = rootEntries.find(function(li){
        return li.classList.contains('cbp-hrmenu-tab-14');
      }) || rootEntries[1];
      if (furniture) setActiveCategory(furniture);
    }
    if (nativeUl) {
      function onRootCategoryInteraction(e) {
        var el = e.target instanceof Element ? e.target : e.target.parentElement;
        var item = el && el.closest('li.cbp-hrmenu-tab');
        if (item && item.parentElement === nativeUl) setActiveCategory(item);
      }
      nativeUl.addEventListener('pointerover',onRootCategoryInteraction,
        {signal:nativeCategoryEvents.signal});
      nativeUl.addEventListener('focusin',onRootCategoryInteraction,
        {signal:nativeCategoryEvents.signal});
    }

    // CSS aligns the WHOLE panel to the header frame, not below the button.
    // Native IQIT submenu data and category links remain in place.
    // Utility: explicit city is information only; there is no city selector in source HTML.
    var city = document.createElement('span');
    city.className = 'mt-utility-city';
    city.innerHTML = svg('pin')+'<span>'+words.city+'</span>';
    utilityLeft.insertBefore(city,utilityLeft.firstChild);
    city.insertAdjacentElement('afterend',language); // preserve native language dropdown
    var langTrigger = language.querySelector('.expand-more');
    if (langTrigger) {
      var langText = Array.prototype.find.call(langTrigger.childNodes,function(n){return n.nodeType===3 && n.textContent.trim();});
      if (langText) langText.textContent = russian ? ' RU ' : ' UA ';
    }

    var links = document.createElement('div');
    links.className = 'mt-utility-links';
    var offers = safeCloneLink('#_desktop_iqitmegamenu-mobile a[href*="c1207-akcijni-tovari"]',words.offers,'mt-utility-offers');
    if (offers) links.appendChild(offers);

    var buyerSource = desktop.querySelector('#cbp-hrmenu-tab-37 .cbp-hrsub');
    if (buyerSource) {
      var buyerWrap = document.createElement('div');
      buyerWrap.className = 'mt-utility-buyers';
      var buyersBtn = document.createElement('button');
      buyersBtn.type = 'button';
      buyersBtn.className = 'mt-utility-buyers-button';
      buyersBtn.innerHTML = '<span>'+words.buyers+'</span>'+svg('chevron');
      buyersBtn.setAttribute('aria-expanded','false');
      buyersBtn.setAttribute('aria-controls','mt-utility-buyers-panel');
      var buyersPanel = document.createElement('div');
      buyersPanel.className = 'mt-utility-buyers-panel';
      buyersPanel.id = 'mt-utility-buyers-panel';
      buyersPanel.hidden = true;
      buyerSource.querySelectorAll('.cbp-links a[href]').forEach(function (sourceLink) {
        var a = document.createElement('a');
        a.href = sourceLink.href;
        a.textContent = sourceLink.textContent.trim();
        if (a.textContent) buyersPanel.appendChild(a);
      });
      if (buyersPanel.children.length) {
        buyerWrap.append(buyersBtn,buyersPanel);
        links.appendChild(buyerWrap);
        buyersBtn.addEventListener('click', function () {
          var open = buyersPanel.hidden;
          closeCatalog();
          buyersPanel.hidden = !open;
          buyersBtn.setAttribute('aria-expanded',String(open));
        });
      }
    }
    var news = safeCloneLink('#cbp-hrmenu-tab-37 a[href*="/blog"]',words.news);
    var custom = safeCloneLink('#cbp-hrmenu-tab-57 a[href*="c1212-mebli-na-zamovlennya"]',words.custom,'mt-utility-custom');
    if (news) links.appendChild(news);
    if (custom) links.appendChild(custom);
    utilityRight.insertBefore(links,utilityRight.firstChild);

    // Header action shortcuts use native destination URLs; originals remain
    // in the utility navigation. Never relocate native cart or IQIT widgets.
    var user = actionsRow.querySelector('#header-user-btn');
    function actionShortcut(sourceSelector, label, iconClass) {
      var nativeLink = header.querySelector(sourceSelector);
      if (!nativeLink || !user) return;
      var link = document.createElement('a');
      link.href = nativeLink.href;
      link.className = 'mt-header-action-link ' + iconClass;
      link.setAttribute('aria-label',label);
      link.setAttribute('title',label);
      var pictogram = document.createElement('span');
      pictogram.className = 'mt-action-icon';
      pictogram.setAttribute('aria-hidden','true');
      link.appendChild(pictogram);
      actionsRow.insertBefore(link,user);
    }
    actionShortcut('.header-nav a[href*="iqitwishlist"]',russian?'Избранное':'Список бажань','mt-action-wish');
    actionShortcut('.header-nav a[href*="iqitcompare"]',russian?'Сравнение':'Порівняти','mt-action-compare');

    // PrestaShop / IQIT can move its only live cart into the native sticky
    // megamenu placeholder. Keep the SAME native cart node in the action row.
    // Do not clone cart/count nodes: AJAX cart updates must remain functional.
    var originalCart = actionsRow.querySelector('#ps-shoppingcart-wrapper') ||
                       header.querySelector('#ps-shoppingcart-wrapper');
    var cartHome = originalCart && originalCart.parentNode;
    var cartSibling = originalCart && originalCart.nextSibling;
    var pendingCart = false;
    function putCartBack() {
      pendingCart = false;
      if (!header.classList.contains('mt-desktop-nav-ready') &&
          !header.classList.contains('mt-desktop-nav-booting')) return;
      var cart = header.querySelector('#ps-shoppingcart-wrapper');
      if (cart && cart.parentNode !== actionsRow) actionsRow.appendChild(cart);
    }
    function requestCart() {
      if (pendingCart) return;
      pendingCart = true;
      requestAnimationFrame(putCartBack);
    }
    var cartObserver = new MutationObserver(function(records) {
      // Only watch direct children of original/sticky action zones. Do not
      // observe AJAX content and trigger loops on every cart count update.
      for (var n = 0; n < records.length; n++) {
        if (records[n].type === 'childList') {requestCart();break;}
      }
    });
    var stickyCartHome = desktop.querySelector('#sticky-cart-wrapper');
    if (stickyCartHome) cartObserver.observe(stickyCartHome,{childList:true});
    cartObserver.observe(actionsRow,{childList:true});

    var input = searchCol.querySelector('#search_widget input[name="s"]');
    if (input) input.placeholder = words.placeholder;

    var buyerButton = links.querySelector('.mt-utility-buyers-button');
    var buyerPanel = links.querySelector('.mt-utility-buyers-panel');
    function closeBuyers() {
      if (!buyerPanel) return;
      buyerPanel.hidden = true;
      buyerButton.setAttribute('aria-expanded','false');
    }
    function closeCatalog() {
      restoreFlyout();
      panel.hidden = true;
      panel.classList.remove('mt-overlay-measured');
      button.setAttribute('aria-expanded','false');
      button.setAttribute('aria-label',words.open);
      var ico = button.querySelector('svg');
      if (ico) ico.outerHTML = svg('grid');
      header.classList.remove('mt-catalog-is-open');
    }
    button.addEventListener('click',function() {
      var open = panel.hidden;
      closeBuyers();
      panel.hidden = !open;
      if (open) primeInitialCategory();
      else restoreFlyout();
      button.setAttribute('aria-expanded',String(open));
      button.setAttribute('aria-label',open ? words.close : words.open);
      var icon = button.querySelector('svg');
      if (icon) icon.outerHTML = svg(open ? 'close' : 'grid');
      header.classList.toggle('mt-catalog-is-open',open);
      if (open) measureOverlay();
    });
    var globalEventAbort = new AbortController();
    document.addEventListener('pointerdown',function(e) {
      if (!slot.contains(e.target) && !panel.contains(e.target)) closeCatalog();
      if (buyerPanel && !links.contains(e.target)) closeBuyers();
    }, {signal:globalEventAbort.signal});
    document.addEventListener('keydown',function(e) {
      if (e.key !== 'Escape') return;
      if (!panel.hidden) { closeCatalog(); button.focus(); }
      else if (buyerPanel && !buyerPanel.hidden) {closeBuyers();buyerButton.focus();}
    }, {signal:globalEventAbort.signal});
    window.__mtDesktopCleanup = function () {
      closeCatalog(); closeBuyers(); cartObserver.disconnect(); globalEventAbort.abort(); nativeCategoryEvents.abort();
      // Return native cart and language before removing transformed UI.
      if (originalCart && cartHome && cartHome.isConnected && originalCart.isConnected) {
        if (cartSibling && cartSibling.parentNode === cartHome) cartHome.insertBefore(originalCart,cartSibling);
        else cartHome.appendChild(originalCart);
      }
      var originalRight = header.querySelector('.header-nav .right-nav');
      if (originalRight && language && language.isConnected) originalRight.insertBefore(language,originalRight.firstChild);
      // Restore the SAME IQIT vertical menu before destroying the temporary slot.
      panel.hidden = nativeHidden;
      restoreFlyout();
      flyoutHost.remove();
      panel.classList.remove('mt-native-catalog','mt-overlay-measured');
      panel.id = originalMenuId;
      if (nativeUl) {
        nativeUl.classList.remove('mt-native-root-list');
        nativeUl.id = originalUlId;
      }
      if (nativeStyle === null) panel.removeAttribute('style');
      else panel.setAttribute('style',nativeStyle);
      if (originalNavAria === null) panel.removeAttribute('aria-label');
      else panel.setAttribute('aria-label',originalNavAria);
      if (nativeHome && nativeHome.isConnected) {
        if (nativeNext && nativeNext.parentNode === nativeHome) nativeHome.insertBefore(panel,nativeNext);
        else nativeHome.appendChild(panel);
      }
      header.querySelectorAll('.mt-utility-city,.mt-utility-links,.mt-header-action-link,.mt-desktop-catalog-slot,.mt-desktop-catalog-panel').forEach(function(n){n.remove();});
      header.classList.remove('mt-desktop-nav-ready','mt-desktop-nav-booting','mt-catalog-is-open');
      ['--mt-site-container-width','--mt-site-content-left','--mt-site-content-right'].forEach(function(prop){header.style.removeProperty(prop);});
    };
    // Re-measure if actual page layout shifts after images/fonts load.
    // Open-only prevents needless work when panel is closed.
    window.addEventListener('resize',measureOverlay,{signal:globalEventAbort.signal,passive:true});
    window.addEventListener('scroll',measureOverlay,{signal:globalEventAbort.signal,passive:true});

    // Put the live cart into the correct column immediately.
    requestCart();
    // Warn if IQIT also generated duplicate descendant item IDs via its other
    // Home/Elementor hook; selectors here are scoped by the header panel.
    if (document.querySelectorAll('[id="cbp-hrmenu-tab-18"]').length > 1) {
      console.info('[MebTech Header v4.5] IQIT rendered duplicate item IDs on Home. Header CSS/behavior is scoped; verify native plugin hover/links during live QA.');
    }
    // Only enable all cosmetic selectors after all required DOM nodes exist.
    header.classList.add('mt-desktop-nav-ready');
    header.classList.remove('mt-desktop-nav-booting');
  }
  function setupGlobalState() {
    var header = document.querySelector('#header.desktop-header-style-w-2');
    var desktop = document.querySelector('#desktop-header.desktop-header-style-2');
    if (!header || !desktop) return;
    var anchor = null, spacer = null, lastHeight = 0;
    var started = false;
    var pending = false;
    var breakpoint = window.matchMedia('(min-width: 992px)');
    function active() {return breakpoint.matches && getComputedStyle(desktop).display !== 'none' && header.classList.contains('mt-desktop-nav-ready');}
    function update() {
      pending = false;
      if (!active()) {
        desktop.classList.remove('mt-desktop-stuck');
        if(spacer) spacer.style.height = '0px';
        return;
      }
      if (!anchor) {
        anchor = document.createElement('span');
        anchor.className='mt-desktop-sticky-sentinel';
        anchor.style.cssText='display:block;height:0;padding:0;margin:0;border:0';
        spacer = document.createElement('div');
        spacer.className='mt-desktop-sticky-placeholder';
        desktop.parentNode.insertBefore(anchor,desktop);
        desktop.parentNode.insertBefore(spacer,desktop);
      }
      var shouldStick = anchor.getBoundingClientRect().top < 0;
      if (shouldStick && !desktop.classList.contains('mt-desktop-stuck')) {
        lastHeight = desktop.getBoundingClientRect().height;
        spacer.style.height=Math.ceil(lastHeight)+'px';
        desktop.classList.add('mt-desktop-stuck');
        if (!desktop.querySelector('.mt-native-catalog[hidden]')) window.dispatchEvent(new Event('resize'));
      } else if (!shouldStick && desktop.classList.contains('mt-desktop-stuck')) {
        desktop.classList.remove('mt-desktop-stuck');
        spacer.style.height='0px';
        if (!desktop.querySelector('.mt-native-catalog[hidden]')) window.dispatchEvent(new Event('resize'));
      }
    }
    function schedule(){ if(!pending){pending=true;requestAnimationFrame(update);} }
    function handleResize() {
      var canDesktop = breakpoint.matches && getComputedStyle(desktop).display !== 'none';
      if (canDesktop && !header.classList.contains('mt-desktop-nav-ready')) boot();
      else if (!canDesktop && header.classList.contains('mt-desktop-nav-ready')) {
        desktop.classList.remove('mt-desktop-stuck');
        if(spacer) spacer.style.height='0px';
        if(window.__mtDesktopCleanup) window.__mtDesktopCleanup();
      }
      schedule();
    }
    window.addEventListener('scroll',schedule,{passive:true});
    window.addEventListener('resize',handleResize,{passive:true});
    window.addEventListener('mt-desktop-init',schedule);
    handleResize();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',setupGlobalState,{once:true});
  else setupGlobalState();
})();
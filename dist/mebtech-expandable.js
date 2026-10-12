(() => {
  'use strict';

  const ROOT_SELECTOR =
    '[data-expandable-hero]';

  /*
    IQIT / Elementor may render custom HTML after the external script
    has already executed. Initialize both the current DOM and any
    matching blocks added later. The data-expandable-ready guard inside
    initExpandableHero() prevents duplicate bindings.
  */
  function initScope(scope) {
    if (!scope) {
      return;
    }

    if (
      scope.nodeType === 1 &&
      scope.matches &&
      scope.matches(ROOT_SELECTOR)
    ) {
      initExpandableHero(scope);
    }

    if (scope.querySelectorAll) {
      scope
        .querySelectorAll(ROOT_SELECTOR)
        .forEach(initExpandableHero);
    }
  }

  function boot() {
    initScope(document);

    const observer =
      new MutationObserver(
        mutations => {
          mutations.forEach(
            mutation => {
              mutation.addedNodes.forEach(
                node => {
                  if (
                    node.nodeType === 1
                  ) {
                    initScope(node);
                  }
                }
              );
            }
          );
        }
      );

    observer.observe(
      document.documentElement,
      {
        childList: true,
        subtree: true
      }
    );
  }

  if (
    document.readyState === 'loading'
  ) {
    document.addEventListener(
      'DOMContentLoaded',
      boot,
      {
        once: true
      }
    );
  } else {
    boot();
  }

  function initExpandableHero(root) {
    if (root.dataset.expandableReady === 'true') {
      return;
    }

    const rail =
      root.querySelector('[data-hero-rail]');

    const items =
      [...root.querySelectorAll('[data-hero-item]')];

    const prevButton =
      root.querySelector('[data-hero-prev]');

    const nextButton =
      root.querySelector('[data-hero-next]');

    const counter =
      root.querySelector('[data-hero-counter]');

    if (!rail || !items.length) {
      return;
    }

    root.dataset.expandableReady = 'true';

    const reduceMotion =
      window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      );

    const scrollActive =
      root.dataset.scrollActive !== 'false';

    const swipeEnabled =
      root.dataset.swipe !== 'false';

    const toneAnalysisEnabled =
      root.dataset.toneAnalysis !== 'off';

    let activeIndex =
      Math.max(
        0,
        items.findIndex(
          item =>
            item.classList.contains('is-active')
        )
      );

    let touchStartX = null;
    let touchStartY = null;
    let resizeTimer = null;

    const pad =
      number =>
        String(number).padStart(2, '0');

    function isMobile() {
      return window.matchMedia(
        '(max-width: 767px)'
      ).matches;
    }

    function updateControls() {
      if (prevButton) {
        prevButton.disabled =
          activeIndex === 0;
      }

      if (nextButton) {
        nextButton.disabled =
          activeIndex === items.length - 1;
      }

      if (counter) {
        counter.textContent =
          `${pad(activeIndex + 1)} / ${pad(items.length)}`;
      }
    }

    function syncVideo(
      item,
      isActive
    ) {
      const video =
        item.querySelector('video');

      if (!video) {
        return;
      }

      if (!isActive) {
        video.pause();
        return;
      }

      if (reduceMotion.matches) {
        return;
      }

      const playPromise =
        video.play();

      if (
        playPromise &&
        typeof playPromise.catch === 'function'
      ) {
        playPromise.catch(() => {});
      }
    }

    function ensureVisible() {
      if (!scrollActive) {
        return;
      }

      const activeItem =
        items[activeIndex];

      if (!activeItem) {
        return;
      }

      if (isMobile()) {
        const maxScroll =
          Math.max(
            0,
            rail.scrollWidth -
            rail.clientWidth
          );

        const railRect =
          rail.getBoundingClientRect();

        const itemRect =
          activeItem.getBoundingClientRect();

        const itemLeft =
          itemRect.left -
          railRect.left +
          rail.scrollLeft;

        const target =
          activeIndex === items.length - 1
            ? maxScroll
            : Math.max(
                0,
                Math.min(
                  itemLeft,
                  maxScroll
                )
              );

        rail.scrollTo({
          left: target,
          behavior:
            reduceMotion.matches
              ? 'auto'
              : 'smooth'
        });

        return;
      }

      const railRect =
        rail.getBoundingClientRect();

      const itemRect =
        activeItem.getBoundingClientRect();

      const itemOutsideLeft =
        itemRect.left <
        railRect.left + 8;

      const itemOutsideRight =
        itemRect.right >
        railRect.right - 8;

      if (
        itemOutsideLeft ||
        itemOutsideRight
      ) {
        activeItem.scrollIntoView({
          behavior:
            reduceMotion.matches
              ? 'auto'
              : 'smooth',
          block: 'nearest',
          inline: 'nearest'
        });
      }
    }

    function activate(
      index,
      options = {}
    ) {
      const {
        scroll = false
      } = options;

      activeIndex =
        Math.max(
          0,
          Math.min(
            index,
            items.length - 1
          )
        );

      items.forEach(
        (item, itemIndex) => {
          const isActive =
            itemIndex === activeIndex;

          item.classList.toggle(
            'is-active',
            isActive
          );

          item.setAttribute(
            'aria-current',
            isActive
              ? 'true'
              : 'false'
          );

          syncVideo(
            item,
            isActive
          );
        }
      );

      updateControls();

      if (scroll && scrollActive) {
        if (isMobile()) {
          window.setTimeout(
            ensureVisible,
            reduceMotion.matches
              ? 0
              : 540
          );
        } else {
          requestAnimationFrame(
            ensureVisible
          );
        }
      }

      if (toneAnalysisEnabled) {
        window.setTimeout(
          () => {
            analyzePhotoTone(
              items[activeIndex]
            );
          },
          reduceMotion.matches
            ? 0
            : 560
        );
      }
    }

    /* ===============================================================
       PHOTO TONE ANALYSIS
       =============================================================== */

    function srgbToLinear(value) {
      value /= 255;

      return (
        value <= 0.04045
          ? value / 12.92
          : Math.pow(
              (value + 0.055) / 1.055,
              2.4
            )
      );
    }

    function relativeLuminance(
      red,
      green,
      blue
    ) {
      return (
        0.2126 *
          srgbToLinear(red) +

        0.7152 *
          srgbToLinear(green) +

        0.0722 *
          srgbToLinear(blue)
      );
    }

    function analyzePhotoTone(item) {
      if (
        !toneAnalysisEnabled ||
        !item ||
        item.dataset.type === 'video'
      ) {
        return;
      }

      const image =
        item.querySelector(
          '.expandable-hero__image'
        );

      const media =
        item.querySelector(
          '.expandable-hero__media'
        );

      if (
        !image ||
        !media ||
        !image.naturalWidth ||
        !image.naturalHeight
      ) {
        return;
      }

      const containerWidth =
        media.clientWidth;

      const containerHeight =
        media.clientHeight;

      const scale =
        Math.max(
          containerWidth /
            image.naturalWidth,

          containerHeight /
            image.naturalHeight
        );

      const visibleWidth =
        containerWidth / scale;

      const visibleHeight =
        containerHeight / scale;

      const sourceX =
        (
          image.naturalWidth -
          visibleWidth
        ) / 2;

      const sourceY =
        (
          image.naturalHeight -
          visibleHeight
        ) / 2;

      const sampleY =
        sourceY +
        visibleHeight * 0.64;

      const sampleHeight =
        visibleHeight * 0.36;

      const canvas =
        document.createElement(
          'canvas'
        );

      canvas.width = 40;
      canvas.height = 40;

      const context =
        canvas.getContext(
          '2d',
          {
            willReadFrequently: true
          }
        );

      if (!context) {
        return;
      }

      try {
        context.drawImage(
          image,

          sourceX,
          sampleY,
          visibleWidth,
          sampleHeight,

          0,
          0,
          canvas.width,
          canvas.height
        );

        const pixels =
          context.getImageData(
            0,
            0,
            canvas.width,
            canvas.height
          ).data;

        let luminanceSum = 0;
        let pixelCount = 0;

        for (
          let index = 0;
          index < pixels.length;
          index += 4
        ) {
          const alpha =
            pixels[index + 3];

          if (alpha < 32) {
            continue;
          }

          luminanceSum +=
            relativeLuminance(
              pixels[index],
              pixels[index + 1],
              pixels[index + 2]
            );

          pixelCount++;
        }

        const averageLuminance =
          pixelCount
            ? luminanceSum /
              pixelCount
            : 0.5;

        const useDarkText =
          averageLuminance >= 0.46;

        item.classList.toggle(
          'tone-dark',
          useDarkText
        );

        item.classList.toggle(
          'tone-light',
          !useDarkText
        );

      } catch (error) {
        item.classList.remove(
          'tone-dark'
        );

        item.classList.add(
          'tone-light'
        );
      }
    }

    function analyzeAllImages() {
      if (!toneAnalysisEnabled) {
        return;
      }

      items.forEach(
        item => {
          if (
            item.dataset.type === 'video'
          ) {
            return;
          }

          const image =
            item.querySelector(
              '.expandable-hero__image'
            );

          if (!image) {
            return;
          }

          if (image.complete) {
            analyzePhotoTone(item);
          } else {
            image.addEventListener(
              'load',
              () =>
                analyzePhotoTone(item),
              {
                once: true
              }
            );
          }
        }
      );
    }

    /* ===============================================================
       POINTER / KEYBOARD · PRODUCTION
       ---------------------------------------------------------------
       Desktop principles:
       1. Preview width stays fixed.
       2. Active width is calculated so the visible rail contains only
          complete cards.
       3. Rail moves only when the user activates the visible edge card.
       4. Hover is driven only by real pointermove events.
       5. A very short gate coalesces fast movement, but the latest real
          pointer target is activated automatically — no "wiggle again".
       =============================================================== */

    const TARGET_ACTIVE_WIDTH = 430;
    const MIN_ACTIVE_WIDTH = 340;
    const MAX_ACTIVE_WIDTH = 520;

    const HOVER_GATE_MS = 85;
    const RAIL_ANIMATION_MS = 420;

    let desktopPreviewWidth = 150;
    let desktopGap = 8;
    let desktopActiveWidth = 430;
    let desktopPreviewCount = 1;
    let desktopWindowSize = 2;
    let desktopWindowStart = 0;

    let lastHoverActivationAt = -Infinity;
    let hoverGateTimer = null;
    let latestPointerX = null;
    let latestPointerY = null;

    let railAnimationFrame = null;

    function cssNumber(
      property,
      fallback
    ) {
      const value =
        parseFloat(
          getComputedStyle(root)
            .getPropertyValue(property)
        );

      return Number.isFinite(value)
        ? value
        : fallback;
    }

    function computeDesktopGeometry() {
      if (
        isMobile() ||
        !scrollActive
      ) {
        root.removeAttribute(
          'data-stable-window'
        );

        root.style.removeProperty(
          '--hero-active-width'
        );

        root.style.removeProperty(
          '--hero-preview-width'
        );

        return;
      }

      const MAX_ACTIVE_HEIGHT = 470;
      const ACTIVE_ASPECT_WIDTH = 3;
      const ACTIVE_ASPECT_HEIGHT = 4;

      /*
        3:4 + max-height 470px means the active card may never
        exceed 352.5px in width.
      */
      const FIXED_ACTIVE_WIDTH =
        MAX_ACTIVE_HEIGHT *
        ACTIVE_ASPECT_WIDTH /
        ACTIVE_ASPECT_HEIGHT;

      const PREFERRED_PREVIEW_COUNT = 2;
      const MIN_PREVIEW_WIDTH = 150;

      desktopGap =
        cssNumber(
          '--hero-gap',
          8
        );

      root.setAttribute(
        'data-stable-window',
        'true'
      );

      requestAnimationFrame(
        () => {
          const visibleWidth =
            rail.clientWidth;

          const maxAvailableCount =
            Math.max(
              1,
              Math.min(
                items.length - 1,
                10
              )
            );

          let previewCount =
            Math.min(
              PREFERRED_PREVIEW_COUNT,
              maxAvailableCount
            );

          let activeWidth =
            Math.min(
              FIXED_ACTIVE_WIDTH,
              visibleWidth -
                desktopGap -
                MIN_PREVIEW_WIDTH
            );

          activeWidth =
            Math.max(
              0,
              activeWidth
            );

          let previewWidth =
            (
              visibleWidth -
              activeWidth -
              previewCount *
                desktopGap
            ) /
            previewCount;

          /*
            On an unusually narrow tablet, keep the active banner within
            the 3:4 / 470px constraint and fall back to one full preview.
          */
          if (
            previewWidth <
              MIN_PREVIEW_WIDTH &&
            previewCount > 1
          ) {
            previewCount = 1;

            previewWidth =
              (
                visibleWidth -
                activeWidth -
                desktopGap
              );
          }

          desktopPreviewCount =
            previewCount;

          desktopWindowSize =
            Math.min(
              items.length,
              desktopPreviewCount + 1
            );

          desktopPreviewWidth =
            previewWidth;

          desktopActiveWidth =
            activeWidth;

          root.style.setProperty(
            '--hero-preview-width',
            `${desktopPreviewWidth}px`
          );

          root.style.setProperty(
            '--hero-active-width',
            `${desktopActiveWidth}px`
          );

          desktopWindowStart =
            clampWindowStart(
              desktopWindowStart
            );

          ensureActiveInWindow();

          setRailToWindow(
            'auto'
          );
        }
      );
    }

    function clampWindowStart(
      start
    ) {
      const maxStart =
        Math.max(
          0,
          items.length -
          desktopWindowSize
        );

      return Math.max(
        0,
        Math.min(
          start,
          maxStart
        )
      );
    }

    function ensureActiveInWindow() {
      const windowEnd =
        desktopWindowStart +
        desktopWindowSize -
        1;

      if (
        activeIndex <
        desktopWindowStart
      ) {
        desktopWindowStart =
          activeIndex;
      } else if (
        activeIndex >
        windowEnd
      ) {
        desktopWindowStart =
          activeIndex -
          desktopWindowSize +
          1;
      }

      desktopWindowStart =
        clampWindowStart(
          desktopWindowStart
        );
    }

    function windowScrollTarget() {
      /*
        Every item before windowStart is guaranteed to be inactive.
        Therefore each one is exactly previewWidth + gap.
      */
      return (
        desktopWindowStart *
        (
          desktopPreviewWidth +
          desktopGap
        )
      );
    }

    function cancelRailAnimation() {
      if (
        railAnimationFrame !== null
      ) {
        cancelAnimationFrame(
          railAnimationFrame
        );

        railAnimationFrame = null;
      }
    }

    function easeOutCubic(
      value
    ) {
      return (
        1 -
        Math.pow(
          1 - value,
          3
        )
      );
    }

    function animateRailTo(
      target
    ) {
      cancelRailAnimation();

      const maxScroll =
        Math.max(
          0,
          rail.scrollWidth -
          rail.clientWidth
        );

      target =
        Math.max(
          0,
          Math.min(
            target,
            maxScroll
          )
        );

      const start =
        rail.scrollLeft;

      const delta =
        target - start;

      if (
        reduceMotion.matches ||
        Math.abs(delta) < 1
      ) {
        rail.scrollLeft =
          target;

        return;
      }

      const startedAt =
        performance.now();

      const tick =
        now => {
          const progress =
            Math.min(
              1,
              (
                now -
                startedAt
              ) /
              RAIL_ANIMATION_MS
            );

          rail.scrollLeft =
            start +
            delta *
              easeOutCubic(
                progress
              );

          if (
            progress < 1
          ) {
            railAnimationFrame =
              requestAnimationFrame(
                tick
              );
          } else {
            railAnimationFrame = null;

            rail.scrollLeft =
              target;
          }
        };

      railAnimationFrame =
        requestAnimationFrame(
          tick
        );
    }

    function setRailToWindow(
      behavior = 'smooth'
    ) {
      if (
        isMobile() ||
        !scrollActive
      ) {
        return;
      }

      const target =
        windowScrollTarget();

      if (
        behavior === 'auto'
      ) {
        cancelRailAnimation();

        rail.scrollLeft =
          target;

        return;
      }

      animateRailTo(
        target
      );
    }

    function shiftWindowForActivation(
      nextIndex,
      direction
    ) {
      const oldStart =
        desktopWindowStart;

      const oldEnd =
        oldStart +
        desktopWindowSize -
        1;

      if (
        direction > 0
      ) {
        /*
          If the user activates the current right edge,
          reveal one new complete preview to the right.
        */
        if (
          nextIndex >= oldEnd &&
          oldEnd <
            items.length - 1
        ) {
          desktopWindowStart =
            oldStart + 1;
        } else if (
          nextIndex > oldEnd
        ) {
          desktopWindowStart =
            nextIndex -
            desktopWindowSize +
            1;
        }
      } else if (
        direction < 0
      ) {
        /*
          Mirror behavior on the left edge.
        */
        if (
          nextIndex <= oldStart &&
          oldStart > 0
        ) {
          desktopWindowStart =
            oldStart - 1;
        } else if (
          nextIndex < oldStart
        ) {
          desktopWindowStart =
            nextIndex;
        }
      }

      desktopWindowStart =
        clampWindowStart(
          desktopWindowStart
        );

      ensureActiveInWindow();
    }

    function activateDesktop(
      index
    ) {
      const nextIndex =
        Math.max(
          0,
          Math.min(
            index,
            items.length - 1
          )
        );

      if (
        nextIndex === activeIndex
      ) {
        return;
      }

      const oldIndex =
        activeIndex;

      const direction =
        nextIndex > oldIndex
          ? 1
          : -1;

      /*
        Decide window movement from the PREVIOUS stable state.
        Then active/inactive widths swap inside a window whose total
        visible width is already mathematically fixed.
      */
      shiftWindowForActivation(
        nextIndex,
        direction
      );

      activate(
        nextIndex,
        {
          scroll: false
        }
      );

      requestAnimationFrame(
        () =>
          setRailToWindow(
            'smooth'
          )
      );
    }

    function activateByInput(
      index
    ) {
      if (isMobile()) {
        activate(
          index,
          {
            scroll:
              scrollActive
          }
        );

        return;
      }

      activateDesktop(
        index
      );
    }

    function itemAtPointer() {
      if (
        latestPointerX === null ||
        latestPointerY === null
      ) {
        return null;
      }

      const hit =
        document.elementFromPoint(
          latestPointerX,
          latestPointerY
        );

      if (!hit) {
        return null;
      }

      const item =
        hit.closest(
          '[data-hero-item]'
        );

      if (
        !item ||
        !root.contains(item)
      ) {
        return null;
      }

      return item;
    }

    function runLatestHoverIntent() {
      hoverGateTimer = null;

      const item =
        itemAtPointer();

      if (!item) {
        return;
      }

      const index =
        items.indexOf(item);

      if (
        index < 0 ||
        index === activeIndex
      ) {
        return;
      }

      lastHoverActivationAt =
        performance.now();

      activateByInput(
        index
      );
    }

    /*
      Hover, click/focus, arrows and mobile swipe now converge on
      activateByInput(), so the transition/rail movement is identical.
    */
    function requestHoverFromPointer() {
      const item =
        itemAtPointer();

      if (!item) {
        return;
      }

      const index =
        items.indexOf(item);

      if (
        index < 0 ||
        index === activeIndex
      ) {
        return;
      }

      const now =
        performance.now();

      const remaining =
        HOVER_GATE_MS -
        (
          now -
          lastHoverActivationAt
        );

      if (
        remaining <= 0
      ) {
        clearTimeout(
          hoverGateTimer
        );

        hoverGateTimer = null;

        lastHoverActivationAt =
          now;

        activateByInput(
          index
        );

        return;
      }

      /*
        Do not ask the user to move again.
        Their latest real pointer position is kept and automatically
        processed as soon as the tiny gate expires.
      */
      clearTimeout(
        hoverGateTimer
      );

      hoverGateTimer =
        window.setTimeout(
          runLatestHoverIntent,
          remaining
        );
    }

    /*
      Only real pointer movement can create hover intent.
      Layout/rail movement underneath a stationary cursor is ignored.
    */
    root.addEventListener(
      'pointermove',
      event => {
        const hasHover =
          window.matchMedia(
            '(hover: hover) and (pointer: fine)'
          ).matches;

        if (
          !hasHover ||
          isMobile() ||
          (
            event.pointerType &&
            event.pointerType !== 'mouse'
          )
        ) {
          return;
        }

        latestPointerX =
          event.clientX;

        latestPointerY =
          event.clientY;

        requestHoverFromPointer();
      },
      {
        passive: true
      }
    );

    root.addEventListener(
      'pointerleave',
      () => {
        latestPointerX = null;
        latestPointerY = null;

        clearTimeout(
          hoverGateTimer
        );

        hoverGateTimer = null;
      }
    );

    items.forEach(
      (item, index) => {
        item.addEventListener(
          'click',
          () => {
            clearTimeout(
              hoverGateTimer
            );

            activateByInput(
              index
            );
          }
        );

        item.addEventListener(
          'focus',
          () => {
            clearTimeout(
              hoverGateTimer
            );

            activateByInput(
              index
            );
          }
        );

        item.addEventListener(
          'keydown',
          event => {
            const shouldActivate =
              event.key === 'Enter' ||
              event.key === ' ';

            if (!shouldActivate) {
              return;
            }

            event.preventDefault();

            clearTimeout(
              hoverGateTimer
            );

            activateByInput(
              index
            );
          }
        );
      }
    );

    /* ===============================================================
       OPTIONAL ARROWS
       =============================================================== */

    if (prevButton) {
      prevButton.addEventListener(
        'click',
        () => {
          activateByInput(
            activeIndex - 1
          );
        }
      );
    }

    if (nextButton) {
      nextButton.addEventListener(
        'click',
        () => {
          activateByInput(
            activeIndex + 1
          );
        }
      );
    }

    /* ===============================================================
       OPTIONAL MOBILE SWIPE · V6.3
       One gesture = one adjacent item.
       The rail itself no longer follows the finger horizontally.
       =============================================================== */

    if (swipeEnabled) {
      rail.addEventListener(
        'touchstart',
        event => {
          const touch =
            event.touches[0];

          touchStartX =
            touch.clientX;

          touchStartY =
            touch.clientY;
        },
        {
          passive: true
        }
      );

      rail.addEventListener(
        'touchend',
        event => {
          if (
            touchStartX === null ||
            touchStartY === null
          ) {
            return;
          }

          const touch =
            event.changedTouches[0];

          const deltaX =
            touch.clientX -
            touchStartX;

          const deltaY =
            touch.clientY -
            touchStartY;

          const horizontalDistance =
            Math.abs(deltaX);

          const verticalDistance =
            Math.abs(deltaY);

          const isHorizontalSwipe =
            horizontalDistance > 42 &&
            horizontalDistance >
              verticalDistance * 1.15;

          if (isHorizontalSwipe) {
            const direction =
              deltaX < 0
                ? 1
                : -1;

            /*
              Same path as arrow buttons:
              one swipe = exactly one adjacent item.
            */
            activateByInput(
              activeIndex +
              direction
            );
          }

          touchStartX = null;
          touchStartY = null;
        },
        {
          passive: true
        }
      );

      rail.addEventListener(
        'touchcancel',
        () => {
          touchStartX = null;
          touchStartY = null;
        },
        {
          passive: true
        }
      );
    }

    /* ===============================================================
       RESIZE / INIT
       =============================================================== */

    window.addEventListener(
      'resize',
      () => {
        clearTimeout(
          resizeTimer
        );

        resizeTimer =
          setTimeout(
            () => {
              computeDesktopGeometry();

              if (isMobile()) {
                ensureVisible();
              }

              analyzeAllImages();
            },
            160
          );
      }
    );

    analyzeAllImages();

    activate(
      activeIndex,
      {
        scroll: false
      }
    );

    computeDesktopGeometry();
  }
})();

document.addEventListener('click', function(e){
  const link = e.target.closest('.beta-block a[href="#"]');
  if (link) e.preventDefault();
});

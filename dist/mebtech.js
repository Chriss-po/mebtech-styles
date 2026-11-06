/* MEBTECH PRODUCTION JAVASCRIPT BUNDLE. Generated from src/js; do not edit directly. */
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

    const loopEnabled =
      scrollActive &&
      root.dataset.loop !== 'false' &&
      items.length > 1;

    function updateControls() {
      if (prevButton) {
        prevButton.disabled =
          !loopEnabled &&
          activeIndex === 0;
      }

      if (nextButton) {
        nextButton.disabled =
          !loopEnabled &&
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
        /*
          On mobile item sizes change immediately (no width transition),
          so there is no 540ms geometry wait before horizontal movement.
        */
        requestAnimationFrame(
          ensureVisible
        );
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

    function computeMobileGeometry() {
      if (
        !isMobile() ||
        !scrollActive
      ) {
        root.style.removeProperty(
          '--hero-mobile-stage-height'
        );

        return;
      }

      requestAnimationFrame(
        () => {
          /*
            The root is the container-query reference used by
            mobile item widths. rail.clientWidth may be different
            due to surrounding CMS/container padding.
          */
          const visibleWidth =
            root.clientWidth;

          const gap =
            cssNumber(
              '--hero-gap',
              8
            );

          /*
            Responsive Home Hero window:
            <=440px: one preview; 441..767px: two previews.
            Gallery has scrollActive=false and is excluded above.
            Match the CSS clamp so stage geometry remains accurate.
          */
          const previewCount =
            window.matchMedia(
              '(min-width: 441px) and (max-width: 767px)'
            ).matches
              ? 2
              : 1;

          const activeWidth =
            previewCount === 2
              ? Math.min(
                  312,
                  Math.max(
                    168,
                    visibleWidth * 0.56
                  )
                )
              : Math.max(
                  0,
                  visibleWidth -
                    cssNumber(
                      '--hero-preview-width-mobile',
                      112
                    ) -
                    gap
                );

          const previewWidth =
            previewCount === 2
              ? Math.max(
                  0,
                  (
                    visibleWidth -
                    activeWidth -
                    previewCount * gap
                  ) / previewCount
                )
              : cssNumber(
                  '--hero-preview-width-mobile',
                  112
                );

          const activeMediaHeight =
            activeWidth * 4 / 3;

          const previewMediaHeight =
            previewWidth * 267 / 150;

          /*
            All preview captions are measured at the inactive item
            width, even the currently active one's caption, which
            mobile CSS removes from the layout.
            This is performed offscreen before the next paint.
          */
          let tallestPreviewCaption = 104;

          const measurementItem =
            document.createElement('div');

          measurementItem.className =
            'expandable-hero__item';

          measurementItem.setAttribute(
            'aria-hidden',
            'true'
          );

          measurementItem.style.cssText =
            'position:absolute;' +
            'left:-10000px;' +
            'top:0;' +
            'width:' + previewWidth + 'px;' +
            'visibility:hidden;' +
            'pointer-events:none;' +
            'transition:none;';

          root.appendChild(
            measurementItem
          );

          try {
            items.forEach(
              item => {
                const preview =
                  item.querySelector(
                    '.expandable-hero__preview'
                  );

                if (!preview) {
                  return;
                }

                const sample =
                  preview.cloneNode(true);

                measurementItem.appendChild(
                  sample
                );

                tallestPreviewCaption =
                  Math.max(
                    tallestPreviewCaption,
                    sample.getBoundingClientRect().height
                  );

                sample.remove();
              }
            );
          } finally {
            measurementItem.remove();
          }

          const stableStageHeight =
            Math.ceil(
              Math.max(
                activeMediaHeight,
                previewMediaHeight +
                  tallestPreviewCaption
              )
            ) + 2; // border/rounding safety

          root.style.setProperty(
            '--hero-mobile-stage-height',
            `${stableStageHeight}px`
          );
        }
      );
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

        root.style.removeProperty(
          '--hero-stage-height'
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

      const MIN_PREVIEW_WIDTH = 150;
      const MAX_PREVIEW_WIDTH = 212;
      const MAX_PREVIEW_COUNT = 6;

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
                MAX_PREVIEW_COUNT
              )
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

          const availableForPreviews =
            Math.max(
              0,
              visibleWidth -
                activeWidth
            );

          /*
            Adaptive desktop window:
            choose the smallest number of previews that keeps each
            preview at or below MAX_PREVIEW_WIDTH. This fills the rail
            without side holes while preserving 9:16 preview geometry.
          */
          let previewCount =
            Math.max(
              1,
              Math.min(
                maxAvailableCount,
                Math.ceil(
                  (
                    availableForPreviews +
                    desktopGap
                  ) /
                  (
                    MAX_PREVIEW_WIDTH +
                    desktopGap
                  )
                )
              )
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
            If a narrow tablet cannot keep all calculated previews above
            the minimum readable width, reduce the count until it can.
          */
          while (
            previewCount > 1 &&
            previewWidth <
              MIN_PREVIEW_WIDTH
          ) {
            previewCount -= 1;

            previewWidth =
              (
                visibleWidth -
                activeWidth -
                previewCount *
                  desktopGap
              ) /
              previewCount;
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

          const desktopStageHeight =
            Math.min(
              MAX_ACTIVE_HEIGHT,
              desktopActiveWidth *
                ACTIVE_ASPECT_HEIGHT /
                ACTIVE_ASPECT_WIDTH
            );

          root.style.setProperty(
            '--hero-stage-height',
            `${desktopStageHeight}px`
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
      /*
        Static variants (Gallery: data-scroll-active="false")
        do not use Hero rail-window geometry. They only switch the
        active item so the flex transition can expand/collapse cards.
      */
      if (
        isMobile() ||
        !scrollActive
      ) {
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

    function navigateByStep(
      direction
    ) {
      const rawIndex =
        activeIndex + direction;

      if (
        !loopEnabled ||
        (
          rawIndex >= 0 &&
          rawIndex < items.length
        )
      ) {
        activateByInput(
          rawIndex
        );
        return;
      }

      const wrappedIndex =
        rawIndex < 0
          ? items.length - 1
          : 0;

      /*
        At the loop boundary, do not sweep through every intermediate
        card. Reposition the stable desktop window immediately, then
        activate the wrapped item.
      */
      if (
        !isMobile() &&
        scrollActive
      ) {
        desktopWindowStart =
          wrappedIndex === 0
            ? 0
            : clampWindowStart(
                items.length -
                desktopWindowSize
              );

        activate(
          wrappedIndex,
          {
            scroll: false
          }
        );

        requestAnimationFrame(
          () =>
            setRailToWindow(
              'auto'
            )
        );

        return;
      }

      if (isMobile() && scrollActive) {
        /*
          A loop wrap is one jump, not a smooth sweep through every
          intermediate category/banner.
        */
        activate(
          wrappedIndex,
          {
            scroll: false
          }
        );

        const target =
          wrappedIndex === 0
            ? 0
            : Math.max(
                0,
                rail.scrollWidth - rail.clientWidth
              );

        rail.scrollTo({
          left: target,
          behavior: 'instant'
        });

        return;
      }

      activate(
        wrappedIndex,
        {
          scroll:
            scrollActive
        }
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
          navigateByStep(
            -1
          );
        }
      );
    }

    if (nextButton) {
      nextButton.addEventListener(
        'click',
        () => {
          navigateByStep(
            1
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
            navigateByStep(
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
              computeMobileGeometry();
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

    computeMobileGeometry();
    computeDesktopGeometry();

    /*
      Re-measure captions after late-loading UI fonts are available.
      This is unrelated to slide state; stage remains unchanged across
      subsequent arrow/swipe interactions.
    */
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(
        () => {
          if (document.contains(root)) {
            computeMobileGeometry();
          }
        }
      );
    }
  }
})();


/* v1.5.7 · shared Design System carousel pagination */
/* MebTech · Integrated DS pagination v1.5.7 · Reuse EXISTING Design System pagination.
   Output is native DS markup: ul.slick-dots > li > button.
   Visuals come exclusively from shared global .slick-dots CSS.
   No HTML edits. Replace earlier Hero Dots Global JS, don't stack.
   User-approved live-site pagination behavior, 2026-10-13. */
(function () {
  'use strict';

  function initPagination(root) {
    if (!root || root.dataset.mtSystemDotsReady === 'true') return;
    var isGallery = root.classList.contains('expandable-hero--gallery');
    var items = Array.prototype.slice.call(root.querySelectorAll('[data-hero-item]'));
    if (items.length < 2) return;

    if (!isGallery && root.dataset.scrollActive === 'false') return;
    var controls = isGallery ? null : root.querySelector('.expandable-hero__controls');
    if (!isGallery && !controls) return;

    // Compatible with previous TEST v6, but remove old JS v2 from Global JS.
    Array.prototype.forEach.call(root.querySelectorAll('.mt-hero-dots'),
      function (el) { el.remove(); });
    if (isGallery) {
      controls = root.querySelector('.mt-gallery-dot-controls');
      if (!controls) {
        controls = document.createElement('div');
        controls.className = 'mt-gallery-dot-controls';
        root.appendChild(controls);
      }
    }

    root.dataset.mtSystemDotsReady = 'true';
    var list = document.createElement('ul');
    list.className = 'slick-dots mt-system-pagination';
    list.setAttribute('aria-label', isGallery
      ? 'Навігація фотографіями галереї' : 'Навігація банерами');

    var buttons = items.map(function (item, index) {
      var li = document.createElement('li');
      var button = document.createElement('button');
      button.type = 'button';
      button.setAttribute('aria-label',
        (isGallery ? 'Фото ' : 'Банер ') + (index + 1) + ' із ' + items.length);
      button.setAttribute('aria-current', 'false');

      button.addEventListener('click', function () {
        // Existing Expandable Media activates items on focus.
        // Hero slides can be links: do NOT call their click handler.
        var wasFocusable = item.matches(
          'a[href],button,input,select,textarea,[tabindex]');
        if (!wasFocusable) item.setAttribute('tabindex', '-1');
        try { item.focus({ preventScroll: true }); }
        catch (err) { item.focus(); }
        if (!wasFocusable) item.removeAttribute('tabindex');
        try { button.focus({ preventScroll: true }); }
        catch (err) { button.focus(); }
        requestAnimationFrame(sync);
      });
      li.appendChild(button);
      list.appendChild(li);
      return { li: li, button: button };
    });

    function sync() {
      var active = items.findIndex(function (item) {
        return item.classList.contains('is-active');
      });
      if (active < 0) active = 0;
      buttons.forEach(function (entry, i) {
        entry.li.classList.toggle('slick-active', i === active);
        entry.button.setAttribute('aria-current', i === active ? 'true' : 'false');
      });
    }

    controls.appendChild(list);
    var observer = new MutationObserver(function () { requestAnimationFrame(sync); });
    items.forEach(function (item) {
      observer.observe(item, { attributes: true, attributeFilter: ['class'] });
    });
    sync();
  }

  function initAll(scope) {
    if (!scope || !scope.querySelectorAll) return;
    if (scope.matches && scope.matches('[data-expandable-hero]'))
      initPagination(scope);
    Array.prototype.forEach.call(
      scope.querySelectorAll('[data-expandable-hero]'), initPagination);
  }

  function boot() {
    initAll(document);
    if (!document.body) return;
    var observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        mutation.addedNodes.forEach(function (node) {
          if (node.nodeType === 1) initAll(node);
        });
      });
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }
})();

/* v1.5.7 · coordinated mobile Hero motion (site-tested adapter) */
/*
 * MebTech — Mobile Expandable Hero coordinated motion · v1.5.7
 * Integrated after native component and DS pagination.
 * Preserves the user-approved coordinated mobile scroll behavior.
 * Works with existing production Expandable Hero initializer: no new slider.
 * Home Hero only, <=767px. Desktop and Showroom Gallery unchanged.
 */
(function () {
  'use strict';

  var SELECTOR = '[data-expandable-hero]:not(.expandable-hero--gallery)';
  var mobile = window.matchMedia('(max-width: 767px)');
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  var DURATION = 520; // Matches existing DS Hero card motion: 520ms.

  function ease(t) {
    // Cubic-bezier(.2,.8,.2,1) is approximated for scroll interpolation;
    // geometry transitions continue using the original CSS bezier.
    return 1 - Math.pow(1 - t, 3);
  }

  function mount(root) {
    if (root.dataset.mtCoordinatedMotion === 'v8') return;
    if (root.dataset.scrollActive === 'false') return;

    var rail = root.querySelector('[data-hero-rail]');
    var track = root.querySelector('.expandable-hero__track');
    var items = Array.prototype.slice.call(root.querySelectorAll('[data-hero-item]'));
    if (!rail || !track || items.length < 3) return;

    var nativeScrollTo = rail.scrollTo.bind(rail);
    var activeIndex = items.findIndex(function (node) {
      return node.classList.contains('is-active');
    });
    if (activeIndex < 0) activeIndex = 0;

    var animationFrame = 0;
    var resizeFrame = 0;

    function previewWidth() {
      // Read a stable INACTIVE card, not the two cards changing size.
      var widths = items.reduce(function (arr, item, index) {
        if (index === activeIndex || item.classList.contains('is-active')) return arr;
        var width = item.getBoundingClientRect().width;
        if (width > 0) arr.push(width);
        return arr;
      }, []);
      return widths.length ? Math.min.apply(null, widths) : 0;
    }

    function target() {
      var preview = previewWidth();
      var styles = window.getComputedStyle(track);
      var gap = parseFloat(styles.columnGap || styles.gap) || 0;
      var maxScroll = Math.max(0, rail.scrollWidth - rail.clientWidth);
      // In the final layout, all preceding cards are preview-sized.
      // The last card naturally clamps to the end of the real track.
      var settled = activeIndex * (preview + gap);
      return Math.max(0, Math.min(settled, maxScroll));
    }

    function setScroll(x) {
      // No native smooth-scroll race: the animation loop owns scrollLeft.
      var max = Math.max(0, rail.scrollWidth - rail.clientWidth);
      rail.scrollLeft = Math.max(0, Math.min(x, max));
    }

    function cancel() {
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
      animationFrame = 0;
    }

    function move(nextIndex, priorIndex) {
      cancel();
      if (!mobile.matches || reduced.matches) return;
      var from = rail.scrollLeft;
      var wrapped = Math.abs(nextIndex - priorIndex) > 1;
      if (wrapped) {
        // Direct dots jumps / 1↔last wraps do not sweep through all banners.
        setScroll(target());
        // Re-clamp after the width interpolation settles.
        window.setTimeout(function () {
          if (activeIndex === nextIndex && mobile.matches) setScroll(target());
        }, DURATION + 40);
        return;
      }
      var start = performance.now();
      function tick(now) {
        if (!mobile.matches || reduced.matches) {
          animationFrame = 0;
          return;
        }
        var p = Math.min(1, (now - start) / DURATION);
        setScroll(from + (target() - from) * ease(p));
        if (p < 1) animationFrame = requestAnimationFrame(tick);
        else {
          animationFrame = 0;
          setScroll(target());
        }
      }
      animationFrame = requestAnimationFrame(tick);
    }

    // Native mobile ensureVisible() still calls rail.scrollTo after activation.
    // Prevent a second, conflicting animation ONLY while this test mode is on.
    rail.scrollTo = function (options, top) {
      if (!mobile.matches || reduced.matches) {
        // Preserve the native overload. Passing (options, undefined)
        // changes scrollTo({left}) into scrollTo(x,y) and resets x to 0.
        return arguments.length > 1
          ? nativeScrollTo(options, top)
          : nativeScrollTo(options);
      }
      return undefined;
    };

    var observer = new MutationObserver(function () {
      var nextIndex = items.findIndex(function (node) {
        return node.classList.contains('is-active');
      });
      if (nextIndex < 0 || nextIndex === activeIndex) return;
      var priorIndex = activeIndex;
      activeIndex = nextIndex;
      move(nextIndex, priorIndex);
    });
    items.forEach(function (item) {
      observer.observe(item, { attributes: true, attributeFilter: ['class'] });
    });

    window.addEventListener('resize', function () {
      if (resizeFrame) cancelAnimationFrame(resizeFrame);
      resizeFrame = requestAnimationFrame(function () {
        resizeFrame = 0;
        if (mobile.matches && !reduced.matches && !animationFrame) {
          setScroll(target());
        }
      });
    }, { passive: true });

    root.dataset.mtCoordinatedMotion = 'v8';
  }

  function scan(scope) {
    if (!scope || !scope.querySelectorAll) return;
    if (scope.matches && scope.matches(SELECTOR)) mount(scope);
    Array.prototype.forEach.call(scope.querySelectorAll(SELECTOR), mount);
  }

  function boot() {
    scan(document);
    if (!document.body) return;
    var domObserver = new MutationObserver(function (changes) {
      changes.forEach(function (change) {
        change.addedNodes.forEach(function (node) {
          if (node.nodeType === 1) scan(node);
        });
      });
    });
    domObserver.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }
})();

;
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
    // Category slugs are translated by PrestaShop. Resolve links by their
    // stable category IDs and preserve the actual native URL of this locale.
    // Never select an unrelated CMS link or a different-language destination.
    function safeCloneCategoryLink(categoryId, title, className) {
      var locale = russian ? 'ru' : 'uk';
      var idPattern = new RegExp('^/' + locale + '/c' + categoryId + '(?:-|$)');
      var selectors = 'a[href*="c' + categoryId + '-"]';
      var roots = [
        header.querySelector('#_desktop_iqitmegamenu-mobile'),
        desktop,
        header,
        document
      ];
      for (var k = 0; k < roots.length; k++) {
        var scope = roots[k];
        if (!scope) continue;
        var sources = scope.querySelectorAll(selectors);
        for (var m = 0; m < sources.length; m++) {
          var href = sources[m].getAttribute('href');
          if (!href) continue;
          var url;
          try { url = new URL(href, location.href); } catch (e) { continue; }
          if (url.origin !== location.origin || !idPattern.test(url.pathname)) continue;
          var a = document.createElement('a');
          a.href = url.href;
          a.textContent = title;
          a.className = className || '';
          return a;
        }
      }
      return null;
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
    var offers = safeCloneCategoryLink('1207',words.offers,'mt-utility-offers');
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
    var custom = safeCloneCategoryLink('1212',words.custom,'mt-utility-custom');
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
    // IQIT renders the real native cart under its hidden sticky holder while
    // leaving #ps-shoppingcart-wrapper empty. Preserve and relocate the SAME
    // #ps-shoppingcart node, retaining its native AJAX updates and handlers.
    var liveCart = desktop.querySelector('#ps-shoppingcart');
    var nativeCartHome = liveCart && liveCart.parentNode;
    var nativeCartSibling = liveCart && liveCart.nextSibling;
    var pendingCart = false;
    function restoreNativeCart() {
      var current = desktop.querySelector('#ps-shoppingcart') || liveCart;
      if (!current || !nativeCartHome || !nativeCartHome.isConnected ||
          current.parentNode === nativeCartHome) return;
      if (nativeCartSibling && nativeCartSibling.parentNode === nativeCartHome) {
        nativeCartHome.insertBefore(current, nativeCartSibling);
      } else {
        nativeCartHome.appendChild(current);
      }
    }
    function putCartBack() {
      pendingCart = false;
      if (!header.classList.contains('mt-desktop-nav-ready') &&
          !header.classList.contains('mt-desktop-nav-booting')) return;
      var cart = header.querySelector('#ps-shoppingcart-wrapper');
      if (cart && cart.parentNode !== actionsRow) actionsRow.appendChild(cart);
      var nativeCart = desktop.querySelector('#ps-shoppingcart');
      if (!cart || !nativeCart) return;
      if (nativeCart !== liveCart) {
        liveCart = nativeCart;
        if (!nativeCartHome || !nativeCartHome.isConnected) {
          nativeCartHome = nativeCart.parentNode;
          nativeCartSibling = nativeCart.nextSibling;
        }
      }
      if (nativeCart.parentNode !== cart) cart.appendChild(nativeCart);
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
    if (originalCart) cartObserver.observe(originalCart,{childList:true});
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
      if (window.prestashop && typeof window.prestashop.off === 'function') {
        window.prestashop.off('updatedCart',requestCart);
      }
      // Return the original native cart subtree to IQIT before restoring shell.
      restoreNativeCart();
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
    window.addEventListener('resize',requestCart,{signal:globalEventAbort.signal,passive:true});
    window.addEventListener('scroll',requestCart,{signal:globalEventAbort.signal,passive:true});
    document.addEventListener('prestashop:updatedCart',requestCart,{signal:globalEventAbort.signal});
    if (window.prestashop && typeof window.prestashop.on === 'function') {
      window.prestashop.on('updatedCart',requestCart);
    }

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
;
/* MebTech · Furniture Showcase · v1.0
   Reuses existing DS furniture-showcase / trust-benefits / slick-dots CSS.
   Load globally once (defer); HTML blocks contain markup only.
*/
(() => {
  'use strict';

  const SELECTOR = '.furniture-showcase';
  const DELAY = 9000;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const instances = new Map();

  function init(root) {
    if (instances.has(root)) return;

    const media = root.querySelector('.furniture-showcase__media');
    const slider = root.querySelector('.furniture-showcase__slider');
    const slides = [...root.querySelectorAll('.furniture-showcase__slide')];
    if (!media || !slider || !slides.length) return;

    root.setAttribute('role', 'region');
    root.setAttribute('aria-roledescription', 'карусель');
    if (!root.hasAttribute('aria-label')) {
      root.setAttribute('aria-label', 'Реалізовані меблеві проєкти');
    }
    slider.setAttribute('aria-live', 'off');

    // Reuse existing DS pagination. Legacy static dots are replaced.
    let dots = media.querySelector('.furniture-showcase__dots');
    if (!dots) {
      dots = document.createElement('ul');
      dots.className = 'slick-dots furniture-showcase__dots';
      media.appendChild(dots);
    }
    dots.classList.add('slick-dots', 'furniture-showcase__dots');
    dots.setAttribute('aria-label', 'Навігація по проєктах');
    const buttons = slides.map((_, index) => {
      const li = document.createElement('li');
      const button = document.createElement('button');
      button.type = 'button';
      button.setAttribute('aria-label', 'Проєкт ' + (index + 1) + ' із ' + slides.length);
      li.appendChild(button);
      return { li, button };
    });
    dots.replaceChildren(...buttons.map(entry => entry.li));
    if (slides.length < 2) dots.style.setProperty('display', 'none', 'important');
    else dots.style.removeProperty('display');

    let current = Math.max(0, slides.findIndex(slide => slide.classList.contains('is-active')));
    let timer = null;
    let hovered = false;
    let focused = false;
    let inView = true;
    let touchStart = null;
    const events = new AbortController();

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach((slide, i) => {
        const active = i === current;
        slide.classList.toggle('is-active', active);
        slide.setAttribute('aria-hidden', String(!active));
        slide.inert = !active;
        slide.setAttribute('role', 'group');
        slide.setAttribute('aria-roledescription', 'слайд');
        slide.setAttribute('aria-label', 'Проєкт ' + (i + 1) + ' із ' + slides.length);
      });
      buttons.forEach(({ li, button }, i) => {
        const active = i === current;
        li.classList.toggle('slick-active', active);
        if (active) button.setAttribute('aria-current', 'true');
        else button.removeAttribute('aria-current');
      });
    }

    function stop() {
      if (timer !== null) window.clearInterval(timer);
      timer = null;
    }

    function syncAutoplay() {
      stop();
      if (slides.length < 2 || hovered || focused || !inView ||
          document.hidden || reducedMotion.matches || !root.isConnected) return;
      timer = window.setInterval(() => show(current + 1), DELAY);
    }

    function activate(index) {
      show(index);
      syncAutoplay();
    }

    buttons.forEach(({ button }, index) => {
      button.addEventListener('click', () => activate(index), { signal: events.signal });
      button.addEventListener('keydown', event => {
        let next;
        if (event.key === 'ArrowRight') next = (index + 1) % slides.length;
        else if (event.key === 'ArrowLeft') next = (index - 1 + slides.length) % slides.length;
        else if (event.key === 'Home') next = 0;
        else if (event.key === 'End') next = slides.length - 1;
        else return;
        event.preventDefault();
        activate(next);
        buttons[next].button.focus();
      }, { signal: events.signal });
    });

    root.addEventListener('mouseenter', () => { hovered = true; syncAutoplay(); }, { signal: events.signal });
    root.addEventListener('mouseleave', () => { hovered = false; syncAutoplay(); }, { signal: events.signal });
    root.addEventListener('focusin', () => { focused = true; syncAutoplay(); }, { signal: events.signal });
    root.addEventListener('focusout', event => {
      if (!root.contains(event.relatedTarget)) { focused = false; syncAutoplay(); }
    }, { signal: events.signal });
    document.addEventListener('visibilitychange', syncAutoplay, { signal: events.signal });
    if (reducedMotion.addEventListener) {
      reducedMotion.addEventListener('change', syncAutoplay, { signal: events.signal });
    }

    // Mobile-only swipe. Passive events preserve vertical page scrolling.
    const mobileSwipe = window.matchMedia('(max-width: 767px)');
    slider.addEventListener('touchstart', event => {
      if (!mobileSwipe.matches) { touchStart = null; return; }
      if (event.touches.length !== 1) { touchStart = null; return; }
      touchStart = { x: event.touches[0].clientX, y: event.touches[0].clientY };
    }, { passive: true, signal: events.signal });
    slider.addEventListener('touchend', event => {
      if (!mobileSwipe.matches) { touchStart = null; return; }
      if (!touchStart || event.changedTouches.length !== 1) return;
      const dx = event.changedTouches[0].clientX - touchStart.x;
      const dy = event.changedTouches[0].clientY - touchStart.y;
      touchStart = null;
      if (Math.abs(dx) >= 48 && Math.abs(dx) > Math.abs(dy) * 1.35) {
        activate(current + (dx < 0 ? 1 : -1));
      }
    }, { passive: true, signal: events.signal });
    slider.addEventListener('touchcancel', () => { touchStart = null; }, { passive: true, signal: events.signal });

    let visibilityObserver = null;
    if ('IntersectionObserver' in window) {
      visibilityObserver = new IntersectionObserver(entries => {
        inView = entries[0]?.isIntersecting ?? true;
        syncAutoplay();
      }, { threshold: 0.15 });
      visibilityObserver.observe(root);
    }

    show(current);
    syncAutoplay();
    instances.set(root, () => {
      stop();
      events.abort();
      if (visibilityObserver) visibilityObserver.disconnect();
    });
  }

  function scan(scope) {
    if (scope.nodeType !== 1 && scope.nodeType !== 9) return;
    if (scope.matches?.(SELECTOR)) init(scope);
    scope.querySelectorAll?.(SELECTOR).forEach(init);
  }

  function boot() {
    scan(document);
    // IQIT/Elementor may inject or replace HTML asynchronously.
    const observer = new MutationObserver(records => {
      let hasNewContent = false;
      let removedContent = false;
      for (const record of records) {
        if (record.removedNodes.length) removedContent = true;
        for (const node of record.addedNodes) {
          if (node.nodeType !== 1) continue;
          // Ignore navigation nodes generated by this controller.
          if (node.matches?.(SELECTOR) || node.querySelector?.(SELECTOR)) {
            scan(node);
            hasNewContent = true;
          }
        }
      }
      if (hasNewContent || removedContent) {
        for (const [root, destroy] of instances) {
          if (!root.isConnected) { destroy(); instances.delete(root); }
        }
      }
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else boot();
})();

;
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
      var open = button.getAttribute('aria-expanded') === 'true';
      var mobile = window.matchMedia('(max-width: 767px)').matches;
      var initialTop = mobile ? button.getBoundingClientRect().top : 0;
      button.setAttribute('aria-expanded', String(!open));
      content.hidden = open;
      if (mobile && !open) {
        requestAnimationFrame(function () {
          // Keep the trigger at the tapped position; panel expands BELOW it.
          var displacement = button.getBoundingClientRect().top - initialTop;
          if (Math.abs(displacement) > 1) window.scrollBy(0, displacement);
        });
      }
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
    // The owner approved ONE full-width accordion using the existing PDP
    // accordion component. Never duplicate native full description content.
    root.querySelectorAll('.mt-pdp-v4-description-title').forEach(removeNode);
    var tabs = root.querySelector('.product-tabs');
    if (!tabs || !tabs.parentNode) return;
    var section = root.querySelector('.mt-pdp-v4-accordion[data-panel="description"]');
    var nativeDescription = firstOf(tabs, [
      '#description', '#product-description', '.tab-pane[id$="-description-tab"]'
    ]);
    if (!nativeDescription && !section) return;
    if (!section) section = ensureAccordion(root, 'description', 'Опис товару');
    var panel = section.querySelector('.mt-pdp-v4-accordion-panel');
    if (nativeDescription && stringOf(nativeDescription).length >= 15) {
      // Move the original description pane. Do not clone or recreate text.
      panel.appendChild(nativeDescription);
    }
    var hasDescription = !!panel && stringOf(panel).length >= 15;
    section.hidden = !hasDescription;
    if (hasDescription && section.nextElementSibling !== tabs) {
      tabs.parentNode.insertBefore(section, tabs);
    }
    tabs.classList.toggle('mt-pdp-v5-description-moved', hasDescription);
    // Native product-details markup contains AJAX product JSON and must stay
    // in the DOM even when its empty presentation tab is hidden.
    var details = tabs.querySelector('#product-details-tab');
    var detailsContent = details && details.cloneNode(true);
    if (detailsContent) {
      detailsContent.querySelectorAll(
        '#product-details, .product-features, .product-manufacturer, .product-reference, .product-quantities, .product-out-of-stock, meta, link, script'
      ).forEach(removeNode);
    }
    tabs.classList.toggle('mt-pdp-v5-details-nav-empty', !detailsContent ||
      (!stringOf(detailsContent) && !detailsContent.querySelector('img,video,a[href],table')));
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

;
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
      overlay.textContent = 'Під замовлення';
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

;
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

;
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


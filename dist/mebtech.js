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


(function () {
    const gallery = document.getElementById('galleryGrid');
    if (!gallery) return;

    const loadMoreBtn = document.getElementById('loadMoreBtn');
    const modal = document.getElementById('imageModal');
    const fullImg = document.getElementById('fullImage');
    const closeBtn = document.querySelector('.close-modal');

    const galleryImages = gallery.querySelectorAll('img');
    galleryImages.forEach((img, idx) => {
        if (!img.hasAttribute('decoding')) img.decoding = 'async';
        if (!img.hasAttribute('loading')) img.loading = idx < 6 ? 'eager' : 'lazy';
        if (!img.hasAttribute('fetchpriority')) {
            img.setAttribute('fetchpriority', idx < 3 ? 'high' : 'low');
        }
    });

    const brandTimeline = document.querySelector('.brand-timeline');
    if (brandTimeline) {
        const brandItems = Array.from(brandTimeline.querySelectorAll('li'));
        const visibleCount = 15;

        if (brandItems.length > visibleCount) {
            brandTimeline.classList.add('is-collapsed');
            brandItems.forEach((item, index) => {
                if (index >= visibleCount) item.classList.add('timeline-hidden');
            });

            const panel = brandTimeline.closest('.brand-timeline-panel');
            const footnote = panel ? panel.querySelector('.brand-timeline-footnote') : null;
            if (panel) {
                const toggleWrap = document.createElement('div');
                toggleWrap.className = 'brand-timeline-toggle-wrap';

                const toggleBtn = document.createElement('button');
                toggleBtn.type = 'button';
                toggleBtn.className = 'direction-button timeline-toggle-btn';
                toggleBtn.textContent = 'View Full Brand Lineup';
                toggleBtn.setAttribute('aria-expanded', 'false');
                toggleBtn.setAttribute('aria-label', 'View full cigar brand lineup');

                toggleBtn.addEventListener('click', () => {
                    const beforeTop = toggleBtn.getBoundingClientRect().top;
                    const isExpanded = brandTimeline.classList.toggle('is-expanded');
                    brandTimeline.classList.toggle('is-collapsed', !isExpanded);
                    toggleBtn.textContent = isExpanded ? 'Show Fewer Brands' : 'View Full Brand Lineup';
                    toggleBtn.setAttribute('aria-expanded', String(isExpanded));

                    // Keep the button anchored in the viewport when collapsing,
                    // so the page does not jump down to the showcase section.
                    if (!isExpanded) {
                        requestAnimationFrame(() => {
                            const afterTop = toggleBtn.getBoundingClientRect().top;
                            const delta = afterTop - beforeTop;
                            if (delta !== 0) {
                                window.scrollBy({ top: delta, behavior: 'auto' });
                            }
                        });
                    }
                });

                toggleWrap.appendChild(toggleBtn);
                panel.insertBefore(toggleWrap, footnote || null);
            }
        }
    }

    const closeModal = () => {
        if (!modal) return;
        modal.classList.remove('active');
        document.body.style.overflow = '';
        if (fullImg) {
            fullImg.removeAttribute('src');
            fullImg.alt = 'Expanded store image';
        }
    };

    const openModal = (img) => {
        if (!modal || !fullImg) return;
        fullImg.src = img.currentSrc || img.src;
        fullImg.alt = img.alt || 'Expanded store image';
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    };

    if (loadMoreBtn) {
        const hiddenItems = Array.from(gallery.querySelectorAll('.gallery-item.hidden'));
        const batchSize = 9;
        let revealed = 0;

        loadMoreBtn.addEventListener('click', () => {
            const end = Math.min(revealed + batchSize, hiddenItems.length);
            for (let i = revealed; i < end; i++) {
                hiddenItems[i].classList.remove('hidden');
                hiddenItems[i].classList.add('show');
            }
            revealed = end;

            if (revealed >= hiddenItems.length) {
                loadMoreBtn.style.display = 'none';
                loadMoreBtn.setAttribute('aria-hidden', 'true');
            }
        });
    }

    gallery.addEventListener('click', (event) => {
        const target = event.target;
        if (!(target instanceof HTMLElement)) return;
        const img = target.closest('img');
        if (!img) return;
        openModal(img);
    });

    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
        closeBtn.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                closeModal();
            }
        });
    }

    if (modal) {
        modal.addEventListener('click', (event) => {
            if (event.target === modal) {
                closeModal();
            }
        });
    }

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && modal && modal.classList.contains('active')) {
            closeModal();
        }
    });
})();

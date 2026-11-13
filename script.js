(() => {
    const phrase = document.getElementById('typed-phrase');

    if (!phrase) return;

    const phrases = ['Timeless Elegance', 'Everyday Confidence', 'A Signature Look'];
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduceMotion) return;

    let phraseIndex = 0;
    let characterIndex = phrases[0].length;
    let deleting = true;

    const typeNextCharacter = () => {
        if (deleting && characterIndex <= 1) {
            phraseIndex = (phraseIndex + 1) % phrases.length;
            characterIndex = 1;
            deleting = false;
            phrase.textContent = phrases[phraseIndex].slice(0, characterIndex);
            window.setTimeout(typeNextCharacter, 85);
            return;
        }

        const currentPhrase = phrases[phraseIndex];

        if (deleting) {
            characterIndex -= 1;
            phrase.textContent = currentPhrase.slice(0, characterIndex);
        } else {
            characterIndex += 1;
            phrase.textContent = currentPhrase.slice(0, characterIndex);
            if (characterIndex > phrases[phraseIndex].length) {
                deleting = true;
                window.setTimeout(typeNextCharacter, 1700);
                return;
            }
        }

        window.setTimeout(typeNextCharacter, deleting ? 45 : 85);
    };

    window.setTimeout(typeNextCharacter, 1800);
})();

(() => {
    const normalize = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
    const formatPrice = amount => `₦${Number(amount).toLocaleString('en-NG')}`;
    const storageKey = 'realluxe-cart';
    const grid = document.getElementById('product-grid');
    const filterContainer = document.getElementById('filter-container');
    const cartDrawer = document.getElementById('cart-drawer');
    const searchModal = document.getElementById('search-modal');

    if (!grid || !filterContainer || !Array.isArray(products)) return;

    products.forEach(product => {
        product.priceFormatted = formatPrice(product.price);
    });

    try {
        const savedCart = JSON.parse(localStorage.getItem(storageKey) || '[]');
        cart = savedCart.map(savedItem => {
            const product = products.find(item => item.id === savedItem.id);
            return product ? { ...product, quantity: Math.max(1, Number(savedItem.quantity) || 1) } : null;
        }).filter(Boolean);
    } catch {
        cart = [];
    }

    const brands = [...new Set(products.map(product => product.brand))];
    filterContainer.replaceChildren();

    ['All', ...brands].forEach((brand, index) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = `filter-btn px-5 py-2 rounded-full text-xs font-medium transition ${index === 0 ? 'bg-brand-purple text-white' : 'bg-brand-card border border-brand-border text-gray-300 hover:border-brand-purple'}`;
        button.textContent = brand === 'All' ? 'All Collection' : brand;
        button.setAttribute('aria-pressed', index === 0 ? 'true' : 'false');
        button.addEventListener('click', () => window.filterCategory(brand));
        filterContainer.appendChild(button);
    });

    function renderProducts(filter = 'All') {
        const visibleProducts = filter === 'All'
            ? products
            : products.filter(product => normalize(product.brand) === normalize(filter));
        const count = document.getElementById('collection-count');
        if (count) count.textContent = `${visibleProducts.length} ${visibleProducts.length === 1 ? 'style' : 'styles'} in this collection`;
        grid.replaceChildren();

        if (visibleProducts.length === 0) {
            grid.innerHTML = '<p class="col-span-full py-12 text-center text-sm text-gray-400">No bags found in this collection.</p>';
            return;
        }

        visibleProducts.forEach((product, index) => {
            const card = document.createElement('article');
            card.className = 'product-card bg-brand-card border border-brand-border rounded-2xl overflow-hidden group hover:border-brand-purple/50 transition duration-300 flex flex-col';
            card.dataset.productId = product.id;
            card.style.animationDelay = `${Math.min(index * 45, 270)}ms`;
            card.innerHTML = `
                <div class="relative aspect-[4/3] overflow-hidden bg-brand-dark">
                    <img src="${product.image}" alt="${product.name}" class="product-card-image w-full h-full object-cover" loading="lazy">
                    <span class="absolute top-3 left-3 bg-brand-dark/85 backdrop-blur-md border border-brand-border text-brand-purple text-[10px] font-semibold px-3 py-1 rounded-full uppercase tracking-wider">${product.brand}</span>
                </div>
                <div class="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                        <h3 class="font-serif text-lg font-bold text-white">${product.name}</h3>
                        <p class="text-xs text-gray-400 mt-1">${product.description}</p>
                    </div>
                    <div class="flex items-center justify-between gap-3 pt-4 border-t border-brand-border">
                        <span class="font-serif text-base sm:text-lg font-bold text-white">${product.priceFormatted}</span>
                        <div class="flex items-center gap-2">
                            <button type="button" onclick="addToCart(${product.id})" aria-label="Add ${product.name} to bag" class="w-10 h-10 rounded-xl bg-brand-dark border border-brand-border flex items-center justify-center text-gray-300 hover:text-brand-purple hover:border-brand-purple transition">
                                <i class="fa-solid fa-bag-shopping" aria-hidden="true"></i>
                            </button>
                            <button type="button" onclick="orderWhatsApp(${product.id})" class="bg-brand-purple hover:bg-brand-purpleHover text-white px-4 py-2.5 rounded-xl text-xs font-semibold uppercase transition flex items-center gap-1.5">
                                <i class="fa-brands fa-whatsapp text-sm" aria-hidden="true"></i><span>Order</span>
                            </button>
                        </div>
                    </div>
                </div>`;
            grid.appendChild(card);
        });
    }

    window.renderProducts = renderProducts;
    window.filterCategory = category => {
        window.currentFilter = category;
        filterContainer.querySelectorAll('.filter-btn').forEach(button => {
            const active = normalize(button.textContent) === normalize(category === 'All' ? 'All Collection' : category);
            button.className = `filter-btn px-5 py-2 rounded-full text-xs font-medium transition ${active ? 'bg-brand-purple text-white' : 'bg-brand-card border border-brand-border text-gray-300 hover:border-brand-purple'}`;
            button.setAttribute('aria-pressed', String(active));
        });
        renderProducts(category);
    };

    window.toggleCart = () => {
        const isOpening = cartDrawer.classList.contains('hidden');
        cartDrawer.classList.toggle('hidden', !isOpening);
        document.body.classList.toggle('overflow-hidden', isOpening);
        cartDrawer.setAttribute('aria-hidden', String(!isOpening));
    };

    window.addToCart = productId => {
        const product = products.find(item => item.id === productId);
        if (!product) return;
        const existing = cart.find(item => item.id === productId);
        if (existing) existing.quantity += 1;
        else cart.push({ ...product, quantity: 1 });
        updateCartUI();
        if (cartDrawer.classList.contains('hidden')) window.toggleCart();
    };

    window.changeCartQuantity = (productId, change) => {
        const item = cart.find(entry => entry.id === productId);
        if (!item) return;
        item.quantity += change;
        if (item.quantity <= 0) cart = cart.filter(entry => entry.id !== productId);
        updateCartUI();
    };

    window.removeFromCart = productId => {
        cart = cart.filter(item => item.id !== productId);
        updateCartUI();
    };

    function updateCartUI() {
        const count = cart.reduce((total, item) => total + item.quantity, 0);
        const countElement = document.getElementById('cart-count');
        const container = document.getElementById('cart-items-container');
        const subtotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);
        if (countElement) countElement.textContent = count;
        if (document.getElementById('cart-subtotal')) document.getElementById('cart-subtotal').textContent = formatPrice(subtotal);

        if (container) {
            if (cart.length === 0) {
                container.innerHTML = '<div class="text-center text-gray-500 py-12"><i class="fa-solid fa-bag-shopping text-3xl mb-3" aria-hidden="true"></i><p class="text-sm">Your bag is currently empty.</p></div>';
            } else {
                container.innerHTML = cart.map(item => `
                    <article class="flex items-center gap-3 bg-brand-dark p-3 rounded-xl border border-brand-border">
                        <img src="${item.image}" alt="" class="w-16 h-16 object-cover rounded-lg" loading="lazy">
                        <div class="min-w-0 flex-1">
                            <h4 class="font-serif text-sm font-bold text-white">${item.name}</h4>
                            <p class="text-xs text-brand-purple font-semibold mt-0.5">${formatPrice(item.price)}</p>
                            <div class="flex items-center gap-3 mt-2">
                                <button type="button" onclick="changeCartQuantity(${item.id}, -1)" aria-label="Decrease ${item.name} quantity" class="w-7 h-7 border border-brand-border rounded text-white">−</button>
                                <span class="text-xs text-white" aria-label="Quantity ${item.quantity}">${item.quantity}</span>
                                <button type="button" onclick="changeCartQuantity(${item.id}, 1)" aria-label="Increase ${item.name} quantity" class="w-7 h-7 border border-brand-border rounded text-white">+</button>
                            </div>
                        </div>
                        <button type="button" onclick="removeFromCart(${item.id})" aria-label="Remove ${item.name}" class="text-gray-500 hover:text-red-400 p-2"><i class="fa-solid fa-trash" aria-hidden="true"></i></button>
                    </article>`).join('');
            }
        }

        try {
            localStorage.setItem(storageKey, JSON.stringify(cart.map(({ id, quantity }) => ({ id, quantity }))));
        } catch {
            // Cart remains usable when browser storage is unavailable.
        }
    }

    window.handleSearch = query => {
        const results = document.getElementById('search-results');
        if (!results) return;
        const term = normalize(query);
        results.replaceChildren();
        if (!term) return;
        const matches = products.filter(product => normalize(`${product.name} ${product.brand} ${product.description}`).includes(term));
        if (matches.length === 0) {
            results.innerHTML = '<p class="text-xs text-gray-400 text-center py-4">No bags found. Try another style or designer.</p>';
            return;
        }
        matches.forEach(product => {
            const result = document.createElement('button');
            result.type = 'button';
            result.className = 'w-full flex items-center justify-between gap-3 p-3 text-left bg-brand-dark rounded-xl border border-brand-border hover:border-brand-purple transition';
            result.innerHTML = `<span class="flex items-center gap-3"><img src="${product.image}" alt="" class="w-10 h-10 object-cover rounded-lg"><span><strong class="block text-xs text-white">${product.name}</strong><span class="text-[10px] text-brand-purple">${product.brand}</span></span></span><span class="text-xs font-bold text-white">${product.priceFormatted}</span>`;
            result.addEventListener('click', () => {
                window.toggleSearch();
                window.filterCategory(product.brand);
                document.querySelector(`[data-product-id="${product.id}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            });
            results.appendChild(result);
        });
    };

    window.toggleSearch = () => {
        const opening = searchModal.classList.contains('hidden');
        searchModal.classList.toggle('hidden', !opening);
        document.body.classList.toggle('overflow-hidden', opening || !cartDrawer.classList.contains('hidden'));
        if (opening) document.getElementById('search-input')?.focus();
    };

    window.orderWhatsApp = productId => {
        const product = products.find(item => item.id === productId);
        if (!product) return;
        const message = encodeURIComponent(`Hello Realluxe.ng, I'm interested in the ${product.name} (${product.priceFormatted}). Please confirm availability and delivery options.`);
        window.open(`https://wa.me/2348143278091?text=${message}`, '_blank', 'noopener,noreferrer');
    };

    window.checkoutWhatsApp = () => {
        if (!cart.length) return;
        const summary = cart.map(item => `${item.quantity} x ${item.name} (${formatPrice(item.price)})`).join('\n');
        const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const message = encodeURIComponent(`Hello Realluxe.ng, please confirm availability for:\n${summary}\n\nSubtotal: ${formatPrice(total)}\nPlease share payment and delivery details.`);
        window.open(`https://wa.me/2348143278091?text=${message}`, '_blank', 'noopener,noreferrer');
    };

    function observeReveals() {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12 });
        document.querySelectorAll('#brands, #collection, #about, #reviews, #faqs').forEach(section => {
            section.classList.add('reveal-on-scroll');
            observer.observe(section);
        });
    }

    cartDrawer.addEventListener('click', event => {
        if (event.target === cartDrawer) window.toggleCart();
    });
    searchModal.addEventListener('click', event => {
        if (event.target === searchModal) window.toggleSearch();
    });
    document.addEventListener('keydown', event => {
        if (event.key === 'Escape') {
            if (!cartDrawer.classList.contains('hidden')) window.toggleCart();
            if (!searchModal.classList.contains('hidden')) window.toggleSearch();
        }
    });

    renderProducts('All');
    updateCartUI();
    observeReveals();
})();
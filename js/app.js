document.addEventListener('DOMContentLoaded', async () => {
    const viewport = document.getElementById('tool-viewport');
    const navContainer = document.getElementById('tool-nav');
    const discoveryContainer = document.getElementById('tool-discovery');
    const reqBannerContainer = document.getElementById('requirement-banner');
    const donBannerContainer = document.getElementById('donation-banner');

    const activeToolId = viewport ? viewport.dataset.activeTool : null;

    // 1. Fetch Central Configuration
    let config = {};
    try {
        const res = await fetch('config.json');
        config = await res.json();
    } catch (err) {
        console.warn('Could not load config.json. Falling back to defaults.', err);
    }
	
	// 2. Dynamically Inject Tool Scripts from config.json
    if (config.toolScripts && Array.isArray(config.toolScripts)) {
        await Promise.all(config.toolScripts.map(scriptUrl => {
            return new Promise((resolve, reject) => {
                // Check if already injected
                if (document.querySelector(`script[src="${scriptUrl}"]`)) return resolve();
                
                const script = document.createElement('script');
                script.src = scriptUrl;
                script.onload = resolve;
                script.onerror = reject;
                document.head.appendChild(script);
            });
        }));
    }

    // 2. Dynamic SEO Injector Engine
    function applySEO() {
        if (!config.tools) return;

        const toolMeta = config.tools[activeToolId];
        const siteName = config.siteName || 'DevTools Hub';
        const pageTitle = toolMeta ? toolMeta.title : `${siteName} - Free Developer Utilities`;
        const description = toolMeta ? toolMeta.metaDescription : 'Free, client-side developer tools and converters.';
        const canonicalUrl = toolMeta ? `${config.baseUrl}${toolMeta.canonicalPath}` : config.baseUrl;

        document.title = pageTitle;
        setMeta('name', 'description', description);
        if (toolMeta && toolMeta.keywords) setMeta('name', 'keywords', toolMeta.keywords);

        // Canonical URL
        let canonical = document.querySelector('link[rel="canonical"]');
        if (!canonical) {
            canonical = document.createElement('link');
            canonical.rel = 'canonical';
            document.head.appendChild(canonical);
        }
        canonical.href = canonicalUrl;

        // Open Graph
        setMeta('property', 'og:title', pageTitle);
        setMeta('property', 'og:description', description);
        setMeta('property', 'og:url', canonicalUrl);
        setMeta('property', 'og:type', 'website');
        setMeta('property', 'og:site_name', siteName);

        // Twitter Cards
        setMeta('name', 'twitter:card', 'summary');
        setMeta('name', 'twitter:title', pageTitle);
        setMeta('name', 'twitter:description', description);
        if (config.twitterHandle) setMeta('name', 'twitter:site', config.twitterHandle);

        // Schema.org JSON-LD Structured Data
        if (toolMeta) {
            const oldSchema = document.getElementById('json-ld-schema');
            if (oldSchema) oldSchema.remove();

            const schema = {
                "@context": "https://schema.org",
                "@type": "WebApplication",
                "name": pageTitle.split('|')[0].trim(),
                "url": canonicalUrl,
                "description": description,
                "applicationCategory": toolMeta.applicationCategory || "DeveloperApplication",
                "operatingSystem": "All",
                "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
            };

            const script = document.createElement('script');
            script.id = 'json-ld-schema';
            script.type = 'application/ld+json';
            script.text = JSON.stringify(schema);
            document.head.appendChild(script);
        }
    }

    function setMeta(attr, val, content) {
        if (!content) return;
        let el = document.querySelector(`meta[${attr}="${val}"]`);
        if (!el) {
            el = document.createElement('meta');
            el.setAttribute(attr, val);
            document.head.appendChild(el);
        }
        el.setAttribute('content', content);
    }

    // 3. Render Top Navigation Bar
    function renderNav() {
        if (!navContainer || !window.ToolRegistry) return;
        navContainer.innerHTML = '';

        const categories = window.ToolRegistry.reduce((acc, tool) => {
            const cat = tool.category || 'Utilities';
            if (!acc[cat]) acc[cat] = [];
            acc[cat].push(tool);
            return acc;
        }, {});

        Object.keys(categories).forEach(catName => {
            const wrapper = document.createElement('div');
            wrapper.className = 'relative group';

            const btn = document.createElement('button');
            btn.className = 'px-3 py-1.5 rounded text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-1 cursor-pointer';
            btn.innerHTML = `${catName} <span class="text-[9px]">▼</span>`;

            const dropdown = document.createElement('div');
            dropdown.className = 'absolute left-0 mt-1 hidden group-hover:block bg-slate-800 border border-slate-700 rounded-lg shadow-xl py-2 min-w-[190px] z-50';

            categories[catName].forEach(t => {
                const a = document.createElement('a');
                a.href = t.pageUrl;
                a.className = `block px-4 py-1.5 text-xs font-medium transition ${
                    t.id === activeToolId ? 'text-indigo-400 font-bold bg-slate-700/50' : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                }`;
                a.innerText = t.name;
                dropdown.appendChild(a);
            });

            wrapper.appendChild(btn);
            wrapper.appendChild(dropdown);
            navContainer.appendChild(wrapper);
        });
    }

    // 4. Render Active Tool
    function renderActiveTool() {
        if (!viewport || !activeToolId || !window.ToolRegistry) return;
        const tool = window.ToolRegistry.find(t => t.id === activeToolId);
        if (!tool) return;

        viewport.innerHTML = `
            <div class="mb-6">
                <span class="px-2 py-0.5 mb-2 inline-block bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-full border border-indigo-100">${tool.category}</span>
                <h1 class="text-2xl font-bold text-slate-900 tracking-tight mb-1">${tool.name}</h1>
                <p class="text-slate-600 text-sm">${tool.description}</p>
            </div>
            ${tool.renderUI()}
        `;
        tool.init();
    }

    // 5. Render Contextual Discovery Section
    function renderDiscovery() {
        if (!discoveryContainer || !window.ToolRegistry) return;

        const currentTool = window.ToolRegistry.find(t => t.id === activeToolId);
        const currentCategory = currentTool ? currentTool.category : null;

        const categoriesMap = window.ToolRegistry.reduce((acc, t) => {
            const cat = t.category || 'Utilities';
            if (!acc[cat]) acc[cat] = [];
            acc[cat].push(t);
            return acc;
        }, {});

        let html = '';

        if (currentTool) {
            const sameCategory = window.ToolRegistry.filter(t => t.category === currentCategory && t.id !== activeToolId);
            if (sameCategory.length > 0) {
                html += `
                    <article class="bg-white p-6 rounded-xl border border-slate-200 text-sm space-y-4">
                        <h2 class="text-lg font-bold text-slate-900">Other ${currentCategory} Tools</h2>
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                            ${sameCategory.map(t => `
                                <a href="${t.pageUrl}" class="p-4 border rounded-lg hover:border-indigo-500 transition block">
                                    <h3 class="font-bold text-indigo-600">${t.name} &rarr;</h3>
                                    <p class="text-xs text-slate-500 mt-1">${t.description}</p>
                                </a>
                            `).join('')}
                        </div>
                    </article>
                `;
            }
        }

        const title = currentTool ? "Explore Our Other Categories" : "Available Developer Tools";
        const otherCategories = Object.keys(categoriesMap).filter(c => c !== currentCategory);

        if (otherCategories.length > 0) {
            html += `
                <article class="bg-white p-6 rounded-xl border border-slate-200 text-sm space-y-4">
                    <h2 class="text-lg font-bold text-slate-900">${title}</h2>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        ${otherCategories.map(cat => `
                            <div class="p-4 rounded-lg border border-slate-200 bg-slate-50/50">
                                <h3 class="font-bold text-slate-800 text-sm mb-2">${cat}</h3>
                                <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    ${categoriesMap[cat].map(t => `
                                        <a href="${t.pageUrl}" class="p-2 bg-white rounded border border-slate-200 text-xs font-semibold text-indigo-600 hover:border-indigo-500 hover:shadow-sm transition block">
                                            ${t.name} &rarr;
                                        </a>
                                    `).join('')}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </article>
            `;
        }

        discoveryContainer.innerHTML = html;
    }

    // 6. Render Requirement Form Banner
    function renderRequirementBanner() {
        if (!reqBannerContainer) return;

        reqBannerContainer.innerHTML = `
            <aside class="bg-white border border-slate-200 rounded-xl p-6 shadow-sm my-6 space-y-4">
                <div class="space-y-1">
                    <div class="flex items-center gap-2">
                        <span class="text-xl">💡</span>
                        <h3 class="font-bold text-base text-slate-900">Didn't find the tool you need?</h3>
                    </div>
                    <p class="text-xs text-slate-600">
                        Let us know what tool or feature you need. We prioritize and build popular community requests!
                    </p>
                </div>
                <form id="requirement-form" class="space-y-3">
                    <div class="flex flex-col sm:flex-row gap-2">
                        <input type="text" name="requirement" id="req-text" required placeholder="Describe the tool you need..." class="flex-grow p-2.5 border border-slate-300 rounded-lg text-xs bg-slate-50 focus:bg-white focus:outline-none focus:border-indigo-500 transition" />
                        <input type="email" name="email" placeholder="Your email (optional)" class="sm:w-1/3 p-2.5 border border-slate-300 rounded-lg text-xs bg-slate-50 focus:bg-white focus:outline-none focus:border-indigo-500 transition" />
                        <button type="submit" id="submit-req-btn" class="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-lg shadow-sm transition shrink-0 cursor-pointer">Send Request</button>
                    </div>
                    <p id="requirement-status" class="text-xs font-semibold hidden"></p>
                </form>
            </aside>
        `;

        const form = document.getElementById('requirement-form');
        const status = document.getElementById('requirement-status');
        const btn = document.getElementById('submit-req-btn');

        form.onsubmit = async (e) => {
            e.preventDefault();
            btn.disabled = true;
            btn.innerText = 'Sending...';

            try {
                if (config.formspreeEndpoint) {
                    const res = await fetch(config.formspreeEndpoint, {
                        method: 'POST',
                        body: new FormData(form),
                        headers: { 'Accept': 'application/json' }
                    });
                    if (!res.ok) throw new Error();
                }
                status.className = 'text-xs font-semibold text-emerald-600';
                status.innerText = '✓ Thank you! Your request has been sent.';
                form.reset();
            } catch (err) {
                status.className = 'text-xs font-semibold text-red-600';
                status.innerText = '✕ Failed to submit. Please try again later.';
            } finally {
                status.classList.remove('hidden');
                btn.disabled = false;
                btn.innerText = 'Send Request';
            }
        };
    }

    // 7. Render Donation Banner
    function renderDonationBanner() {
        if (!donBannerContainer || !config.donation) return;

        donBannerContainer.innerHTML = `
            <aside class="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 rounded-xl p-6 text-white shadow-md my-6">
                <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div class="space-y-1 text-center sm:text-left">
                        <div class="flex items-center justify-center sm:justify-start gap-2">
                            <span class="text-xl">☕</span>
                            <h3 class="font-bold text-base text-slate-100">Enjoying ${config.siteName || 'DevTools Hub'}?</h3>
                        </div>
                        <p class="text-xs text-slate-300 max-w-xl leading-relaxed">
                            These tools run 100% locally in your browser. If they saved you time, consider supporting ongoing updates!
                        </p>
                    </div>
                    <div class="flex items-center gap-3 shrink-0">
                        <a href="${config.donation.buyMeACoffee}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-lg transition shadow-sm cursor-pointer">
                            <span>☕</span> Buy Me a Coffee
                        </a>
                        <a href="${config.donation.githubSponsors}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold rounded-lg transition cursor-pointer">
                            <span>💖</span> Sponsor
                        </a>
                    </div>
                </div>
            </aside>
        `;
    }

    // Execution Chain
    applySEO();
    renderNav();
    renderActiveTool();
    renderDiscovery();
    renderRequirementBanner();
    renderDonationBanner();
});
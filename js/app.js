window.DevTools = (function() {
    const registry = {};

    return {
        register: function(toolConfig) {
            registry[toolConfig.id] = toolConfig;
            this.renderUI(toolConfig.id);
            this.injectJSONLD(toolConfig);
        },

        renderUI: function(toolId) {
            const tool = registry[toolId];
            if (!tool) return;

            const viewport = document.getElementById('tool-viewport');
            if (viewport) {
                viewport.innerHTML = tool.renderUI();
                if (typeof tool.init === 'function') {
                    tool.init();
                }
            }
        },

        injectJSONLD: function(tool) {
            const script = document.createElement('script');
            script.type = 'application/ld+json';
            script.text = JSON.stringify({
                "@context": "https://schema.org",
                "@type": "SoftwareApplication",
                "name": tool.name,
                "operatingSystem": "All",
                "applicationCategory": "DeveloperApplication",
                "offers": {
                    "@type": "Offer",
                    "price": "0",
                    "priceCurrency": "USD"
                },
                "description": tool.description
            });
            document.head.appendChild(script);
        }
    };
})();
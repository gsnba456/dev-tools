(function() {
    registerTool({
        id: "html-formatter",
        name: "HTML Formatter",
        category: "Formatters",
        pageUrl: "html-formatter.html",
        description: "Beautify, indent, and format messy HTML code instantly in your browser.",
        renderUI: () => `
            <div class="space-y-4">
                <div class="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
                    <div class="flex items-center gap-2">
                        <label for="indent-size" class="font-semibold text-slate-700">Indent Size:</label>
                        <select id="indent-size" class="border border-slate-300 rounded px-2 py-1 bg-white text-slate-700">
                            <option value="2" selected>2 Spaces</option>
                            <option value="4">4 Spaces</option>
                        </select>
                    </div>
                    <button id="clear-html-btn" class="text-slate-500 hover:text-red-600 transition font-semibold cursor-pointer">🗑️ Clear</button>
                </div>
                <div>
                    <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Unformatted HTML</label>
                    <textarea id="html-input" class="w-full h-40 p-3 border border-slate-200 rounded-lg font-mono text-sm bg-slate-50 focus:bg-white focus:outline-none focus:border-indigo-500 transition" placeholder="<div><p>Paste unformatted HTML here...</p></div>"></textarea>
                </div>
                <div>
                    <button id="format-html-btn" class="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-lg shadow-sm transition cursor-pointer">✨ Format HTML</button>
                </div>
                <div>
                    <div class="flex justify-between items-center mb-1">
                        <label class="text-xs font-bold text-slate-700 uppercase">Formatted HTML Output</label>
                        <button id="copy-html-out" class="text-xs text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer transition">📋 Copy Output</button>
                    </div>
                    <textarea id="html-output" readonly class="w-full h-48 p-3 border border-slate-200 bg-slate-50 rounded-lg font-mono text-sm" placeholder="Formatted HTML code will appear here..."></textarea>
                </div>
            </div>
        `,
        init: () => {
            const input = document.getElementById('html-input');
            const output = document.getElementById('html-output');
            const formatBtn = document.getElementById('format-html-btn');
            const clearBtn = document.getElementById('clear-html-btn');
            const copyBtn = document.getElementById('copy-html-out');
            const indentSelect = document.getElementById('indent-size');

            if (!input || !output || !formatBtn) return;

            function formatHTML(htmlString, indentSize) {
                const indentStr = ' '.repeat(indentSize);
                let formatted = '';
                let indentLevel = 0;
                let xml = htmlString.replace(/(>)(<)(\/*)/g, '$1\r\n$2$3');
                const selfClosingTags = ['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'];

                xml.split(/\r\n|\n/).forEach(node => {
                    let trimNode = node.trim();
                    if (!trimNode) return;

                    let isClosing = /^<\//.test(trimNode);
                    let isSelfClosing = /\/>$/.test(trimNode);
                    const tagMatch = trimNode.match(/^<([a-zA-Z0-9]+)/);
                    if (tagMatch && selfClosingTags.includes(tagMatch[1].toLowerCase())) isSelfClosing = true;

                    if (isClosing && indentLevel > 0) indentLevel--;
                    formatted += indentStr.repeat(indentLevel) + trimNode + '\r\n';
                    if (!isClosing && !isSelfClosing && /^<[^\!]/?.test(trimNode) && !/<\/.*>$/.test(trimNode)) indentLevel++;
                });

                return formatted.trim();
            }

            formatBtn.onclick = () => {
                const rawHtml = input.value;
                if (!rawHtml.trim()) { output.value = ''; return; }
                output.value = formatHTML(rawHtml, parseInt(indentSelect.value, 10) || 2);
            };

            clearBtn.onclick = () => { input.value = ''; output.value = ''; };
            copyBtn.onclick = (e) => copyToClipboard('html-output', e.target);
        }
    });
})();
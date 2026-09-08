DevTools.register({
    id: 'universal-encoder',
    name: 'Universal Encoder / Decoder',
    description: 'Encode and decode Base64, Hex, URL, Binary, ROT13, and JWT tokens client-side.',

    renderUI: function() {
        return `
            <div>
                <h1 class="text-2xl font-bold text-slate-900 mb-1">${this.name}</h1>
                <p class="text-slate-500 text-sm mb-6">${this.description}</p>

                <div class="flex flex-wrap gap-2 mb-4">
                    <select id="encoder-mode" class="p-2 border border-slate-200 rounded-lg text-sm bg-white font-medium text-slate-700 outline-none focus:border-indigo-500">
                        <option value="base64">Base64</option>
                        <option value="url">URL Encode</option>
                        <option value="hex">Hexadecimal</option>
                        <option value="binary">Binary</option>
                        <option value="rot13">ROT13</option>
                        <option value="jwt">JWT Decode</option>
                    </select>
                    
                    <button id="toggle-dir" class="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-xs font-semibold rounded-lg text-slate-700 transition">
                        Mode: <span id="dir-label">Encode</span>
                    </button>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-xs font-semibold text-slate-600 mb-1">Input</label>
                        <textarea id="encoder-input" rows="8" class="w-full p-3 font-mono text-sm border border-slate-200 rounded-lg outline-none focus:border-indigo-500" placeholder="Type or paste text here..."></textarea>
                    </div>
                    <div>
                        <div class="flex justify-between items-center mb-1">
                            <label class="block text-xs font-semibold text-slate-600">Output</label>
                            <button id="copy-btn" class="text-xs text-indigo-600 hover:text-indigo-800 font-semibold">Copy</button>
                        </div>
                        <textarea id="encoder-output" rows="8" readonly class="w-full p-3 font-mono text-sm border border-slate-200 bg-slate-50 rounded-lg outline-none" placeholder="Converted result will appear here..."></textarea>
                    </div>
                </div>
            </div>
        `;
    },

    init: function() {
        const input = document.getElementById('encoder-input');
        const output = document.getElementById('encoder-output');
        const modeSelect = document.getElementById('encoder-mode');
        const dirBtn = document.getElementById('toggle-dir');
        const dirLabel = document.getElementById('dir-label');
        const copyBtn = document.getElementById('copy-btn');

        let isEncode = true;

        const rot13 = (str) => str.replace(/[a-zA-Z]/g, c => 
            String.fromCharCode((c <= 'Z' ? 90 : 122) >= (c = c.charCodeAt(0) + 13) ? c : c - 26)
        );

        const processConversion = () => {
            const text = input.value;
            const mode = modeSelect.value;

            if (!text) {
                output.value = '';
                return;
            }

            try {
                if (mode === 'base64') {
                    output.value = isEncode ? btoa(text) : atob(text);
                } else if (mode === 'url') {
                    output.value = isEncode ? encodeURIComponent(text) : decodeURIComponent(text);
                } else if (mode === 'hex') {
                    if (isEncode) {
                        output.value = Array.from(new TextEncoder().encode(text))
                            .map(b => b.toString(16).padStart(2, '0')).join(' ');
                    } else {
                        const cleanHex = text.replace(/\s+/g, '');
                        const bytes = new Uint8Array(cleanHex.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
                        output.value = new TextDecoder().decode(bytes);
                    }
                } else if (mode === 'binary') {
                    if (isEncode) {
                        output.value = text.split('').map(char => char.charCodeAt(0).toString(2).padStart(8, '0')).join(' ');
                    } else {
                        output.value = text.split(' ').map(bin => String.fromCharCode(parseInt(bin, 2))).join('');
                    }
                } else if (mode === 'rot13') {
                    output.value = rot13(text);
                } else if (mode === 'jwt') {
                    const parts = text.split('.');
                    if (parts.length < 2) throw new Error('Invalid JWT structure');
                    const header = JSON.parse(atob(parts[0].replace(/-/g, '+').replace(/_/g, '/')));
                    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
                    output.value = JSON.stringify({ header, payload }, null, 2);
                }
            } catch (err) {
                output.value = `Conversion Error: ${err.message}`;
            }
        };

        input.addEventListener('input', processConversion);
        modeSelect.addEventListener('change', processConversion);
        dirBtn.addEventListener('click', () => {
            isEncode = !isEncode;
            dirLabel.innerText = isEncode ? 'Encode' : 'Decode';
            processConversion();
        });

        copyBtn.addEventListener('click', () => {
            if (!output.value) return;
            navigator.clipboard.writeText(output.value);
            copyBtn.innerText = 'Copied!';
            setTimeout(() => copyBtn.innerText = 'Copy', 2000);
        });
    }
});
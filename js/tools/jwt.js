(function() {
    registerTool({
        id: "jwt",
        name: "JWT Token Decoder",
        category: "Encoders/Decoders",
        pageUrl: "jwt-encoder-decoder.html",
        description: "Inspect JSON Web Token headers and payloads locally with zero server logging.",
        renderUI: () => `
            <div class="space-y-4">
                <div>
                    <div class="flex justify-between items-center mb-1">
                        <label class="text-xs font-bold text-slate-700 uppercase">Encoded Token</label>
                        <button id="copy-jwt-in" class="text-xs text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer transition">📋 Copy Token</button>
                    </div>
                    <textarea id="jwt-in" class="w-full h-24 p-3 border border-slate-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Paste JWT token here..."></textarea>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <div class="flex justify-between items-center mb-1">
                            <label class="block text-xs font-bold text-slate-700 uppercase">Header</label>
                            <button id="copy-jwt-hdr" class="text-xs text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer transition">📋 Copy Header</button>
                        </div>
                        <pre id="jwt-hdr" class="w-full h-40 p-3 border border-slate-200 bg-slate-50 rounded-lg font-mono text-xs overflow-auto">{}</pre>
                    </div>
                    <div>
                        <div class="flex justify-between items-center mb-1">
                            <label class="block text-xs font-bold text-slate-700 uppercase">Payload</label>
                            <button id="copy-jwt-pld" class="text-xs text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer transition">📋 Copy Payload</button>
                        </div>
                        <pre id="jwt-pld" class="w-full h-40 p-3 border border-slate-200 bg-slate-50 rounded-lg font-mono text-xs overflow-auto">{}</pre>
                    </div>
                </div>
            </div>
        `,
        init: () => {
            const input = document.getElementById('jwt-in');
            const hdr = document.getElementById('jwt-hdr');
            const pld = document.getElementById('jwt-pld');
            if (!input) return;

            const safeParse = (str) => {
                try {
                    const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
                    const json = decodeURIComponent(atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
                    return JSON.stringify(JSON.parse(json), null, 2);
                } catch(e) { return null; }
            };

            input.oninput = () => {
                const parts = input.value.trim().split('.');
                if (parts.length >= 2) {
                    hdr.innerText = safeParse(parts[0]) || "Invalid Header";
                    pld.innerText = safeParse(parts[1]) || "Invalid Payload";
                } else {
                    hdr.innerText = "{}";
                    pld.innerText = "{}";
                }
            };

            document.getElementById('copy-jwt-in').onclick = (e) => copyToClipboard('jwt-in', e.target);
            document.getElementById('copy-jwt-hdr').onclick = (e) => copyToClipboard('jwt-hdr', e.target);
            document.getElementById('copy-jwt-pld').onclick = (e) => copyToClipboard('jwt-pld', e.target);
        }
    });
})();
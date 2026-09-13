(function() {
    registerTool({
        id: "binary",
        name: "Binary Encoder & Decoder",
        category: "Encoders/Decoders",
        pageUrl: "binary-encoder-decoder.html",
        description: "Translate plain text into 8-bit binary code and back.",
        renderUI: () => `
            <div class="space-y-4">
                <div>
                    <div class="flex justify-between items-center mb-1">
                        <label class="text-xs font-bold text-slate-700 uppercase">Input Text / Binary</label>
                        <button id="copy-bin-in" class="text-xs text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer transition">📋 Copy Input</button>
                    </div>
                    <textarea id="bin-in" class="w-full h-32 p-3 border border-slate-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Type text or binary sequence..."></textarea>
                </div>

                <div class="flex gap-2">
                    <button id="bin-enc" class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer">To Binary</button>
                    <button id="bin-dec" class="bg-slate-700 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer">To Text</button>
                </div>

                <div>
                    <div class="flex justify-between items-center mb-1">
                        <label class="text-xs font-bold text-slate-700 uppercase">Output Result</label>
                        <button id="copy-bin-out" class="text-xs text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer transition">📋 Copy Output</button>
                    </div>
                    <textarea id="bin-out" readonly class="w-full h-32 p-3 border border-slate-200 bg-slate-50 rounded-lg font-mono text-sm" placeholder="Result will appear here..."></textarea>
                </div>
            </div>
        `,
        init: () => {
            const input = document.getElementById('bin-in');
            const output = document.getElementById('bin-out');
            if (!input || !output) return;

            document.getElementById('bin-enc').onclick = () => {
                output.value = input.value.split('').map(c => c.charCodeAt(0).toString(2).padStart(8, '0')).join(' ');
            };
            document.getElementById('bin-dec').onclick = () => {
                try {
                    output.value = input.value.trim().split(/\s+/).map(b => String.fromCharCode(parseInt(b, 2))).join('');
                } catch(e) { output.value = "Error: Invalid binary format."; }
            };

            document.getElementById('copy-bin-in').onclick = (e) => copyToClipboard('bin-in', e.target);
            document.getElementById('copy-bin-out').onclick = (e) => copyToClipboard('bin-out', e.target);
        }
    });
})();
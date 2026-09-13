(function() {
    registerTool({
        id: "base64",
        name: "Base64 Encoder & Decoder",
        category: "Encoders/Decoders",
        pageUrl: "base64-encoder-decoder.html",
        description: "Encode text to Base64 or decode Base64 strings safely in your browser.",
        renderUI: () => `
            <div class="space-y-4">
                <!-- Input Field with Copy Header -->
                <div>
                    <div class="flex justify-between items-center mb-1">
                        <label class="text-xs font-bold text-slate-700 uppercase">Input Text</label>
                        <button id="copy-in-btn" class="text-xs text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer transition">📋 Copy Input</button>
                    </div>
                    <textarea id="b64-in" class="w-full h-32 p-3 border border-slate-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Enter text or Base64 string..."></textarea>
                </div>

                <!-- Action Controls -->
                <div class="flex gap-2">
                    <button id="b64-enc" class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer">Encode</button>
                    <button id="b64-dec" class="bg-slate-700 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer">Decode</button>
                </div>

                <!-- Output Field with Copy Header -->
                <div>
                    <div class="flex justify-between items-center mb-1">
                        <label class="text-xs font-bold text-slate-700 uppercase">Output Result</label>
                        <button id="copy-out-btn" class="text-xs text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer transition">📋 Copy Output</button>
                    </div>
                    <textarea id="b64-out" readonly class="w-full h-32 p-3 border border-slate-200 bg-slate-50 rounded-lg font-mono text-sm" placeholder="Result will appear here..."></textarea>
                </div>
            </div>
        `,
        init: () => {
            const input = document.getElementById('b64-in');
            const output = document.getElementById('b64-out');
            const copyInBtn = document.getElementById('copy-in-btn');
            const copyOutBtn = document.getElementById('copy-out-btn');

            if (!input || !output) return;

            // Encoder & Decoder logic
            document.getElementById('b64-enc').onclick = () => {
                try { output.value = btoa(input.value); } catch(e) { output.value = "Error: Invalid text for Base64 encoding."; }
            };
            document.getElementById('b64-dec').onclick = () => {
                try { output.value = atob(input.value.trim()); } catch(e) { output.value = "Error: Invalid Base64 string."; }
            };

            // Copy Helper Function with UI Feedback
            const handleCopy = (element, button) => {
                if (!element.value.trim()) return;
                
                navigator.clipboard.writeText(element.value).then(() => {
                    const originalText = button.innerText;
                    button.innerText = "✅ Copied!";
                    button.classList.add("text-emerald-600");
                    
                    setTimeout(() => {
                        button.innerText = originalText;
                        button.classList.remove("text-emerald-600");
                    }, 1500);
                }).catch(() => {
                    button.innerText = "❌ Failed";
                });
            };

            // Bind Copy Handlers
            copyInBtn.onclick = () => handleCopy(input, copyInBtn);
            copyOutBtn.onclick = () => handleCopy(output, copyOutBtn);
        }
    });
})();
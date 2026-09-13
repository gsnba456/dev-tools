(function() {
    registerTool({
        id: "pdfToMd",
        name: "PDF to Markdown Converter",
        category: "PDF Tools",
        pageUrl: "pdfToMd.html",
        description: "Extract text and convert uploaded PDF files into Markdown format 100% locally.",
        renderUI: () => `
            <div class="space-y-4">
                <div id="pdf-drop-zone" class="border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-xl p-6 text-center cursor-pointer bg-slate-50 transition">
                    <input type="file" id="pdf-input" accept="application/pdf" class="hidden" />
                    <div class="space-y-2">
                        <span class="text-3xl">📄</span>
                        <p class="text-sm font-semibold text-slate-700">Click to upload or drag & drop a PDF file</p>
                        <p class="text-xs text-slate-500">100% Client-Side Parsing • Zero Server Uploads</p>
                    </div>
                </div>
                <div id="pdf-loader" class="hidden text-center py-4 text-xs font-semibold text-indigo-600">
                    ⏳ Processing PDF pages locally...
                </div>
                <div>
                    <div class="flex justify-between items-center mb-1">
                        <label class="text-xs font-bold text-slate-700 uppercase">Markdown Output</label>
                        <button id="copy-pdf-out" class="text-xs text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer transition">📋 Copy Markdown</button>
                    </div>
                    <textarea id="pdf-out" readonly class="w-full h-48 p-3 border border-slate-200 bg-slate-50 rounded-lg font-mono text-sm" placeholder="Uploaded PDF Markdown will appear here..."></textarea>
                </div>
            </div>
        `,
        init: () => {
            const dropZone = document.getElementById('pdf-drop-zone');
            const fileInput = document.getElementById('pdf-input');
            const output = document.getElementById('pdf-out');
            const loader = document.getElementById('pdf-loader');
            const copyBtn = document.getElementById('copy-pdf-out');

            if (!dropZone || !fileInput || !output) return;

            if (!window.pdfjsLib) {
                const script = document.createElement('script');
                script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
                document.head.appendChild(script);
                script.onload = () => {
                    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
                };
            }

            dropZone.onclick = () => fileInput.click();
            dropZone.ondragover = (e) => { e.preventDefault(); dropZone.classList.add('border-indigo-500', 'bg-indigo-50/50'); };
            dropZone.ondragleave = () => { dropZone.classList.remove('border-indigo-500', 'bg-indigo-50/50'); };
            dropZone.ondrop = (e) => {
                e.preventDefault();
                dropZone.classList.remove('border-indigo-500', 'bg-indigo-50/50');
                if (e.dataTransfer.files.length) processPdf(e.dataTransfer.files[0]);
            };
            fileInput.onchange = (e) => { if (e.target.files.length) processPdf(e.target.files[0]); };

            async function processPdf(file) {
                if (file.type !== 'application/pdf') { output.value = "Error: File is not a PDF."; return; }
                loader.classList.remove('hidden');
                output.value = "";

                try {
                    const arrayBuffer = await file.arrayBuffer();
                    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
                    let fullMarkdown = `# ${file.name.replace('.pdf', '')}\n\n`;

                    for (let i = 1; i <= pdf.numPages; i++) {
                        const page = await pdf.getPage(i);
                        const textContent = await page.getTextContent();
                        fullMarkdown += `\n<!-- Page ${i} -->\n`;
                        let lastY = null;
                        let pageText = '';

                        textContent.items.forEach(item => {
                            if (lastY !== null && Math.abs(item.transform[5] - lastY) > 8) pageText += '\n';
                            pageText += item.str + ' ';
                            lastY = item.transform[5];
                        });

                        pageText.split('\n').forEach(line => {
                            const trimmed = line.trim();
                            if (!trimmed) return;
                            if (trimmed.length < 40 && !trimmed.endsWith('.')) fullMarkdown += `\n## ${trimmed}\n\n`;
                            else fullMarkdown += `${trimmed}\n\n`;
                        });
                    }

                    output.value = fullMarkdown.trim();
                } catch (err) {
                    output.value = "Error parsing PDF: " + err.message;
                } finally {
                    loader.classList.add('hidden');
                }
            }

            copyBtn.onclick = (e) => copyToClipboard('pdf-out', e.target);
        }
    });
})();

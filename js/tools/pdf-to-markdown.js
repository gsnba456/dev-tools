pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

DevTools.register({
    id: 'pdf-to-markdown',
    name: 'PDF to Markdown',
    description: 'Extract text from PDF documents and convert directly to Markdown in-browser.',

    renderUI: function() {
        return `
            <div>
                <h1 class="text-2xl font-bold text-slate-900 mb-1">${this.name}</h1>
                <p class="text-slate-500 text-sm mb-6">${this.description}</p>

                <div id="drop-zone" class="border-2 border-dashed border-slate-300 hover:border-indigo-500 bg-slate-50 rounded-xl p-8 text-center cursor-pointer transition mb-6">
                    <input type="file" id="pdf-file-input" accept="application/pdf" class="hidden">
                    <div class="text-slate-600 font-medium text-sm">
                        <span class="text-indigo-600 font-semibold">Click to upload</span> or drag and drop PDF file here
                    </div>
                    <p class="text-xs text-slate-400 mt-1">Processed 100% locally in your browser.</p>
                </div>

                <div id="status-container" class="hidden mb-4">
                    <div class="text-xs font-semibold text-slate-600 mb-1" id="status-text">Processing PDF...</div>
                    <div class="w-full bg-slate-200 rounded-full h-1.5">
                        <div id="progress-bar" class="bg-indigo-600 h-1.5 rounded-full w-0 transition-all"></div>
                    </div>
                </div>

                <div>
                    <div class="flex justify-between items-center mb-1">
                        <label class="block text-sm font-semibold text-slate-700">Converted Markdown</label>
                        <button id="copy-btn" class="text-xs text-indigo-600 hover:text-indigo-800 font-semibold">Copy Markdown</button>
                    </div>
                    <textarea id="markdown-output" rows="10" readonly class="w-full p-3 font-mono text-sm border border-slate-200 bg-slate-50 text-slate-800 rounded-lg outline-none" placeholder="Markdown output will appear here..."></textarea>
                </div>
            </div>
        `;
    },

    init: function() {
        const dropZone = document.getElementById('drop-zone');
        const fileInput = document.getElementById('pdf-file-input');
        const copyBtn = document.getElementById('copy-btn');

        dropZone.addEventListener('click', () => fileInput.click());
        dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('border-indigo-500', 'bg-indigo-50/50'); });
        dropZone.addEventListener('dragleave', () => dropZone.classList.remove('border-indigo-500', 'bg-indigo-50/50'));
        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('border-indigo-500', 'bg-indigo-50/50');
            if (e.dataTransfer.files.length) this.processPDF(e.dataTransfer.files[0]);
        });

        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length) this.processPDF(e.target.files[0]);
        });

        copyBtn.addEventListener('click', () => {
            const textarea = document.getElementById('markdown-output');
            if (!textarea.value) return;
            navigator.clipboard.writeText(textarea.value);
            copyBtn.innerText = "Copied!";
            setTimeout(() => copyBtn.innerText = "Copy Markdown", 2000);
        });
    },

    processPDF: async function(file) {
        if (file.type !== 'application/pdf') return alert('Please select a valid PDF file.');

        const statusContainer = document.getElementById('status-container');
        const statusText = document.getElementById('status-text');
        const progressBar = document.getElementById('progress-bar');
        const outputTextarea = document.getElementById('markdown-output');

        statusContainer.classList.remove('hidden');
        outputTextarea.value = '';

        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            const totalPages = pdf.numPages;
            
            let extractedText = '';
            const turndownService = new TurndownService({ headingStyle: 'atx' });

            for (let i = 1; i <= totalPages; i++) {
                statusText.innerText = `Extracting Page ${i} of ${totalPages}...`;
                progressBar.style.width = `${(i / totalPages) * 100}%`;

                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                const pageText = textContent.items.map(item => item.str).join(' ');
                extractedText += `## Page ${i}\n\n${pageText}\n\n`;
            }

            outputTextarea.value = turndownService.turndown(extractedText);
            statusText.innerText = 'Conversion Complete!';
            setTimeout(() => statusContainer.classList.add('hidden'), 2000);
        } catch (err) {
            statusText.innerText = 'Error processing PDF file.';
            console.error(err);
        }
    }
});
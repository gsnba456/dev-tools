window.ToolRegistry = window.ToolRegistry || [];

window.registerTool = function(toolObject) {
    if (!toolObject || !toolObject.id) return;
    
    const exists = window.ToolRegistry.some(t => t.id === toolObject.id);
    if (!exists) {
        window.ToolRegistry.push(toolObject);
        window.dispatchEvent(new CustomEvent('toolRegistered', { detail: toolObject }));
    }
};

window.copyToClipboard = function(elementId, buttonElement) {
    const targetElement = document.getElementById(elementId);
    if (!targetElement || !targetElement.value.trim()) return;

    navigator.clipboard.writeText(targetElement.value).then(() => {
        const originalText = buttonElement.innerText;
        buttonElement.innerText = "✅ Copied!";
        buttonElement.classList.add("text-emerald-600");

        setTimeout(() => {
            buttonElement.innerText = originalText;
            buttonElement.classList.remove("text-emerald-600");
        }, 1500);
    });
};
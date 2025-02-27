/**
 * Templates module for managing PR templates
 * Using a functional programming approach with pure functions
 */
const Templates = (() => {
    // Generate a unique ID for templates
    const generateId = () => {
        return Date.now().toString(36) + Math.random().toString(36).substring(2);
    };
    
    // Create a new template object
    const createTemplate = (name, content) => ({
        id: generateId(),
        name,
        content,
        createdAt: new Date().toISOString()
    });
    
    // Get all templates from storage
    const getTemplates = () => {
        const config = Storage.getConfig();
        return config.templates || [];
    };
    
    // Save templates to storage
    const saveTemplates = (templates) => {
        return Storage.updateConfig('templates', templates);
    };
    
    // Add a new template
    const addTemplate = (name, content) => {
        const templates = getTemplates();
        const newTemplate = createTemplate(name, content);
        const updatedTemplates = [...templates, newTemplate];
        return saveTemplates(updatedTemplates);
    };
    
    // Update an existing template
    const updateTemplate = (id, name, content) => {
        const templates = getTemplates();
        const updatedTemplates = templates.map(template => 
            template.id === id ? { ...template, name, content } : template
        );
        return saveTemplates(updatedTemplates);
    };
    
    // Delete a template
    const deleteTemplate = (id) => {
        const templates = getTemplates();
        const filteredTemplates = templates.filter(template => template.id !== id);
        return saveTemplates(filteredTemplates);
    };
    
    // Get a template by ID
    const getTemplateById = (id) => {
        const templates = getTemplates();
        return templates.find(template => template.id === id);
    };
    
    // Render template to HTML for preview
    const renderTemplate = (content) => {
        // Simple markdown-like rendering
        // This is a simplified version - in a real app you might use a proper markdown library
        if (!content) return '';
        
        let html = content
            // Convert headings (# Heading)
            .replace(/^# (.*$)/gm, '<h1>$1</h1>')
            .replace(/^## (.*$)/gm, '<h2>$1</h2>')
            .replace(/^### (.*$)/gm, '<h3>$1</h3>')
            
            // Convert bold (**text**)
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            
            // Convert italic (*text*)
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            
            // Convert lists
            .replace(/^\- (.*$)/gm, '<li>$1</li>')
            
            // Convert line breaks
            .replace(/\n/g, '<br>');
        
        // Wrap lists in <ul>
        html = html.replace(/<li>(.*?)<\/li>/g, function(match) {
            return '<ul>' + match + '</ul>';
        });
        
        return html;
    };
    
    // Public API
    return {
        getTemplates,
        addTemplate,
        updateTemplate,
        deleteTemplate,
        getTemplateById,
        renderTemplate
    };
})();
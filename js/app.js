/**
 * Main application module
 * Using a functional programming approach with pure functions and state management
 */
document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const elements = {
        // Repository form
        repoForm: document.getElementById('repo-form'),
        repoUrl: document.getElementById('repo-url'),
        
        // Branch conventions
        branchForm: document.getElementById('branch-form'),
        prefixInput: document.getElementById('prefix-input'),
        addPrefixBtn: document.getElementById('add-prefix'),
        prefixTags: document.getElementById('prefix-tags'),
        separator: document.getElementById('separator'),
        
        // Template management
        templatesContainer: document.getElementById('templates-container'),
        addTemplateBtn: document.getElementById('add-template'),
        templateEditor: document.getElementById('template-editor'),
        templateForm: document.getElementById('template-form'),
        templateName: document.getElementById('template-name'),
        templateContent: document.getElementById('template-content'),
        cancelTemplateBtn: document.getElementById('cancel-template'),
        
        // Preview
        branchPreview: document.getElementById('branch-preview'),
        branchDescription: document.getElementById('branch-description'),
        generateBranchBtn: document.getElementById('generate-branch'),
        copyBranchBtn: document.getElementById('copy-branch'),
        templateSelect: document.getElementById('template-select'),
        templatePreview: document.getElementById('template-preview'),
        copyTemplateBtn: document.getElementById('copy-template'),
        
        // Export/Import
        exportConfigBtn: document.getElementById('export-config'),
        importConfigBtn: document.getElementById('import-config'),
        importFile: document.getElementById('import-file')
    };
    
    // App state (local state, not persisted)
    let state = {
        editingTemplateId: null,
        selectedTemplateId: null
    };
    
    // Initialize the application
    const init = () => {
        loadConfig();
        bindEvents();
    };
    
    // Load configuration from storage
    const loadConfig = () => {
        const config = Storage.getConfig();
        
        // Set repository URL
        elements.repoUrl.value = config.repositoryUrl || '';
        
        // Load branch conventions
        loadBranchConventions(config.branchConventions);
        
        // Load templates
        loadTemplates();
        
        // Update preview
        updateBranchPreview();
    };
    
    // Load branch conventions into UI
    const loadBranchConventions = (conventions) => {
        if (!conventions) return;
        
        // Clear existing prefix tags
        elements.prefixTags.innerHTML = '';
        
        // Load prefixes
        if (conventions.prefixes && Array.isArray(conventions.prefixes)) {
            conventions.prefixes.forEach(prefix => {
                addPrefixTag(prefix);
            });
        }
        
        // Set separator
        if (conventions.separator) {
            elements.separator.value = conventions.separator;
        }
    };
    
    // Load templates into UI
    const loadTemplates = () => {
        const templates = Templates.getTemplates();
        
        // Clear templates container
        elements.templatesContainer.innerHTML = '';
        
        // Render each template
        templates.forEach(template => {
            const templateEl = createTemplateElement(template);
            elements.templatesContainer.appendChild(templateEl);
        });
        
        // Update template select dropdown
        updateTemplateSelect();
    };
    
    // Create a DOM element for a template
    const createTemplateElement = (template) => {
        const div = document.createElement('div');
        div.classList.add('template-card');
        div.dataset.id = template.id;
        
        div.innerHTML = `
            <div class="template-header">
                <h3>${template.name}</h3>
                <div class="template-actions">
                    <button class="btn-small edit-template" data-id="${template.id}">Edit</button>
                    <button class="btn-small btn-secondary delete-template" data-id="${template.id}">Delete</button>
                </div>
            </div>
            <p>${template.content.substring(0, 100)}${template.content.length > 100 ? '...' : ''}</p>
        `;
        
        // Add event listeners
        div.querySelector('.edit-template').addEventListener('click', () => {
            editTemplate(template.id);
        });
        
        div.querySelector('.delete-template').addEventListener('click', () => {
            deleteTemplate(template.id);
        });
        
        return div;
    };
    
    // Update template select dropdown
    const updateTemplateSelect = () => {
        const templates = Templates.getTemplates();
        
        // Clear options except the first one
        while (elements.templateSelect.options.length > 1) {
            elements.templateSelect.remove(1);
        }
        
        // Add options for each template
        templates.forEach(template => {
            const option = document.createElement('option');
            option.value = template.id;
            option.textContent = template.name;
            elements.templateSelect.appendChild(option);
        });
    };
    
    // Add a prefix tag to the UI
    const addPrefixTag = (prefix) => {
        const tag = document.createElement('div');
        tag.classList.add('tag');
        tag.innerHTML = `
            ${prefix}
            <span class="tag-delete" data-prefix="${prefix}">×</span>
        `;
        
        // Add event listener to delete button
        tag.querySelector('.tag-delete').addEventListener('click', (e) => {
            deletePrefix(e.target.dataset.prefix);
        });
        
        elements.prefixTags.appendChild(tag);
    };
    
    // Delete a prefix
    const deletePrefix = (prefix) => {
        const config = Storage.getConfig();
        const prefixes = config.branchConventions?.prefixes || [];
        const updatedPrefixes = prefixes.filter(p => p !== prefix);
        
        // Update storage
        Storage.updateConfig('branchConventions', {
            ...config.branchConventions,
            prefixes: updatedPrefixes
        });
        
        // Reload branch conventions
        loadBranchConventions({
            ...config.branchConventions,
            prefixes: updatedPrefixes
        });
        
        // Update preview
        updateBranchPreview();
    };
    
    // Generate branch name based on conventions
    const generateBranchName = () => {
        const config = Storage.getConfig();
        const prefixes = config.branchConventions?.prefixes || [];
        const separator = config.branchConventions?.separator || '/';
        const description = elements.branchDescription.value.trim();
        
        if (!prefixes.length || !description) {
            return '';
        }
        
        // Use first prefix as default
        const prefix = prefixes[0];
        
        // Format the description (lowercase, replace spaces with hyphens)
        const formattedDescription = description
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9-]/g, '');
        
        return `${prefix}${separator}${formattedDescription}`;
    };
    
    // Update branch preview
    const updateBranchPreview = () => {
        const branchName = generateBranchName();
        elements.branchPreview.textContent = branchName || 'prefix/description';
    };
    
    // Copy text to clipboard
    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text)
            .then(() => {
                // Flash success message (could be improved with a proper notification system)
                alert('Copied to clipboard!');
            })
            .catch(err => {
                console.error('Failed to copy text: ', err);
            });
    };
    
    // Show template editor
    const showTemplateEditor = () => {
        elements.templateEditor.classList.remove('hidden');
        elements.templateName.value = '';
        elements.templateContent.value = '';
        state.editingTemplateId = null;
    };
    
    // Hide template editor
    const hideTemplateEditor = () => {
        elements.templateEditor.classList.add('hidden');
        elements.templateName.value = '';
        elements.templateContent.value = '';
        state.editingTemplateId = null;
    };
    
    // Edit a template
    const editTemplate = (id) => {
        const template = Templates.getTemplateById(id);
        if (!template) return;
        
        elements.templateName.value = template.name;
        elements.templateContent.value = template.content;
        state.editingTemplateId = id;
        
        elements.templateEditor.classList.remove('hidden');
    };
    
    // Delete a template
    const deleteTemplate = (id) => {
        if (confirm('Are you sure you want to delete this template?')) {
            Templates.deleteTemplate(id);
            loadTemplates();
            
            // Update preview if the deleted template was selected
            if (state.selectedTemplateId === id) {
                state.selectedTemplateId = null;
                elements.templateSelect.value = '';
                elements.templatePreview.innerHTML = '';
            }
        }
    };
    
    // Import configuration from a file
    const handleImport = (event) => {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            const success = Storage.importConfig(e.target.result);
            if (success) {
                alert('Configuration imported successfully!');
                loadConfig();
            } else {
                alert('Failed to import configuration. Invalid format.');
            }
        };
        reader.readAsText(file);
    };
    
    // Bind event listeners
    const bindEvents = () => {
        // Repository form
        elements.repoForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const url = elements.repoUrl.value.trim();
            Storage.updateConfig('repositoryUrl', url);
        });
        
        // Branch conventions
        elements.addPrefixBtn.addEventListener('click', () => {
            const prefix = elements.prefixInput.value.trim();
            if (!prefix) return;
            
            const config = Storage.getConfig();
            const prefixes = config.branchConventions?.prefixes || [];
            
            // Don't add duplicates
            if (prefixes.includes(prefix)) {
                alert('This prefix already exists!');
                return;
            }
            
            const updatedPrefixes = [...prefixes, prefix];
            
            // Update storage
            Storage.updateConfig('branchConventions', {
                ...config.branchConventions,
                prefixes: updatedPrefixes
            });
            
            // Add to UI
            addPrefixTag(prefix);
            
            // Clear input
            elements.prefixInput.value = '';
            
            // Update preview
            updateBranchPreview();
        });
        
        elements.separator.addEventListener('change', () => {
            const separator = elements.separator.value;
            const config = Storage.getConfig();
            
            // Update storage
            Storage.updateConfig('branchConventions', {
                ...config.branchConventions,
                separator
            });
            
            // Update preview
            updateBranchPreview();
        });
        
        elements.branchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            // Already handled by individual input changes
        });
        
        // Branch preview
        elements.branchDescription.addEventListener('input', () => {
            updateBranchPreview();
        });
        
        elements.generateBranchBtn.addEventListener('click', () => {
            updateBranchPreview();
        });
        
        elements.copyBranchBtn.addEventListener('click', () => {
            const branchName = elements.branchPreview.textContent;
            copyToClipboard(branchName);
        });
        
        // Templates
        elements.addTemplateBtn.addEventListener('click', () => {
            showTemplateEditor();
        });
        
        elements.cancelTemplateBtn.addEventListener('click', () => {
            hideTemplateEditor();
        });
        
        elements.templateForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const name = elements.templateName.value.trim();
            const content = elements.templateContent.value.trim();
            
            if (!name || !content) {
                alert('Please provide both name and content for the template.');
                return;
            }
            
            if (state.editingTemplateId) {
                // Update existing template
                Templates.updateTemplate(state.editingTemplateId, name, content);
            } else {
                // Add new template
                Templates.addTemplate(name, content);
            }
            
            // Reload templates and hide editor
            loadTemplates();
            hideTemplateEditor();
        });
        
        // Template preview
        elements.templateSelect.addEventListener('change', () => {
            const templateId = elements.templateSelect.value;
            if (!templateId) {
                elements.templatePreview.innerHTML = '';
                state.selectedTemplateId = null;
                return;
            }
            
            const template = Templates.getTemplateById(templateId);
            if (template) {
                elements.templatePreview.innerHTML = Templates.renderTemplate(template.content);
                state.selectedTemplateId = templateId;
            }
        });
        
        elements.copyTemplateBtn.addEventListener('click', () => {
            const templateId = elements.templateSelect.value;
            if (!templateId) return;
            
            const template = Templates.getTemplateById(templateId);
            if (template) {
                copyToClipboard(template.content);
            }
        });
        
        // Export/Import
        elements.exportConfigBtn.addEventListener('click', () => {
            Storage.exportConfig();
        });
        
        elements.importConfigBtn.addEventListener('click', () => {
            elements.importFile.click();
        });
        
        elements.importFile.addEventListener('change', handleImport);
    };
    
    // Initialize the app
    init();
});
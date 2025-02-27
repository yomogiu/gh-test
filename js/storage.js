/**
 * Storage module for managing persistence of app configuration
 * Using a functional programming approach with pure functions
 */
const Storage = (() => {
    // Constants
    const STORAGE_KEY = 'github_convention_manager';
    
    // Default configuration
    const defaultConfig = {
        repositoryUrl: '',
        branchConventions: {
            prefixes: ['feature', 'bugfix', 'hotfix', 'release', 'docs'],
            separator: '/',
        },
        templates: []
    };
    
    // Pure function to get configuration
    const getConfig = () => {
        try {
            const storedConfig = localStorage.getItem(STORAGE_KEY);
            return storedConfig ? JSON.parse(storedConfig) : defaultConfig;
        } catch (error) {
            console.error('Error retrieving configuration:', error);
            return defaultConfig;
        }
    };
    
    // Pure function to save configuration
    const saveConfig = (config) => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
            return true;
        } catch (error) {
            console.error('Error saving configuration:', error);
            return false;
        }
    };
    
    // Pure function to update a specific part of the configuration
    const updateConfig = (key, value) => {
        const currentConfig = getConfig();
        const newConfig = {
            ...currentConfig,
            [key]: value
        };
        return saveConfig(newConfig);
    };
    
    // Export configuration to a JSON file
    const exportConfig = () => {
        const config = getConfig();
        const dataStr = JSON.stringify(config, null, 2);
        const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
        
        const exportFileDefaultName = 'github-conventions-config.json';
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    };
    
    // Import configuration from a JSON file
    const importConfig = (fileContent) => {
        try {
            const config = JSON.parse(fileContent);
            return saveConfig(config);
        } catch (error) {
            console.error('Error importing configuration:', error);
            return false;
        }
    };
    
    // Public API
    return {
        getConfig,
        saveConfig,
        updateConfig,
        exportConfig,
        importConfig
    };
})();
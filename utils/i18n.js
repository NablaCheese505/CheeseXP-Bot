const config = require('../config.json');
const fs = require('fs');
const path = require('path');


const locales = {
    es: require('../lang/es.json'),
    en: require('../lang/en.json')
};

// Idioma por defecto
const DEFAULT_LANG = config.defaultLanguage || 'es';

/**
 * Función para obtener un texto traducido
 * @param {string} key - La ruta del texto (ej. "commands.ping.pong")
 * @param {object} variables - Variables a reemplazar (ej. { ms: 120 })
 * @param {string} lang - El idioma solicitado (opcional)
 */
function t(key, variables = {}, lang = DEFAULT_LANG) {
    // Si el idioma no existe, usamos el por defecto
    const selectedLang = locales[lang] ? locales[lang] : locales[DEFAULT_LANG];
    
    // Navegamos por el JSON usando la llave (ej: commands -> ping -> pong)
    const keys = key.split('.');
    let text = selectedLang;
    
    for (const k of keys) {
        text = text[k];
        if (!text) return key; // Si no encuentra la traducción, devuelve la llave misma
    }

    // Reemplazamos las variables en el texto (ej. {ms} por 120)
    for (const [varName, varValue] of Object.entries(variables)) {
        text = text.replace(`{${varName}}`, varValue);
    }

    return text;
}

module.exports = { t };
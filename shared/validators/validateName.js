/**
 * Valida un nombre completo basándose en varios criterios:
 * 1. Formato básico (al menos dos palabras separadas por espacios).
 * 2. Longitud razonable de cada palabra.
 * 3. Ausencia de caracteres repetidos excesivos.
 * 4. Balance entre vocales y consonantes.
 * @param {string} nombre - El nombre a validar.
 * @returns {boolean} - True si el nombre es válido, false en caso contrario.
 */


function validarNombre(nombre) {
    if (!nombre) return false;
    const nombreLimpio = nombre.trim();
    const regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ]+(?:\s+[a-zA-ZáéíóúÁÉÍÓÚñÑ]+)+$/;
    if (!regex.test(nombreLimpio)) return false;
    const palabras = nombreLimpio.split(/\s+/);
    for (const palabra of palabras) {
        if (palabra.length > 15 || palabra.length < 2) return false;
    }

    const repetidos = /(.)\1\1/;
    if (repetidos.test(nombreLimpio)) return false;

    const consonantesSeguidas = /[^aeiouáéíóúAEIOUÁÉÍÓÚ\s]{4,}/;
    if (consonantesSeguidas.test(nombreLimpio)) return false;

    const vocales = nombreLimpio.match(/[aeiouáéíóúAEIOUÁÉÍÓÚ]/g);
    const totalLetras = nombreLimpio.replace(/\s/g, '').length;
    if (!vocales) return false;
    if (vocales.length / totalLetras < 0.15) return false;
    return true;
}

module.exports = { validarNombre };

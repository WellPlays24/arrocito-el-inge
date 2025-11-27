/**
 * Valida una cédula ecuatoriana (Persona Natural).
 * @param {string} cedula - Número de cédula a validar.
 * @returns {boolean} - true si es válida, false si no.
 */
function validarCedula(cedula) {
    // 1. Validar que tenga 10 dígitos y sea numérico
    if (!cedula || cedula.length !== 10 || isNaN(cedula)) {
        return false;
    }

    // 2. Validar código de provincia (dos primeros dígitos)
    // Provincias del 01 al 24. 30 es para ecuatorianos en el exterior.
    const provincia = parseInt(cedula.substring(0, 2), 10);
    if (!((provincia >= 1 && provincia <= 24) || provincia === 30)) {
        return false;
    }

    // 3. Validar tercer dígito (debe ser menor a 6 para personas naturales)
    const tercerDigito = parseInt(cedula.substring(2, 3), 10);
    if (tercerDigito >= 6) {
        return false;
    }

    // 4. Algoritmo Módulo 10 (Luhn)
    // Coeficientes: 2, 1, 2, 1, 2, 1, 2, 1, 2
    const coeficientes = [2, 1, 2, 1, 2, 1, 2, 1, 2];
    const digitoVerificador = parseInt(cedula.substring(9, 10), 10);
    let suma = 0;

    for (let i = 0; i < 9; i++) {
        let valor = parseInt(cedula.substring(i, i + 1), 10) * coeficientes[i];
        if (valor >= 10) {
            valor -= 9;
        }
        suma += valor;
    }

    const residuo = suma % 10;
    let resultado = 0;

    if (residuo !== 0) {
        resultado = 10 - residuo;
    }

    return resultado === digitoVerificador;
}

module.exports = { validarCedula };

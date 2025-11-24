/**
 * Valida una cédula ecuatoriana basándose en varios criterios:
 * 1. Longitud exacta de 10 dígitos.
 * 2. Los dos primeros dígitos deben corresponder a una provincia válida (01 a 24).
 * 3. El tercer dígito debe ser menor a 6 (para personas naturales).
 * 4. Validación del dígito verificador usando el algoritmo de módulo 10.
 * @param {string} cedula - La cédula a validar, representada como una cadena de texto numérica.
 * @returns {boolean} - True si la cédula es válida, false en caso contrario.
 */

function validarCedula(cedula) {
    // Debe tener exactamente 10 dígitos
    if (!/^\d{10}$/.test(cedula)) return false;

    const provincia = parseInt(cedula.substring(0, 2), 10);

    // Provincias válidas: 01 a 24
    if (provincia < 1 || provincia > 24) return false;

    const tercerDigito = parseInt(cedula[2], 10);

    // Para personas naturales el tercer dígito debe ser menor a 6
    if (tercerDigito >= 6) return false;

    // Validación del dígito verificador (módulo 10)
    const coeficientes = [2, 1, 2, 1, 2, 1, 2, 1, 2];
    let suma = 0;

    for (let i = 0; i < 9; i++) {
        let valor = parseInt(cedula[i]) * coeficientes[i];

        if (valor >= 10) valor -= 9;

        suma += valor;
    }

    const verificador = suma % 10 === 0 ? 0 : 10 - (suma % 10);

    return verificador === parseInt(cedula[9]);
}

module.exports = { validarCedula };

const scale = 9999991;
const shift = 999999999;

function encrypt(value) {
    const encryptedValue = (value * scale) + shift;
    if (encryptedValue > Number.MAX_SAFE_INTEGER) {
        throw new Error("Encrypted value exceeds safe integer limit for database storage.");
    }
    return encryptedValue;
}

function decrypt(encryptedValue) {
    const transformedValue = (encryptedValue - shift) / scale;
    return Math.round(transformedValue);
}

module.exports = {
    encrypt,
    decrypt
};

const scale = 9999991;
const shift = 999999999;
const key = 9876543210;
const mod = 10000000019;

function encrypt(value) {
    let transformedValue = (value * scale) + shift;
    transformedValue = transformedValue ^ key;
    return transformedValue % mod;
}

function decrypt(encryptedValue) {
    let transformedValue = encryptedValue % mod;
    transformedValue = transformedValue ^ key;
    return (transformedValue - shift) / scale;
}

module.exports = {
    encrypt,
    decrypt
};

// Base64 Encode
export const encodeBase64 = (text) => {
    try {
        return btoa(unescape(encodeURIComponent(text)));
    } catch (e) {
        throw new Error('Failed to encode: Invalid input');
    }
};

// Base64 Decode
export const decodeBase64 = (text) => {
    try {
        return decodeURIComponent(escape(atob(text)));
    } catch (e) {
        throw new Error('Failed to decode: Invalid Base64 string');
    }
};

// URL Encode
export const encodeURL = (text) => {
    try {
        return encodeURIComponent(text);
    } catch (e) {
        throw new Error('Failed to encode URL');
    }
};

// URL Decode
export const decodeURL = (text) => {
    try {
        return decodeURIComponent(text);
    } catch (e) {
        throw new Error('Failed to decode URL: Invalid format');
    }
};

// Hex Encode
export const encodeHex = (text) => {
    try {
        return Array.from(text)
            .map(char => char.charCodeAt(0).toString(16).padStart(2, '0'))
            .join('');
    } catch (e) {
        throw new Error('Failed to encode to Hex');
    }
};

// Hex Decode
export const decodeHex = (text) => {
    try {
        const hex = text.replace(/\s/g, '');
        if (!/^[0-9A-Fa-f]*$/.test(hex)) {
            throw new Error('Invalid hex string');
        }
        return hex.match(/.{1,2}/g)
            ?.map(byte => String.fromCharCode(parseInt(byte, 16)))
            .join('') || '';
    } catch (e) {
        throw new Error('Failed to decode Hex: Invalid format');
    }
};

// Binary Encode
export const encodeBinary = (text) => {
    try {
        return Array.from(text)
            .map(char => char.charCodeAt(0).toString(2).padStart(8, '0'))
            .join(' ');
    } catch (e) {
        throw new Error('Failed to encode to Binary');
    }
};

// Binary Decode
export const decodeBinary = (text) => {
    try {
        const binary = text.replace(/\s/g, '');
        if (!/^[01]*$/.test(binary)) {
            throw new Error('Invalid binary string');
        }
        return binary.match(/.{1,8}/g)
            ?.map(byte => String.fromCharCode(parseInt(byte, 2)))
            .join('') || '';
    } catch (e) {
        throw new Error('Failed to decode Binary: Invalid format');
    }
};

// HTML Entities Encode
export const encodeHTML = (text) => {
    try {
        const element = document.createElement('div');
        element.textContent = text;
        return element.innerHTML;
    } catch (e) {
        throw new Error('Failed to encode HTML entities');
    }
};

// HTML Entities Decode
export const decodeHTML = (text) => {
    try {
        const element = document.createElement('div');
        element.innerHTML = text;
        return element.textContent || '';
    } catch (e) {
        throw new Error('Failed to decode HTML entities');
    }
};

// --- NEW: JWT Decoder Logic ---
export const decodeJWT = (token) => {
    try {
        const parts = token.trim().split('.');
        if (parts.length !== 3) {
            throw new Error('Token must have 3 parts (Header.Payload.Signature)');
        }

        const b64Decode = (str) => {
            let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
            while (base64.length % 4 !== 0) base64 += '=';
            return JSON.parse(atob(base64));
        };

        const result = {
            header: b64Decode(parts[0]),
            payload: b64Decode(parts[1])
        };

        return JSON.stringify(result, null, 2);
    } catch (e) {
        throw new Error('Invalid JWT: ' + e.message);
    }
};

// --- NEW: JSON Formatter & Validator Logic ---
export const formatJSON = (text) => {
    if (!text || !text.trim()) return '';
    try {
        const parsed = JSON.parse(text);
        return JSON.stringify(parsed, null, 2); // 2 spaces indentation
    } catch (e) {
        throw new Error('Invalid JSON: ' + e.message);
    }
};

// Get encoding function based on type
export const getEncoderDecoder = (type) => {
    const functions = {
        'base64-encode': encodeBase64,
        'base64-decode': decodeBase64,
        'url-encode': encodeURL,
        'url-decode': decodeURL,
        'hex-encode': encodeHex,
        'hex-decode': decodeHex,
        'binary-encode': encodeBinary,
        'binary-decode': decodeBinary,
        'html-encode': encodeHTML,
        'html-decode': decodeHTML,
        'jwt-decode': decodeJWT,
        'json-format': formatJSON, 
    };

    return functions[type] || ((text) => text);
};

// Encoding types configuration
export const encodingTypes = [
    { value: 'base64-encode', label: 'Base64 Encode', description: 'Encode text to Base64' },
    { value: 'base64-decode', label: 'Base64 Decode', description: 'Decode Base64 to text' },
    { value: 'url-encode', label: 'URL Encode', description: 'Encode for URL use' },
    { value: 'url-decode', label: 'URL Decode', description: 'Decode URL encoded text' },
    { value: 'hex-encode', label: 'Hex Encode', description: 'Encode to hexadecimal' },
    { value: 'hex-decode', label: 'Hex Decode', description: 'Decode from hexadecimal' },
    { value: 'binary-encode', label: 'Binary Encode', description: 'Encode to binary' },
    { value: 'binary-decode', label: 'Binary Decode', description: 'Decode from binary' },
    { value: 'html-encode', label: 'HTML Entity Encode', description: 'Encode HTML entities' },
    { value: 'html-decode', label: 'HTML Entity Decode', description: 'Decode HTML entities' },
    { value: 'jwt-decode', label: 'JWT Decode', description: 'Decode JSON Web Token parts' },
    { value: 'json-format', label: 'JSON Formatter', description: 'Pretty print and validate JSON' }, // Naya option add kiya
];
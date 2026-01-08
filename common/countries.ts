export const COUNTRIES = [
    { code: 'AR', name: 'Argentina' },
    { code: 'BE', name: 'Belgium' },
    { code: 'BR', name: 'Brazil' },
    { code: 'CL', name: 'Chile' },
    { code: 'CN', name: 'China' },
    { code: 'CO', name: 'Colombia' },
    { code: 'DE', name: 'Germany' },
    { code: 'DK', name: 'Denmark' },
    { code: 'ES', name: 'Spain' },
    { code: 'FI', name: 'Finland' },
    { code: 'FR', name: 'France' },
    { code: 'GB', name: 'United Kingdom' },
    { code: 'IE', name: 'Ireland' },
    { code: 'IN', name: 'India' },
    { code: 'IT', name: 'Italy' },
    { code: 'MX', name: 'Mexico' },
    { code: 'NL', name: 'Netherlands' },
    { code: 'NO', name: 'Norway' },
    { code: 'PE', name: 'Peru' },
    { code: 'PL', name: 'Poland' },
    { code: 'PT', name: 'Portugal' },
    { code: 'SE', name: 'Sweden' },
    { code: 'US', name: 'United States' },
    { code: 'UY', name: 'Uruguay' },
    { code: 'VE', name: 'Venezuela' }
].sort((a, b) => a.name.localeCompare(b.name));

export const getFlagEmoji = (countryOrCode: string) => {
    if (!countryOrCode) return '';
    let code = countryOrCode;

    if (code.length > 2) {
        const found = COUNTRIES.find(c => c.name.toLowerCase() === code.toLowerCase());
        if (found) code = found.code;
    }

    if (code.length !== 2) return '🌍'; // Fallback if not a 2-letter code

    const codePoints = code
        .toUpperCase()
        .split('')
        .map(char => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
};

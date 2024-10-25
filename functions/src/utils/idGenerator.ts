export function generateRegisterID(): string {
    const prefix = 'REG'; // Prefijo para el ID
    const datePart = new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 8); // Fecha en formato YYYYMMDD
    const randomPart = Math.floor(Math.random() * 10000).toString().padStart(4, '0'); // Número aleatorio de 4 dígitos

    return `${prefix}-${datePart}-${randomPart}`; // Ejemplo: REG-20231024-1234
}

export function generateMealID(): string {
    const prefix = 'MEAL'; // Prefix for the Meal ID
    const datePart = new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 8); // Date in YYYYMMDD format
    const randomPart = Math.floor(Math.random() * 10000).toString().padStart(4, '0'); // 4-digit random number

    return `${prefix}-${datePart}-${randomPart}`; // Example: MEAL-20231024-5678
}

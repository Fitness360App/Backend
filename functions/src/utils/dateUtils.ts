import { format, parse } from 'date-fns';

export function formatDateToDDMMYYYY(date: Date): string {
    const day = String(date.getDate()).padStart(2, '0'); // Asegurar que el día tenga 2 dígitos
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Los meses son 0-indexed
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
}



export const convertToDatabaseDate = (dateString: string): string => {
    try {
        const parsedDate = parse(dateString, 'dd/MM/yyyy', new Date());
        return format(parsedDate, 'yyyy-MM-dd');
    } catch (error) {
        throw new Error('Formato de fecha no válido');
    }
};

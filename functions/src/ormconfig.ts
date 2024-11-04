import { DataSource } from 'typeorm';

export const AppDataSource = new DataSource({
    type: "mysql", // Cambia esto según tu base de datos
    host: "localhost",
    port: 3306,
    username: "root",
    password: "Eduesputomoro1234",
    database: "fitness360",
    synchronize: true, // Útil en desarrollo, desactívalo en producción
    logging: true,
    entities: [__dirname + "/entity/*.ts"],
    migrations: ["src/migration/*.ts"],
    subscribers: ["src/subscriber/*.ts"],
});

console.log(__dirname);

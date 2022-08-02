module.exports = {
    "type": "postgres",
    ...(process.env.DATABASE_URL ? {url: process.env.DATABASE_URL} : {
        "host": "localhost",
        "port": 5432,
        "username": "postgres",
        "password": "password",
        "database": "graphql_todolist",
    }),
    "synchronize": false,
    "logging": false,
    "entities": ["dist/entity/**/*.js"],
    "migrations": ["dist/migration/**/*.js"],
    "subscribers": ["dist/subscriber/**/*.js"],
    "cli": {
        "entitiesDir": "src/entity",
        "migrationsDir": "src/migration",
        "subscribersDir": "src/subscriber"
    },
    extra: {
        "ssl": {
            "rejectUnauthorized": false
        }
    },
}

import * as pg from "pg";
const { Pool } = pg.default;

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "quora",
  password: "12345",
  port: 5432,
});

export { pool };

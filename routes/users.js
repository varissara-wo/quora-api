import { Router } from "express";
import bcrypt from "bcrypt";
import { pool } from "../utils/db.js";

const usersRounter = Router();

usersRounter.get("/", async (req, res) => {
  try {
    const usersData = await pool.query(`select * from users`);
    return res.status(200).json({
      data: usersData.rows,
    });
  } catch (err) {
    throw err;
  }
});

usersRounter.get("/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    const userData = await pool.query(
      `select * from users where user_id = $1`,
      [userId]
    );

    return res.status(200).json({
      data: userData.rows,
    });
  } catch (err) {
    throw err;
  }
});

usersRounter.post("/", async (req, res) => {
  try {
    const newUser = {
      username: req.body.username,
      password: req.body.password,
      position: req.body.position,
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      created_at: new Date(),
      updated_at: new Date(),
      last_logged_in: new Date(),
    };

    const salt = await bcrypt.genSalt(10);
    newUser.password = await bcrypt.hash(newUser.password, salt);

    await pool.query(
      `insert into users (username, password, position, firstname, lastname, created_at, updated_at, last_logged_in) 
        values($1,$2,$3,$4,$5,$6,$7,$8)`,
      [
        newUser.username,
        newUser.password,
        newUser.position,
        newUser.firstname,
        newUser.lastname,
        newUser.created_at,
        newUser.updated_at,
        newUser.last_logged_in,
      ]
    );

    return res.status(201).json({
      message: "New user has been created successfully",
    });
  } catch (err) {
    throw err;
  }
});

usersRounter.put("/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    const updatedUser = {
      ...req.body,
      updated_at: new Date(),
    };

    await pool.query(
      `update users set position = $1, firstname = $2, lastname = $3 where user_id= $4`,
      [
        updatedUser.position,
        updatedUser.firstname,
        updatedUser.lastname,
        userId,
      ]
    );

    res.status(200).json({
      message: "User data has been updated successfully",
    });
  } catch (err) {
    throw err;
  }
});

usersRounter.delete("/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    await pool.query(`delete from users where user_id = $1`, [userId]);
    res.status(200).json({
      message: "User data has been delete successfully",
    });
  } catch (err) {
    throw err;
  }
});

export default usersRounter;

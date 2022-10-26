import { Router } from "express";
import { pool } from "../utils/db.js";

const questionsRouter = Router();

questionsRouter.get("/", async (req, res) => {
  try {
    const category = req.query.category || "";

    let query = "";
    let values = [];

    if (category) {
      query =
        "select questions.question_id,questions.user_id,questions.title,questions.content,questions.image,questions.video,questions.like_count,questions.unlike_count,questions.created_at,questions.updated_at from questions_categories inner join categories on questions_categories.category_id = categories.category_id inner join questions on questions.question_id = questions_categories.question_id where category_name  = $1";
      values = [category];
    } else {
      query = "select * from questions";
    }

    const questions = await pool.query(query, values);
    res.status(200).json({
      data: questions.rows,
    });
  } catch (err) {
    throw err;
  }
});

questionsRouter.get("/:id", async (req, res) => {
  const userId = req.params.id;
  try {
    const question = await pool.query(
      `select * from questions where user_id = $1`,
      [userId]
    );
    res.status(200).json({
      data: question.rows,
    });
  } catch (err) {
    throw err;
  }
});

questionsRouter.post("/", async (req, res) => {
  try {
    const newQuestion = {
      user_id: req.body.user_id,
      title: req.body.title,
      content: req.body.content,
      image: req.body.image,
      video: req.body.video,
      categories: req.body.categories,
      created_at: new Date(),
      updated_at: new Date(),
    };

    const questionCategoriesId = [];
    let categoryId;

    newQuestion.categories.map(async (item) => {
      try {
        categoryId = await pool.query(
          `select category_id from categories where category_name = $1`,
          [item]
        );

        if (categoryId.rows.length === 0) {
          try {
            categoryId = await pool.query(
              `insert into categories (category_name) values($1) returning  category_id`,
              [item]
            );
            console.log("create new category");
          } catch (err) {
            throw err;
          }
        }
        questionCategoriesId.push(categoryId.rows[0].category_id);
      } catch (err) {
        throw err;
      }
    });

    const newQuestionId = await pool.query(
      `insert into questions (user_id,title,content,image,video,created_at,updated_at,categories) values($1,$2,$3,$4,$5,$6,$7,$8) returning question_id`,
      [
        newQuestion.user_id,
        newQuestion.title,
        newQuestion.content,
        newQuestion.image,
        newQuestion.video,
        newQuestion.created_at,
        newQuestion.updated_at,
        newQuestion.categories,
      ]
    );

    questionCategoriesId.map(async (item) => {
      await pool.query(
        `insert into questions_categories (question_id,category_id) values($1,$2)`,
        [newQuestionId.rows[0].question_id, item]
      );
    });

    return res.status(200).json({
      message: "Question has been created successfully",
    });
  } catch (err) {
    throw err;
  }
});

questionsRouter.put("/:id", async (req, res) => {
  try {
    const questionId = req.params.id;
    const updatedQuestion = {
      ...req.body,
      updated_at: new Date(),
    };

    await pool.query(
      `update questions set title = $1, content = $2, image = $3, video = $4, updated_at = $5 where question_id= $6`,
      [
        updatedQuestion.title,
        updatedQuestion.content,
        updatedQuestion.image,
        updatedQuestion.video,
        updatedQuestion.updated_at,
        questionId,
      ]
    );

    res.status(200).json({
      message: "Question has been updated successfully",
    });
  } catch (err) {
    throw err;
  }
});

questionsRouter.delete("/:id", async (req, res) => {
  try {
    const questionId = req.params.id;
    await pool.query(`delete from questions where question_id = $1`, [
      questionId,
    ]);

    await pool.query(
      `delete from questions_categories where question_id = $1`,
      [questionId]
    );

    res.status(200).json({
      message: "Question has been delete from your dashboard successfully",
    });
  } catch (err) {
    throw err;
  }
});

questionsRouter.post("user/:id/:LikesController", async (req, res) => {
  const questionId = req.params.id;
  const userId = req.body.user_id;
  const isLike = req.params.LikesController;

  try {
    const isSameUser = await pool.query(
      `select * from like_unlike where question_id = $1 and user_id = $2`,
      [questionId, userId]
    );

    if (isSameUser.rows.length === 0) {
      await pool.query(
        `insert into like_unlike (user_id,question_id,is_like) values($1,$2,$3)`,
        [userId, questionId, isLike]
      );
    } else if (isSameUser.rows[0].is_like == isLike) {
      await pool.query(
        `update like_unlike set is_like = Null where question_id = $1 and user_id = $2`,
        [questionId, userId]
      );
    } else {
      await pool.query(
        `update like_unlike set is_like = $1 where question_id = $2 and user_id = $3`,
        [isLike, questionId, userId]
      );
    }

    //update like and unlike
    const updateLike = await pool.query(
      `select count(like_unlike) from like_unlike where question_id = $1 and is_like = $2`,
      [questionId, true]
    );

    const updateUnlike = await pool.query(
      `select count(like_unlike) from like_unlike where question_id = $1 and is_like = $2`,
      [questionId, false]
    );

    await pool.query(
      `update questions set like_count = $1, unlike_count = $2 where question_id = $3`,
      [updateLike.rows[0].count, updateUnlike.rows[0].count, questionId]
    );

    res.status(200).json({ message: "Successfully" });
  } catch (err) {
    throw err;
  }
});

export default questionsRouter;

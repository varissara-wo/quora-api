import { Router } from "express";
import { pool } from "../utils/db.js";

const commentsRouter = Router();

commentsRouter.post("/:id/comments", async (req, res) => {
  try {
    const newComment = {
      user_id: req.body.user_id,
      question_id: req.params.id,
      content: req.body.content,
      image: req.body.image,
      video: req.body.video,
      created_at: new Date(),
      updated_at: new Date(),
    };

    await pool.query(
      `insert into comments (user_id,question_id,content,image,video,created_at,updated_at) values($1,$2,$3,$4,$5,$6,$7)`,
      [
        newComment.user_id,
        newComment.question_id,
        newComment.content,
        newComment.image,
        newComment.video,
        newComment.created_at,
        newComment.updated_at,
      ]
    );

    res.status(200).json({ message: "Create new comment successfully" });
  } catch (err) {
    throw err;
  }
});

commentsRouter.get("/:id/comments", async (req, res) => {
  try {
    const questionId = req.params.id;
    const comments = await pool.query(
      `select * from comments where question_id = $1`,
      [questionId]
    );
    res.status(200).json({
      data: comments.rows,
    });
  } catch (err) {
    throw err;
  }
});

commentsRouter.post("/:id/comments/:agreement", async (req, res) => {
  try {
    const isAgree = req.params.agreement;
    const commentId = req.body.comment_id;
    const agree = await pool.query(
      `select count_agree from comments where comment_id = $1`,
      [commentId]
    );

    if (isAgree == true) {
      const updateCount = agree.rows[0].count_agree + 1;
      await pool.query(
        `update comments set count_agree = $1 where comment_id = $2`,
        [updateCount, commentId]
      );
    } else {
      const updateCount = agree.rows[0].count_agree - 1;
      await pool.query(
        `update comments set count_agree = $1 where comment_id = $2`,
        [updateCount, commentId]
      );
    }
    return res.status(200).json({ message: "Sucessfully!" });
  } catch (err) {
    throw err;
  }
});

export default commentsRouter;

const express = require("express");
const router = express.Router();

// GET /posts - list posts (sample)
router.get("/posts", (req, res) => {
	res.json([
		{ id: 1, title: "First Post", body: "Hello" },
		{ id: 2, title: "Second Post", body: "World" }
	]);
});

// POST /posts - create post (echo sample)
router.post("/posts", (req, res) => {
	const post = req.body;
	if (!post || !post.title) {
		return res.status(400).json({ error: "title is required" });
	}
	res.status(201).json({ id: Date.now(), ...post });
});

module.exports = router;

const express = require('express');
const Question = require('../models/Question');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all questions
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, search, tags, sort = 'newest', filter = 'all' } = req.query;
    
    let query = {};
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (tags) {
      query.tags = { $in: tags.split(',') };
    }

    // Apply filters
    if (filter === 'unanswered') {
      query.answers = { $size: 0 };
    } else if (filter === 'answered') {
      query.answers = { $not: { $size: 0 } };
    }

    // Determine sort order
    let sortOrder = {};
    switch (sort) {
      case 'oldest':
        sortOrder = { createdAt: 1 };
        break;
      case 'most-voted':
        // For now, we'll use a simple aggregation
        // In production, you might want to calculate vote scores
        sortOrder = { createdAt: -1 }; // Fallback to newest
        break;
      case 'newest':
      default:
        sortOrder = { createdAt: -1 };
        break;
    }

    let questionsQuery = Question.find(query)
      .populate('author', 'username avatar reputation')
      .populate('answers')
      .sort(sortOrder)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // For most-voted, we need to do additional processing
    if (sort === 'most-voted') {
      const questions = await Question.aggregate([
        { $match: query },
        {
          $addFields: {
            voteScore: {
              $subtract: [
                { $size: '$votes.up' },
                { $size: '$votes.down' }
              ]
            }
          }
        },
        { $sort: { voteScore: -1, createdAt: -1 } },
        { $skip: (page - 1) * limit },
        { $limit: limit * 1 }
      ]);

      const populatedQuestions = await Question.populate(questions, [
        { path: 'author', select: 'username avatar reputation' },
        { path: 'answers' }
      ]);

      const total = await Question.countDocuments(query);

      return res.json({
        questions: populatedQuestions,
        totalPages: Math.ceil(total / limit),
        currentPage: page
      });
    }

    const questions = await questionsQuery;
    const total = await Question.countDocuments(query);

    res.json({
      questions,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get question by ID
router.get('/:id', async (req, res) => {
  try {
    const question = await Question.findById(req.params.id)
      .populate('author', 'username avatar reputation')
      .populate({
        path: 'answers',
        populate: {
          path: 'author',
          select: 'username avatar reputation'
        }
      });

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    // Increment view count
    question.views += 1;
    await question.save();

    res.json(question);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create question
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, tags } = req.body;
    
    const question = new Question({
      title,
      description,
      tags,
      author: req.user._id
    });

    await question.save();
    await question.populate('author', 'username avatar reputation');

    res.status(201).json(question);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Vote on question
router.post('/:id/vote', auth, async (req, res) => {
  try {
    const { voteType } = req.body; // 'up' or 'down'
    const question = await Question.findById(req.params.id);
    
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    // Remove previous vote
    question.votes.up.pull(req.user._id);
    question.votes.down.pull(req.user._id);

    // Add new vote
    if (voteType === 'up') {
      question.votes.up.push(req.user._id);
    } else if (voteType === 'down') {
      question.votes.down.push(req.user._id);
    }

    await question.save();
    res.json(question);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
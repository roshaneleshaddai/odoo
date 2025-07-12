const express = require('express');
const Answer = require('../models/Answer');
const Question = require('../models/Question');
const Notification = require('../models/Notification');
const auth = require('../middleware/auth');

const router = express.Router();

// Create answer
router.post('/', auth, async (req, res) => {
  try {
    const { content, questionId } = req.body;
    
    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    const answer = new Answer({
      content,
      author: req.user._id,
      question: questionId
    });

    await answer.save();
    await answer.populate('author', 'username avatar reputation');

    // Add answer to question
    question.answers.push(answer._id);
    await question.save();

    // Create notification for question author
    if (question.author.toString() !== req.user._id.toString()) {
      const notification = new Notification({
        recipient: question.author,
        sender: req.user._id,
        type: 'answer',
        message: `${req.user.username} answered your question`,
        questionId: questionId,
        answerId: answer._id
      });
      await notification.save();
    }

    res.status(201).json(answer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Vote on answer
router.post('/:id/vote', auth, async (req, res) => {
  try {
    const { voteType } = req.body;
    const answer = await Answer.findById(req.params.id);
    
    if (!answer) {
      return res.status(404).json({ message: 'Answer not found' });
    }

    // Remove previous vote
    answer.votes.up.pull(req.user._id);
    answer.votes.down.pull(req.user._id);

    // Add new vote
    if (voteType === 'up') {
      answer.votes.up.push(req.user._id);
    } else if (voteType === 'down') {
      answer.votes.down.push(req.user._id);
    }

    await answer.save();
    res.json(answer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Accept answer
router.post('/:id/accept', auth, async (req, res) => {
  try {
    const answer = await Answer.findById(req.params.id);
    const question = await Question.findById(answer.question);
    
    if (!answer || !question) {
      return res.status(404).json({ message: 'Answer or question not found' });
    }

    // Check if user is question author
    if (question.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only question author can accept answers' });
    }

    // Remove previous accepted answer
    await Answer.updateMany(
      { question: question._id },
      { isAccepted: false }
    );

    // Accept this answer
    answer.isAccepted = true;
    await answer.save();

    question.acceptedAnswer = answer._id;
    await question.save();

    res.json(answer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
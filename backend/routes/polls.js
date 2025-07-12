const express = require('express');
const router = express.Router();
const Poll = require('../models/Poll');
const auth = require('../middleware/auth');

// Get all polls
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, sort = 'createdAt', order = 'desc', search = '' } = req.query;
    
    const query = { isActive: true };
    if (search) {
      query.$or = [
        { question: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const polls = await Poll.find(query)
      .populate('author', 'username')
      .sort({ [sort]: order === 'desc' ? -1 : 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Poll.countDocuments(query);

    res.json({
      polls,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single poll
router.get('/:id', async (req, res) => {
  try {
    const poll = await Poll.findById(req.params.id)
      .populate('author', 'username')
      .populate('options.votes.user', 'username');

    if (!poll) {
      return res.status(404).json({ error: 'Poll not found' });
    }

    // Add user's vote information if authenticated
    let userVotes = [];
    if (req.user) {
      userVotes = poll.getUserVotes(req.user.id);
    }

    const results = poll.getResults();
    const isExpired = poll.isExpired;

    res.json({
      poll,
      results,
      userVotes,
      isExpired,
      hasVoted: req.user ? poll.hasUserVoted(req.user.id) : false
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create poll
router.post('/', auth, async (req, res) => {
  try {
    const { question, description, options, allowMultipleVotes, endDate, tags } = req.body;

    if (!question || !options || options.length < 2) {
      return res.status(400).json({ error: 'Question and at least 2 options are required' });
    }

    const poll = new Poll({
      question,
      description,
      options: options.map(option => ({ text: option })),
      author: req.user.id,
      allowMultipleVotes: allowMultipleVotes || false,
      endDate: endDate ? new Date(endDate) : null,
      tags: tags || []
    });

    await poll.save();
    await poll.populate('author', 'username');

    res.status(201).json(poll);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Vote on poll
router.post('/:id/vote', auth, async (req, res) => {
  try {
    const { optionIndexes } = req.body;
    const poll = await Poll.findById(req.params.id);

    if (!poll) {
      return res.status(404).json({ error: 'Poll not found' });
    }

    if (!poll.isActive || poll.isExpired) {
      return res.status(400).json({ error: 'Poll is not active or has expired' });
    }

    if (poll.hasUserVoted(req.user.id)) {
      return res.status(400).json({ error: 'You have already voted on this poll' });
    }

    if (!Array.isArray(optionIndexes) || optionIndexes.length === 0) {
      return res.status(400).json({ error: 'Please select at least one option' });
    }

    if (!poll.allowMultipleVotes && optionIndexes.length > 1) {
      return res.status(400).json({ error: 'This poll only allows single votes' });
    }

    // Validate option indexes
    for (const index of optionIndexes) {
      if (index < 0 || index >= poll.options.length) {
        return res.status(400).json({ error: 'Invalid option selected' });
      }
    }

    // Add votes
    for (const index of optionIndexes) {
      poll.options[index].votes.push({
        user: req.user.id,
        votedAt: new Date()
      });
    }

    await poll.save();
    await poll.populate('author', 'username');
    await poll.populate('options.votes.user', 'username');

    const results = poll.getResults();
    const userVotes = poll.getUserVotes(req.user.id);

    res.json({
      poll,
      results,
      userVotes,
      hasVoted: true
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update poll
router.put('/:id', auth, async (req, res) => {
  try {
    const poll = await Poll.findById(req.params.id);

    if (!poll) {
      return res.status(404).json({ error: 'Poll not found' });
    }

    if (poll.author.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const { question, description, options, allowMultipleVotes, endDate, tags } = req.body;

    if (question) poll.question = question;
    if (description !== undefined) poll.description = description;
    if (options) poll.options = options.map(option => ({ text: option }));
    if (allowMultipleVotes !== undefined) poll.allowMultipleVotes = allowMultipleVotes;
    if (endDate !== undefined) poll.endDate = endDate ? new Date(endDate) : null;
    if (tags) poll.tags = tags;

    await poll.save();
    await poll.populate('author', 'username');

    res.json(poll);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete poll
router.delete('/:id', auth, async (req, res) => {
  try {
    const poll = await Poll.findById(req.params.id);

    if (!poll) {
      return res.status(404).json({ error: 'Poll not found' });
    }

    if (poll.author.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await poll.remove();
    res.json({ message: 'Poll deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user's polls
router.get('/user/me', auth, async (req, res) => {
  try {
    const polls = await Poll.find({ author: req.user.id })
      .populate('author', 'username')
      .sort({ createdAt: -1 });

    res.json(polls);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get polls by user
router.get('/user/:userId', async (req, res) => {
  try {
    const polls = await Poll.find({ 
      author: req.params.userId,
      isActive: true 
    })
      .populate('author', 'username')
      .sort({ createdAt: -1 });

    res.json(polls);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router; 
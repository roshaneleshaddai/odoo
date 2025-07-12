const mongoose = require('mongoose');

const pollOptionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
    trim: true
  },
  votes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    votedAt: {
      type: Date,
      default: Date.now
    }
  }]
});

const pollSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  options: [pollOptionSchema],
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  allowMultipleVotes: {
    type: Boolean,
    default: false
  },
  endDate: {
    type: Date
  },
  tags: [{
    type: String,
    trim: true
  }],
  totalVotes: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Virtual for checking if poll is expired
pollSchema.virtual('isExpired').get(function() {
  if (!this.endDate) return false;
  return new Date() > this.endDate;
});

// Method to get poll results
pollSchema.methods.getResults = function() {
  return this.options.map(option => ({
    text: option.text,
    votes: option.votes.length,
    percentage: this.totalVotes > 0 ? Math.round((option.votes.length / this.totalVotes) * 100) : 0
  }));
};

// Method to check if user has voted
pollSchema.methods.hasUserVoted = function(userId) {
  return this.options.some(option => 
    option.votes.some(vote => vote.user.toString() === userId.toString())
  );
};

// Method to get user's votes
pollSchema.methods.getUserVotes = function(userId) {
  const userVotes = [];
  this.options.forEach((option, index) => {
    if (option.votes.some(vote => vote.user.toString() === userId.toString())) {
      userVotes.push(index);
    }
  });
  return userVotes;
};

// Pre-save middleware to update total votes
pollSchema.pre('save', function(next) {
  this.totalVotes = this.options.reduce((total, option) => total + option.votes.length, 0);
  next();
});

module.exports = mongoose.model('Poll', pollSchema); 
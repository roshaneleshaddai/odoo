'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '../utils/api';

const PollCard = ({ poll: initialPoll, onVote }) => {
  const [poll, setPoll] = useState(initialPoll);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [isVoting, setIsVoting] = useState(false);
  const [hasVoted, setHasVoted] = useState(initialPoll.hasVoted || false);
  const [results, setResults] = useState(initialPoll.results || []);
  const [userVotes, setUserVotes] = useState(initialPoll.userVotes || []);
  const router = useRouter();

  // Fetch fresh poll data on mount and when poll ID changes
  useEffect(() => {
    fetchPollData();
  }, [initialPoll._id]);

  const fetchPollData = async () => {
    try {
      const response = await api.get(`/polls/${initialPoll._id}`);
      const freshPoll = response.data.poll;
      const freshResults = response.data.results;
      const freshUserVotes = response.data.userVotes || [];
      const freshHasVoted = response.data.hasVoted;
      
      setPoll(freshPoll);
      setResults(freshResults);
      setUserVotes(freshUserVotes);
      setHasVoted(freshHasVoted);
    } catch (error) {
      console.error('Error fetching poll data:', error);
    }
  };

  const handleOptionClick = (optionIndex) => {
    if (hasVoted || poll.isExpired) return;

    if (poll.allowMultipleVotes) {
      setSelectedOptions(prev => 
        prev.includes(optionIndex)
          ? prev.filter(i => i !== optionIndex)
          : [...prev, optionIndex]
      );
    } else {
      setSelectedOptions([optionIndex]);
    }
  };

  const handleVote = async () => {
    if (selectedOptions.length === 0) {
      alert('Please select at least one option');
      return;
    }

    setIsVoting(true);
    try {
      const response = await api.post(`/polls/${poll._id}/vote`, {
        optionIndexes: selectedOptions
      });

      // Update with fresh data from database
      setPoll(response.data.poll);
      setResults(response.data.results);
      setUserVotes(response.data.userVotes);
      setHasVoted(true);
      setSelectedOptions([]);
      
      if (onVote) {
        onVote(response.data);
      }
    } catch (error) {
      console.error('Vote error:', error);
      alert(error.response?.data?.error || 'Failed to vote');
    } finally {
      setIsVoting(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeRemaining = () => {
    if (!poll.endDate) return null;
    const now = new Date();
    const end = new Date(poll.endDate);
    const diff = end - now;
    
    if (diff <= 0) return 'Expired';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h remaining`;
    return `${hours}h remaining`;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-4">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {poll.question}
          </h3>
          {poll.description && (
            <p className="text-gray-600 mb-3">{poll.description}</p>
          )}
          <div className="flex items-center text-sm text-gray-500 space-x-4">
            <span>By {poll.author?.username || 'Unknown'}</span>
            <span>{formatDate(poll.createdAt)}</span>
            <span>{poll.totalVotes} votes</span>
            {poll.endDate && (
              <span className={`font-medium ${
                poll.isExpired ? 'text-red-600' : 'text-green-600'
              }`}>
                {getTimeRemaining()}
              </span>
            )}
          </div>
        </div>
        
        {/* Status badges */}
        <div className="flex flex-col space-y-1">
          {poll.allowMultipleVotes && (
            <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
              Multiple votes
            </span>
          )}
          {poll.isExpired && (
            <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded">
              Expired
            </span>
          )}
        </div>
      </div>

      {/* Tags */}
      {poll.tags && poll.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {poll.tags.map((tag, index) => (
            <span
              key={index}
              className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Options */}
      <div className="space-y-2 mb-4">
        {poll.options.map((option, index) => {
          const isSelected = selectedOptions.includes(index);
          const hasVotedForThis = hasVoted && userVotes.includes(index);
          const result = results.find(r => r.text === option.text);
          const percentage = result ? result.percentage : 0;
          const votes = result ? result.votes : 0;

          return (
            <div
              key={index}
              className={`relative p-3 border rounded-lg cursor-pointer transition-all ${
                hasVoted || poll.isExpired
                  ? 'cursor-default'
                  : 'hover:border-blue-300 hover:bg-blue-50'
              } ${
                isSelected
                  ? 'border-blue-500 bg-blue-50'
                  : hasVotedForThis
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200'
              }`}
              onClick={() => handleOptionClick(index)}
            >
              {/* Progress bar - always show for visual feedback */}
              <div className="absolute inset-0 bg-blue-100 rounded-lg opacity-20"
                   style={{ width: `${percentage}%` }} />
              
              <div className="relative z-10 flex justify-between items-center">
                <span className="font-medium">{option.text}</span>
                
                {/* Always show vote count and percentage */}
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">
                    {votes} votes ({percentage}%)
                  </span>
                  {hasVotedForThis && (
                    <span className="text-green-600">✓</span>
                  )}
                  {!hasVoted && !poll.isExpired && (
                    <div className={`w-4 h-4 rounded border-2 ${
                      isSelected
                        ? 'bg-blue-500 border-blue-500'
                        : 'border-gray-300'
                    }`}>
                      {isSelected && (
                        <div className="w-2 h-2 bg-white rounded-full m-0.5" />
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Action buttons */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => router.push(`/poll/${poll._id}`)}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            View Details
          </button>
          
          <button
            onClick={fetchPollData}
            className="text-gray-600 hover:text-gray-800 text-sm font-medium"
            title="Refresh poll data"
          >
            ↻ Refresh
          </button>
        </div>
        
        {!hasVoted && !poll.isExpired && (
          <button
            onClick={handleVote}
            disabled={isVoting || selectedOptions.length === 0}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isVoting ? 'Voting...' : 'Vote'}
          </button>
        )}
      </div>
    </div>
  );
};

export default PollCard; 
'use client'

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '../../../utils/api';
import Layout from '../../../components/Layout';

const PollDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const [poll, setPoll] = useState(null);
  const [results, setResults] = useState([]);
  const [userVotes, setUserVotes] = useState([]);
  const [hasVoted, setHasVoted] = useState(false);
  const [isExpired, setIsExpired] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [isVoting, setIsVoting] = useState(false);

  useEffect(() => {
    fetchPoll();
  }, [params.id]);

  const fetchPoll = async () => {
    try {
      const response = await api.get(`/polls/${params.id}`);
      setPoll(response.data.poll);
      setResults(response.data.results);
      setUserVotes(response.data.userVotes || []);
      setHasVoted(response.data.hasVoted);
      setIsExpired(response.data.isExpired);
    } catch (error) {
      console.error('Fetch poll error:', error);
      if (error.response?.status === 404) {
        router.push('/polls');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOptionClick = (optionIndex) => {
    if (hasVoted || isExpired) return;

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
      const response = await api.post(`/polls/${params.id}/vote`, {
        optionIndexes: selectedOptions
      });

      setResults(response.data.results);
      setUserVotes(response.data.userVotes);
      setHasVoted(true);
      setSelectedOptions([]);
      
      // Update poll with new data
      setPoll(response.data.poll);
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
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeRemaining = () => {
    if (!poll?.endDate) return null;
    const now = new Date();
    const end = new Date(poll.endDate);
    const diff = end - now;
    
    if (diff <= 0) return 'Expired';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h ${minutes}m remaining`;
    if (hours > 0) return `${hours}h ${minutes}m remaining`;
    return `${minutes}m remaining`;
  };

  if (loading) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto p-6">
          <div className="bg-white rounded-lg shadow-md p-6 animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-4"></div>
            <div className="h-4 bg-gray-200 rounded mb-6"></div>
            <div className="space-y-3">
              <div className="h-6 bg-gray-200 rounded"></div>
              <div className="h-6 bg-gray-200 rounded"></div>
              <div className="h-6 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!poll) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto p-6">
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Poll not found</h2>
            <button
              onClick={() => router.push('/polls')}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Back to Polls
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-3">
                {poll.question}
              </h1>
              {poll.description && (
                <p className="text-gray-600 text-lg mb-4">{poll.description}</p>
              )}
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                <span>By {poll.author?.username || 'Unknown'}</span>
                <span>Created {formatDate(poll.createdAt)}</span>
                <span>{poll.totalVotes} total votes</span>
                {poll.endDate && (
                  <span className={`font-medium ${
                    isExpired ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {getTimeRemaining()}
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex flex-col space-y-2">
              {poll.allowMultipleVotes && (
                <span className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full">
                  Multiple votes allowed
                </span>
              )}
              {isExpired && (
                <span className="px-3 py-1 text-sm bg-red-100 text-red-800 rounded-full">
                  Poll expired
                </span>
              )}
            </div>
          </div>

          {/* Tags */}
          {poll.tags && poll.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {poll.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Options */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {hasVoted || isExpired ? 'Results' : 'Vote'}
          </h2>
          
          <div className="space-y-3">
            {poll.options.map((option, index) => {
              const isSelected = selectedOptions.includes(index);
              const hasVotedForThis = userVotes.includes(index);
              const result = results.find(r => r.text === option.text);
              const percentage = result ? result.percentage : 0;
              const votes = result ? result.votes : 0;

              return (
                <div
                  key={index}
                  className={`relative p-4 border rounded-lg transition-all ${
                    hasVoted || isExpired
                      ? 'cursor-default'
                      : 'cursor-pointer hover:border-blue-300 hover:bg-blue-50'
                  } ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50'
                      : hasVotedForThis
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200'
                  }`}
                  onClick={() => handleOptionClick(index)}
                >
                  {/* Progress bar */}
                  {(hasVoted || isExpired) && (
                    <div className="absolute inset-0 bg-blue-100 rounded-lg opacity-20"
                         style={{ width: `${percentage}%` }} />
                  )}
                  
                  <div className="relative z-10 flex justify-between items-center">
                    <div className="flex-1">
                      <span className="font-medium text-lg">{option.text}</span>
                      {(hasVoted || isExpired) && (
                        <div className="mt-1 text-sm text-gray-600">
                          {votes} votes • {percentage}%
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      {(hasVoted || isExpired) && hasVotedForThis && (
                        <span className="text-green-600 text-xl">✓</span>
                      )}
                      
                      {!hasVoted && !isExpired && (
                        <div className={`w-5 h-5 rounded border-2 ${
                          isSelected
                            ? 'bg-blue-500 border-blue-500'
                            : 'border-gray-300'
                        }`}>
                          {isSelected && (
                            <div className="w-2.5 h-2.5 bg-white rounded-full m-0.5" />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Vote button */}
          {!hasVoted && !isExpired && (
            <div className="mt-6 flex justify-end">
              <button
                onClick={handleVote}
                disabled={isVoting || selectedOptions.length === 0}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-lg font-medium"
              >
                {isVoting ? 'Voting...' : 'Submit Vote'}
              </button>
            </div>
          )}

          {/* Vote status */}
          {hasVoted && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 font-medium">✓ You have voted on this poll</p>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex justify-between items-center mt-6">
          <button
            onClick={() => router.push('/polls')}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Back to Polls
          </button>
          
          <div className="flex space-x-3">
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Refresh Results
            </button>
            
            {poll.author?.username && (
              <button
                onClick={() => router.push(`/polls/user/${poll.author._id}`)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                View Author's Polls
              </button>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PollDetailPage; 
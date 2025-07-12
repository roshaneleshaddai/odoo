'use client'

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Layout from '../../../components/Layout';
import RichTextEditor from '../../../components/RichTextEditor';
import { useAuth } from '../../../context/AuthContext';
import { api } from '../../../utils/api';

export default function QuestionDetail() {
  const [question, setQuestion] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [newAnswer, setNewAnswer] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params.id;

  useEffect(() => {
    if (id) {
      fetchQuestion();
    }
  }, [id]);

  const fetchQuestion = async () => {
    try {
      const response = await api.get(`/questions/${id}`);
      setQuestion(response.data);
      setAnswers(response.data.answers);
    } catch (error) {
      console.error('Failed to fetch question:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (type, targetType, targetId) => {
    if (!user) {
      router.push('/login');
      return;
    }

    try {
      const endpoint = targetType === 'question' 
        ? `/questions/${targetId}/vote`
        : `/answers/${targetId}/vote`;
      
      await api.post(endpoint, { voteType: type });
      fetchQuestion();
    } catch (error) {
      console.error('Failed to vote:', error);
    }
  };

  const handleSubmitAnswer = async (e) => {
    e.preventDefault();
    if (!user) {
      router.push('/login');
      return;
    }

    if (!newAnswer.trim()) {
      alert('Please write an answer');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/answers', {
        content: newAnswer,
        questionId: id
      });
      setNewAnswer('');
      fetchQuestion();
    } catch (error) {
      console.error('Failed to submit answer:', error);
      alert('Failed to submit answer');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAcceptAnswer = async (answerId) => {
    try {
      await api.post(`/answers/${answerId}/accept`);
      fetchQuestion();
    } catch (error) {
      console.error('Failed to accept answer:', error);
    }
  };

  const getVoteCount = (votes) => {
    return votes.up.length - votes.down.length;
  };

  const hasUserVoted = (votes, type) => {
    if (!user) return false;
    return votes[type].includes(user.id);
  };

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-8">
          <div className="loading-spinner w-8 h-8"></div>
        </div>
      </Layout>
    );
  }

  if (!question) {
    return (
      <Layout>
        <div className="text-center py-8">
          <h1 className="text-2xl font-bold text-gray-900">Question not found</h1>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-6">
          {/* Breadcrumb */}
          <div className="mb-6">
            <nav className="text-sm text-gray-500">
              <Link href="/" className="hover:text-blue-600">Question</Link>
              <span className="mx-2">`&gt;`</span>
              <span className="text-blue-600 truncate">{question.title.slice(0, 50)}...</span>
            </nav>
          </div>

          {/* Question */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              {question.title}
            </h1>

            <div className="flex space-x-6">
              {/* Vote Section */}
              <div className="flex flex-col items-center space-y-2 flex-shrink-0">
                <button
                  onClick={() => handleVote('up', 'question', question._id)}
                  className={`vote-button ${
                    hasUserVoted(question.votes, 'up')
                      ? 'vote-button-active-up'
                      : 'text-gray-400'
                  }`}
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                  </svg>
                </button>
                
                <span className="text-xl font-semibold text-gray-700">
                  {getVoteCount(question.votes)}
                </span>
                
                <button
                  onClick={() => handleVote('down', 'question', question._id)}
                  className={`vote-button ${
                    hasUserVoted(question.votes, 'down')
                      ? 'vote-button-active-down'
                      : 'text-gray-400'
                  }`}
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>

              {/* Question Content */}
              <div className="flex-1">
                <div className="flex flex-wrap gap-2 mb-4">
                  {question.tags.map((tag) => (
                    <span key={tag} className="tag-pill">
                      {tag}
                    </span>
                  ))}
                </div>

                <div 
                  className="prose max-w-none mb-4 text-gray-700"
                  dangerouslySetInnerHTML={{ __html: question.description }}
                />

                <div className="text-sm text-gray-500">
                  Asked by <span className="font-medium">{question.author.username}</span> • {new Date(question.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>

          {/* Answers Section */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Answers
            </h2>

            {answers.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No answers yet. Be the first to answer!</p>
            ) : (
              <div className="space-y-8">
                {answers.map((answer, index) => (
                  <div key={answer._id} className="border-b border-gray-100 last:border-b-0 pb-8 last:pb-0">
                    <div className="flex space-x-6">
                      {/* Vote Section */}
                      <div className="flex flex-col items-center space-y-2 flex-shrink-0">
                        <button
                          onClick={() => handleVote('up', 'answer', answer._id)}
                          className={`vote-button ${
                            hasUserVoted(answer.votes, 'up')
                              ? 'vote-button-active-up'
                              : 'text-gray-400'
                          }`}
                        >
                          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                        
                        <span className="text-lg font-semibold text-gray-700">
                          {getVoteCount(answer.votes)}
                        </span>
                        
                        <button
                          onClick={() => handleVote('down', 'answer', answer._id)}
                          className={`vote-button ${
                            hasUserVoted(answer.votes, 'down')
                              ? 'vote-button-active-down'
                              : 'text-gray-400'
                          }`}
                        >
                          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>

                        {user && user.id === question.author._id && !answer.isAccepted && (
                          <button
                            onClick={() => handleAcceptAnswer(answer._id)}
                            className="vote-button text-green-600 hover:bg-green-100"
                            title="Accept this answer"
                          >
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </button>
                        )}
                        
                        {answer.isAccepted && (
                          <div className="vote-button text-green-600 bg-green-100" title="Accepted answer">
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </div>

                      {/* Answer Content */}
                      <div className="flex-1">
                        <div className="mb-2">
                          <strong>Answer {index + 1}</strong>
                        </div>
                        
                        <div 
                          className="prose max-w-none mb-4 text-gray-700"
                          dangerouslySetInnerHTML={{ __html: answer.content }}
                        />

                        <div className="text-sm text-gray-500">
                          Answered by <span className="font-medium">{answer.author.username}</span> • {new Date(answer.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Answer Form */}
          {user ? (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Submit Your Answer</h3>
              
              <form onSubmit={handleSubmitAnswer}>
                <div className="border border-gray-300 rounded-lg mb-4">
                  <RichTextEditor
                    value={newAnswer}
                    onChange={setNewAnswer}
                    placeholder="Write your answer here..."
                  />
                </div>
                
                <div className="flex justify-center">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="bg-blue-600 text-white px-8 py-3 rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    {submitting ? 'Submitting...' : 'Submit'}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="bg-gray-50 p-6 rounded-lg text-center border border-gray-200">
              <p className="text-gray-600 mb-4">
                If not login then not able to do vote (show a quick login/signup popup). No multiple votes allowed
              </p>
              <button
                onClick={() => router.push('/login')}
                className="bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700"
              >
                Login to Answer
              </button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
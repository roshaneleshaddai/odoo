'use client'

import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';

export default function Home() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState('newest');
  const [filterBy, setFilterBy] = useState('all');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const { user } = useAuth();

  useEffect(() => {
    fetchQuestions();
  }, [searchTerm, currentPage, sortBy, filterBy]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      params.append('page', currentPage);
      params.append('sort', sortBy);
      if (filterBy !== 'all') params.append('filter', filterBy);

      const response = await api.get(`/questions?${params}`);
      setQuestions(response.data.questions);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Failed to fetch questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAnswerCount = (question) => {
    return question.answers.length;
  };

  const FilterDropdown = ({ label, value, onChange, options }) => (
    <div className="relative">
      <select
        value={value}
        onChange={onChange}
        className="filter-dropdown dropdown-arrow appearance-none"
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );

  const sortOptions = [
    { value: 'newest', label: 'Newest' },
    { value: 'oldest', label: 'Oldest' },
    { value: 'most-voted', label: 'Most Voted' }
  ];

  const filterOptions = [
    { value: 'all', label: 'All' },
    { value: 'unanswered', label: 'Unanswered' },
    { value: 'answered', label: 'Answered' }
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        {/* Controls Section */}
        <div className="bg-white border-b border-gray-200 px-4 md:px-6 py-4">
          <div className="flex flex-col space-y-4">
            {/* Desktop Layout */}
            <div className="hidden md:flex justify-between items-center">
              {/* Left Side - Ask Question Button */}
              <Link 
                href="/ask"
                className="btn-primary"
              >
                Ask New question
              </Link>

              {/* Center - Filters */}
              <div className="flex gap-3 items-center">
                <FilterDropdown
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  options={sortOptions}
                />
                
                <FilterDropdown
                  value={filterBy}
                  onChange={(e) => setFilterBy(e.target.value)}
                  options={filterOptions}
                />

                <div className="text-gray-400 text-sm cursor-pointer hover:text-gray-600">
                  more ▼
                </div>
              </div>

              {/* Right Side - Search */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-4 pr-10 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
                />
                <div className="absolute right-3 top-2.5">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Mobile Layout */}
            <div className="md:hidden space-y-4">
              <div className="flex justify-between items-center">
                <Link 
                  href="/ask"
                  className="btn-primary text-sm px-4 py-2"
                >
                  Ask New question
                </Link>
                
                <button
                  onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
                  className="btn-secondary text-sm px-4 py-2 flex items-center space-x-2"
                >
                  <span>Filters</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>

              <div className="relative">
                <input
                  type="text"
                  placeholder="Search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="absolute right-3 top-2.5">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>

              {mobileFiltersOpen && (
                <div className="bg-gray-50 rounded-lg p-4 space-y-3 border">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sort by:</label>
                    <FilterDropdown
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      options={sortOptions}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Filter:</label>
                    <FilterDropdown
                      value={filterBy}
                      onChange={(e) => setFilterBy(e.target.value)}
                      options={filterOptions}
                    />
                  </div>
                  <div className="text-sm text-gray-500">
                    More options coming soon...
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Questions List */}
        <div className="px-4 md:px-6 py-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="loading-spinner w-8 h-8"></div>
            </div>
          ) : questions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <div className="mb-4">
                <svg className="w-16 h-16 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-lg">No questions found</p>
              <p className="text-sm">Be the first to ask!</p>
            </div>
          ) : (
            <div className="questions-grid space-y-4">
              {questions.map((question) => (
                <div key={question._id} className="question-card hover-lift">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <Link 
                        href={`/question/${question._id}`}
                        className="text-lg font-medium text-gray-900 hover:text-blue-600 mb-2 block line-clamp-2"
                      >
                        {question.title}
                      </Link>
                      
                      <div className="flex flex-wrap gap-2 mb-3">
                        {question.tags.slice(0, 3).map((tag) => (
                          <span key={tag} className="tag-pill">
                            {tag}
                          </span>
                        ))}
                        {question.tags.length > 3 && (
                          <span className="tag-pill">
                            +{question.tags.length - 3} more
                          </span>
                        )}
                      </div>

                      <div 
                        className="text-gray-600 mb-3 line-clamp-2 text-sm md:text-base"
                        dangerouslySetInnerHTML={{ 
                          __html: question.description.replace(/<[^>]*>/g, '').slice(0, 120) + '...' 
                        }}
                      />

                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <div className="avatar bg-purple-600 avatar-sm">
                            {question.author.username.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium">{question.author.username}</span>
                        </div>
                        <div className="text-xs md:text-sm">
                          {new Date(question.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    <div className="ml-4 flex-shrink-0">
                      <div className="answer-badge">
                        {getAnswerCount(question)} ans
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center mt-8 space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 rounded"
              >
                &lt;
              </button>
              
              <div className="flex space-x-1">
                {[...Array(Math.min(totalPages, 7))].map((_, index) => {
                  let pageNum;
                  if (totalPages <= 7) {
                    pageNum = index + 1;
                  } else if (currentPage <= 4) {
                    pageNum = index + 1;
                  } else if (currentPage >= totalPages - 3) {
                    pageNum = totalPages - 6 + index;
                  } else {
                    pageNum = currentPage - 3 + index;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-3 py-2 text-sm rounded ${
                        currentPage === pageNum
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 rounded"
              >
                &gt;
              </button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
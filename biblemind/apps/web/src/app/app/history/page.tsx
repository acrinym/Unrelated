'use client';

import { useEffect, useState } from 'react';
import { api, QuestionHistory } from '@/lib/api';
import { format } from 'date-fns';
import { History as HistoryIcon, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function HistoryPage() {
  const [history, setHistory] = useState<QuestionHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const response = await api.getHistory(50, 0);
      setHistory(response.questions);
    } catch (err) {
      setError('Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 text-primary-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Question History</h1>
        <p className="text-gray-600">
          Review your past questions and biblical guidance
        </p>
      </div>

      {error && (
        <div className="card bg-red-50 border-red-200 mb-8">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {history.length === 0 ? (
        <div className="card text-center py-12">
          <HistoryIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No questions yet
          </h3>
          <p className="text-gray-600 mb-6">
            Start asking biblical questions to build your history
          </p>
          <a href="/app/ask" className="btn-primary inline-block">
            Ask Your First Question
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          {history.map((item) => (
            <div key={item.id} className="card">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {item.question}
                  </h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>{format(new Date(item.timestamp), 'MMM d, yyyy • h:mm a')}</span>
                    <span>Confidence: {item.result.confidence}%</span>
                    <span>{(item.processingTimeMs / 1000).toFixed(1)}s</span>
                  </div>
                </div>
                <button
                  onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                  className="btn-secondary ml-4"
                >
                  {expandedId === item.id ? (
                    <ChevronUp className="h-5 w-5" />
                  ) : (
                    <ChevronDown className="h-5 w-5" />
                  )}
                </button>
              </div>

              {expandedId === item.id && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="markdown-content">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {item.result.synthesis}
                    </ReactMarkdown>
                  </div>

                  {item.result.scriptures && item.result.scriptures.length > 0 && (
                    <div className="mt-6">
                      <h4 className="font-semibold text-gray-900 mb-3">
                        Scripture References ({item.result.scriptures.length})
                      </h4>
                      <div className="space-y-3">
                        {item.result.scriptures.slice(0, 3).map((scripture, index) => (
                          <div key={index} className="border-l-4 border-spiritual-500 pl-4 py-2">
                            <div className="flex items-baseline justify-between mb-1">
                              <h5 className="font-medium text-gray-900">{scripture.reference}</h5>
                              <span className="text-xs text-gray-500">{scripture.translation}</span>
                            </div>
                            <p className="text-gray-700 italic text-sm">&quot;{scripture.text}&quot;</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {history.length > 0 && (
        <div className="mt-8 text-center text-sm text-gray-500">
          Showing {history.length} questions
        </div>
      )}
    </div>
  );
}

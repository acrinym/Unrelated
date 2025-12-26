'use client';

import { useState } from 'react';
import { api, BiblicalReasoning } from '@/lib/api';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Send, Loader2, BookOpen, Check, AlertCircle } from 'lucide-react';

export default function AskPage() {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BiblicalReasoning | null>(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await api.askQuestion(question);
      setResult(response.result);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to process question. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Ask a Biblical Question</h1>
        <p className="text-gray-600">
          Get multi-perspective analysis powered by 10 AI reasoning engines
        </p>
      </div>

      {/* Question Input */}
      <div className="card mb-8">
        <form onSubmit={handleSubmit}>
          <label htmlFor="question" className="block text-sm font-medium text-gray-700 mb-2">
            Your Question
          </label>
          <textarea
            id="question"
            rows={4}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="How do I forgive someone who hurt me deeply?"
            className="textarea mb-4"
            disabled={loading}
          />

          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              {question.length} characters • Be specific for best results
            </p>
            <button
              type="submit"
              disabled={loading || !question.trim()}
              className="btn-primary flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  <span>Ask Question</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Error Message */}
      {error && (
        <div className="card bg-red-50 border-red-200 mb-8">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-900">Error</h3>
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="card">
          <div className="flex flex-col items-center py-12">
            <Loader2 className="h-12 w-12 text-primary-600 animate-spin mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Analyzing your question...
            </h3>
            <p className="text-gray-600 text-center max-w-md">
              Your question is being analyzed by 10 AI engines from multiple theological perspectives. This may take 10-15 seconds.
            </p>

            <div className="mt-6 space-y-2 w-full max-w-md">
              <div className="flex items-center text-sm text-gray-600">
                <div className="w-2 h-2 bg-primary-600 rounded-full mr-2 animate-pulse"></div>
                Running safety check...
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <div className="w-2 h-2 bg-primary-600 rounded-full mr-2 animate-pulse"></div>
                Analyzing emotional/spiritual context...
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <div className="w-2 h-2 bg-primary-600 rounded-full mr-2 animate-pulse"></div>
                Exploring 7 theological perspectives...
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <div className="w-2 h-2 bg-primary-600 rounded-full mr-2 animate-pulse"></div>
                Integrating insights...
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Result */}
      {result && !loading && (
        <div className="space-y-6">
          {/* Status Badge */}
          <div className="flex items-center space-x-4">
            {result.status === 'complete' && (
              <div className="flex items-center space-x-2 bg-green-50 text-green-700 px-4 py-2 rounded-lg">
                <Check className="h-5 w-5" />
                <span className="font-medium">Analysis Complete</span>
              </div>
            )}
            <div className="text-sm text-gray-600">
              Confidence: <span className="font-semibold text-gray-900">{result.confidence}%</span>
            </div>
            <div className="text-sm text-gray-600">
              Processed in <span className="font-semibold text-gray-900">{(result.processingTimeMs / 1000).toFixed(1)}s</span>
            </div>
          </div>

          {/* Main Answer */}
          <div className="card">
            <div className="flex items-center space-x-2 mb-4 pb-4 border-b border-gray-200">
              <BookOpen className="h-5 w-5 text-primary-600" />
              <h2 className="text-xl font-bold text-gray-900">Biblical Guidance</h2>
            </div>

            <div className="markdown-content">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {result.synthesis}
              </ReactMarkdown>
            </div>
          </div>

          {/* Scripture References */}
          {result.scriptures && result.scriptures.length > 0 && (
            <div className="card">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Scripture References ({result.scriptures.length})
              </h3>
              <div className="space-y-4">
                {result.scriptures.slice(0, 5).map((scripture, index) => (
                  <div key={index} className="border-l-4 border-spiritual-500 pl-4 py-2">
                    <div className="flex items-baseline justify-between mb-1">
                      <h4 className="font-semibold text-gray-900">{scripture.reference}</h4>
                      <span className="text-xs text-gray-500">{scripture.translation}</span>
                    </div>
                    <p className="text-gray-700 italic">&quot;{scripture.text}&quot;</p>
                    {scripture.context && (
                      <p className="text-sm text-gray-600 mt-1">{scripture.context}</p>
                    )}
                  </div>
                ))}
              </div>
              {result.scriptures.length > 5 && (
                <p className="text-sm text-gray-500 mt-4">
                  + {result.scriptures.length - 5} more scripture references
                </p>
              )}
            </div>
          )}

          {/* Engine Details (Collapsible) */}
          <details className="card">
            <summary className="font-semibold text-gray-900 cursor-pointer hover:text-primary-600">
              View Detailed Engine Analysis
            </summary>
            <div className="mt-4 space-y-4">
              {result.reasoning && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <pre className="text-xs text-gray-700 overflow-x-auto">
                    {JSON.stringify(result.reasoning, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </details>

          {/* Actions */}
          <div className="flex gap-4">
            <button
              onClick={() => {
                setQuestion('');
                setResult(null);
              }}
              className="btn-primary"
            >
              Ask Another Question
            </button>
            <button
              onClick={() => {
                // Copy to clipboard
                navigator.clipboard.writeText(`Question: ${question}\n\n${result.synthesis}`);
              }}
              className="btn-secondary"
            >
              Copy Answer
            </button>
          </div>
        </div>
      )}

      {/* Example Questions */}
      {!result && !loading && (
        <div className="card bg-gray-50">
          <h3 className="font-semibold text-gray-900 mb-3">Example Questions</h3>
          <div className="space-y-2">
            {[
              'How do I forgive someone who hurt me deeply?',
              'What does the Bible say about anxiety and worry?',
              'How can I grow in my faith during difficult times?',
              'What is the biblical perspective on suffering?',
            ].map((exampleQuestion, index) => (
              <button
                key={index}
                onClick={() => setQuestion(exampleQuestion)}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-white hover:shadow-sm rounded-lg transition-all"
              >
                {exampleQuestion}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

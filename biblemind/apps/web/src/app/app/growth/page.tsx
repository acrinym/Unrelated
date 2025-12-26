'use client';

import { useEffect, useState } from 'react';
import { api, GrowthMetrics } from '@/lib/api';
import { format } from 'date-fns';
import { TrendingUp, TrendingDown, Minus, Loader2, Award, Target } from 'lucide-react';

export default function GrowthPage() {
  const [metrics, setMetrics] = useState<GrowthMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    try {
      const response = await api.getGrowth();
      setMetrics(response);
    } catch (err) {
      setError('Failed to load growth metrics');
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

  if (!metrics) {
    return null;
  }

  const getTrajectoryIcon = () => {
    switch (metrics.trajectory.trajectory) {
      case 'growing':
        return <TrendingUp className="h-8 w-8 text-green-600" />;
      case 'plateaued':
        return <Minus className="h-8 w-8 text-yellow-600" />;
      case 'declining':
        return <TrendingDown className="h-8 w-8 text-red-600" />;
      default:
        return <Target className="h-8 w-8 text-gray-600" />;
    }
  };

  const getTrajectoryColor = () => {
    switch (metrics.trajectory.trajectory) {
      case 'growing':
        return 'text-green-700 bg-green-50 border-green-200';
      case 'plateaued':
        return 'text-yellow-700 bg-yellow-50 border-yellow-200';
      case 'declining':
        return 'text-red-700 bg-red-50 border-red-200';
      default:
        return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  const getMaturityLevel = (score: number) => {
    if (score >= 8) return { label: 'Excellent', color: 'text-green-700' };
    if (score >= 6) return { label: 'Good', color: 'text-blue-700' };
    if (score >= 4) return { label: 'Fair', color: 'text-yellow-700' };
    return { label: 'Growing', color: 'text-gray-700' };
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Spiritual Growth</h1>
        <p className="text-gray-600">
          Track your discipleship journey and spiritual maturity
        </p>
      </div>

      {error && (
        <div className="card bg-red-50 border-red-200 mb-8">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {metrics.questionCount === 0 ? (
        <div className="card text-center py-12">
          <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Start Your Growth Journey
          </h3>
          <p className="text-gray-600 mb-6">
            Ask at least 5 questions to see your spiritual growth metrics
          </p>
          <a href="/app/ask" className="btn-primary inline-block">
            Ask a Question
          </a>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Overview */}
          <div className="grid grid-cols-3 gap-4">
            <div className="card">
              <div className="text-sm text-gray-600 mb-1">Total Questions</div>
              <div className="text-3xl font-bold text-gray-900">{metrics.questionCount}</div>
            </div>
            <div className="card">
              <div className="text-sm text-gray-600 mb-1">First Question</div>
              <div className="text-lg font-semibold text-gray-900">
                {metrics.firstQuestion ? format(new Date(metrics.firstQuestion), 'MMM d, yyyy') : 'N/A'}
              </div>
            </div>
            <div className="card">
              <div className="text-sm text-gray-600 mb-1">Last Question</div>
              <div className="text-lg font-semibold text-gray-900">
                {metrics.lastQuestion ? format(new Date(metrics.lastQuestion), 'MMM d, yyyy') : 'N/A'}
              </div>
            </div>
          </div>

          {/* Trajectory */}
          <div className={`card border ${getTrajectoryColor()}`}>
            <div className="flex items-center space-x-4 mb-4">
              {getTrajectoryIcon()}
              <div>
                <h2 className="text-2xl font-bold capitalize">{metrics.trajectory.trajectory}</h2>
                <p className="text-sm">Growth Trajectory</p>
              </div>
            </div>
            <div className="space-y-2">
              {metrics.trajectory.insights.map((insight, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <span className="text-xs mt-1">•</span>
                  <p className="text-sm">{insight}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Maturity Indicators */}
          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Maturity Indicators</h2>

            {/* Self-Focus Ratio */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-900">Self-Focus Ratio</span>
                <span className={`font-semibold ${
                  metrics.maturity.selfFocusRatio < 0.4 ? 'text-green-700' :
                  metrics.maturity.selfFocusRatio < 0.6 ? 'text-yellow-700' :
                  'text-red-700'
                }`}>
                  {(metrics.maturity.selfFocusRatio * 100).toFixed(0)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    metrics.maturity.selfFocusRatio < 0.4 ? 'bg-green-600' :
                    metrics.maturity.selfFocusRatio < 0.6 ? 'bg-yellow-600' :
                    'bg-red-600'
                  }`}
                  style={{ width: `${metrics.maturity.selfFocusRatio * 100}%` }}
                />
              </div>
              <p className="text-xs text-gray-600 mt-1">
                Lower is better • Measures how often questions focus on self vs. others/God
              </p>
            </div>

            {/* Question Depth */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-900">Question Depth</span>
                <span className={`font-semibold ${getMaturityLevel(metrics.maturity.questionDepth).color}`}>
                  {metrics.maturity.questionDepth.toFixed(1)}/10
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-primary-600 h-2 rounded-full"
                  style={{ width: `${(metrics.maturity.questionDepth / 10) * 100}%` }}
                />
              </div>
              <p className="text-xs text-gray-600 mt-1">
                {getMaturityLevel(metrics.maturity.questionDepth).label} • Measures thoughtfulness and theological depth
              </p>
            </div>

            {/* Faith Language */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-900">Faith Language</span>
                <span className={`font-semibold ${getMaturityLevel(metrics.maturity.faithLanguage).color}`}>
                  {metrics.maturity.faithLanguage.toFixed(1)}/10
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-spiritual-600 h-2 rounded-full"
                  style={{ width: `${(metrics.maturity.faithLanguage / 10) * 100}%` }}
                />
              </div>
              <p className="text-xs text-gray-600 mt-1">
                {getMaturityLevel(metrics.maturity.faithLanguage).label} • Measures use of biblical/theological language
              </p>
            </div>
          </div>

          {/* Growth Tips */}
          <div className="card bg-primary-50 border-primary-200">
            <h3 className="font-semibold text-primary-900 mb-3">Tips for Growth</h3>
            <ul className="space-y-2 text-sm text-primary-800">
              <li className="flex items-start">
                <span className="mr-2">📖</span>
                <span>Ask questions that explore Scripture deeply, not just surface-level answers</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">🙏</span>
                <span>Focus on how you can serve others and glorify God</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">💡</span>
                <span>Engage with biblical concepts and theological terminology</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">❤️</span>
                <span>Ask questions that reflect spiritual disciplines and character growth</span>
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

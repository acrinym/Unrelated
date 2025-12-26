'use client';

import { useEffect, useState } from 'react';
import { api, UserProfile } from '@/lib/api';
import { Save, Loader2, Check } from 'lucide-react';

export default function SettingsPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const [denomination, setDenomination] = useState('');
  const [theologicalLean, setTheologicalLean] = useState('');
  const [preferredTranslation, setPreferredTranslation] = useState('ESV');
  const [showHebrewGreek, setShowHebrewGreek] = useState(true);
  const [enableCrossReferences, setEnableCrossReferences] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await api.getProfile();
      const p = response.profile;
      setProfile(p);
      setDenomination(p.denomination || '');
      setTheologicalLean(p.theologicalLean || '');
      setPreferredTranslation(p.preferences?.preferredTranslation || 'ESV');
      setShowHebrewGreek(p.preferences?.showHebrewGreek !== false);
      setEnableCrossReferences(p.preferences?.enableCrossReferences !== false);
    } catch (err) {
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    setError('');

    try {
      await api.updateProfile({
        denomination,
        theologicalLean,
        preferences: {
          preferredTranslation,
          showHebrewGreek,
          enableCrossReferences,
        },
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError('Failed to save settings');
    } finally {
      setSaving(false);
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
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
        <p className="text-gray-600">
          Personalize your BibleMind experience
        </p>
      </div>

      {error && (
        <div className="card bg-red-50 border-red-200 mb-8">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {saved && (
        <div className="card bg-green-50 border-green-200 mb-8">
          <div className="flex items-center space-x-2 text-green-700">
            <Check className="h-5 w-5" />
            <span>Settings saved successfully!</span>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {/* Account Info */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Account</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={profile?.email || ''}
                disabled
                className="input bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Plan
              </label>
              <div className="flex items-center justify-between">
                <span className="text-gray-900">
                  {profile?.isPremium ? 'Premium' : 'Free Tier'}
                </span>
                {!profile?.isPremium && (
                  <button className="btn-primary text-sm">
                    Upgrade to Premium
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Theological Preferences */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Theological Preferences</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="denomination" className="block text-sm font-medium text-gray-700 mb-1">
                Denomination (Optional)
              </label>
              <select
                id="denomination"
                value={denomination}
                onChange={(e) => setDenomination(e.target.value)}
                className="input"
              >
                <option value="">Not specified</option>
                <option value="protestant">Protestant</option>
                <option value="catholic">Catholic</option>
                <option value="orthodox">Eastern Orthodox</option>
                <option value="baptist">Baptist</option>
                <option value="methodist">Methodist</option>
                <option value="pentecostal">Pentecostal</option>
                <option value="presbyterian">Presbyterian</option>
                <option value="messianic">Messianic</option>
                <option value="other">Other</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Helps tailor responses to your tradition
              </p>
            </div>

            <div>
              <label htmlFor="theological-lean" className="block text-sm font-medium text-gray-700 mb-1">
                Theological Lean (Optional)
              </label>
              <select
                id="theological-lean"
                value={theologicalLean}
                onChange={(e) => setTheologicalLean(e.target.value)}
                className="input"
              >
                <option value="">Not specified</option>
                <option value="reformed">Reformed</option>
                <option value="arminian">Arminian</option>
                <option value="charismatic">Charismatic</option>
                <option value="traditional">Traditional</option>
                <option value="progressive">Progressive</option>
                <option value="conservative">Conservative</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Further personalizes theological perspectives
              </p>
            </div>
          </div>
        </div>

        {/* Bible Reading Preferences */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Bible Reading Preferences</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="translation" className="block text-sm font-medium text-gray-700 mb-1">
                Preferred Translation
              </label>
              <select
                id="translation"
                value={preferredTranslation}
                onChange={(e) => setPreferredTranslation(e.target.value)}
                className="input"
              >
                <option value="ESV">ESV (English Standard Version)</option>
                <option value="NIV">NIV (New International Version)</option>
                <option value="KJV">KJV (King James Version)</option>
                <option value="NKJV">NKJV (New King James Version)</option>
                <option value="NASB">NASB (New American Standard Bible)</option>
                <option value="NLT">NLT (New Living Translation)</option>
              </select>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="hebrew-greek"
                checked={showHebrewGreek}
                onChange={(e) => setShowHebrewGreek(e.target.checked)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="hebrew-greek" className="ml-2 block text-sm text-gray-900">
                Show Hebrew/Greek original languages
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="cross-references"
                checked={enableCrossReferences}
                onChange={(e) => setEnableCrossReferences(e.target.checked)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="cross-references" className="ml-2 block text-sm text-gray-900">
                Enable cross-references in answers
              </label>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary flex items-center space-x-2"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>Save Settings</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

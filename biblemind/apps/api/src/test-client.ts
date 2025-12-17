/**
 * TEST CLIENT FOR BIBLEMIND API
 *
 * This script demonstrates how to interact with the BibleMind API
 * from a client application.
 *
 * Usage:
 * 1. Start the API server: npm run dev
 * 2. Set FIREBASE_ID_TOKEN environment variable
 * 3. Run: npx tsx src/test-client.ts
 */

import axios from 'axios';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';
const FIREBASE_ID_TOKEN = process.env.FIREBASE_ID_TOKEN || '';

if (!FIREBASE_ID_TOKEN) {
  console.error('❌ FIREBASE_ID_TOKEN environment variable is required');
  console.error('\nTo get a Firebase ID token:');
  console.error('1. Sign in to your Firebase app');
  console.error('2. Call: await user.getIdToken()');
  console.error('3. Set: export FIREBASE_ID_TOKEN="<token>"');
  process.exit(1);
}

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Authorization': `Bearer ${FIREBASE_ID_TOKEN}`,
    'Content-Type': 'application/json'
  }
});

async function testHealthCheck() {
  console.log('\n📋 Testing health check...');
  try {
    const response = await axios.get(`${API_BASE_URL}/health`);
    console.log('✅ Health check passed:', response.data);
  } catch (error) {
    console.error('❌ Health check failed:', error);
  }
}

async function testAskQuestion() {
  console.log('\n📖 Testing biblical question...');
  try {
    const response = await client.post('/api/v1/ask', {
      question: 'How do I forgive someone who hurt me deeply?',
      userContext: {
        denomination: 'protestant',
        theologicalLean: 'reformed',
        preferences: {
          showHebrewGreek: true,
          enableCrossReferences: true,
          preferredTranslation: 'ESV'
        }
      }
    });

    console.log('✅ Question processed successfully');
    console.log(`   Status: ${response.data.result.status}`);
    console.log(`   Confidence: ${response.data.result.confidence}%`);
    console.log(`   Processing time: ${response.data.result.processingTimeMs}ms`);
    console.log(`   Scriptures cited: ${response.data.result.scriptures.length}`);
    console.log('\n📖 Synthesis (first 500 chars):');
    console.log(response.data.result.synthesis.substring(0, 500) + '...');
  } catch (error: any) {
    console.error('❌ Question failed:', error.response?.data || error.message);
  }
}

async function testGetHistory() {
  console.log('\n📚 Testing question history...');
  try {
    const response = await client.get('/api/v1/history?limit=5');
    console.log('✅ History retrieved successfully');
    console.log(`   Questions found: ${response.data.count}`);
    console.log(`   Has more: ${response.data.hasMore}`);

    if (response.data.questions.length > 0) {
      console.log('\n   Recent questions:');
      response.data.questions.slice(0, 3).forEach((q: any, i: number) => {
        console.log(`   ${i + 1}. ${q.question.substring(0, 60)}...`);
      });
    }
  } catch (error: any) {
    console.error('❌ History failed:', error.response?.data || error.message);
  }
}

async function testGetGrowthMetrics() {
  console.log('\n📈 Testing growth metrics...');
  try {
    const response = await client.get('/api/v1/growth');
    console.log('✅ Growth metrics retrieved successfully');
    console.log(`   Trajectory: ${response.data.trajectory.trajectory}`);
    console.log(`   Question count: ${response.data.questionCount}`);
    console.log(`   Self-focus ratio: ${response.data.maturity.selfFocusRatio.toFixed(2)}`);
    console.log(`   Question depth: ${response.data.maturity.questionDepth.toFixed(1)}/10`);
    console.log(`   Faith language: ${response.data.maturity.faithLanguage.toFixed(1)}/10`);

    if (response.data.trajectory.insights.length > 0) {
      console.log('\n   Insights:');
      response.data.trajectory.insights.forEach((insight: string) => {
        console.log(`   - ${insight}`);
      });
    }
  } catch (error: any) {
    console.error('❌ Growth metrics failed:', error.response?.data || error.message);
  }
}

async function testGetProfile() {
  console.log('\n👤 Testing user profile...');
  try {
    const response = await client.get('/api/v1/user/profile');
    console.log('✅ Profile retrieved successfully');
    console.log(`   Email: ${response.data.profile.email}`);
    console.log(`   Premium: ${response.data.profile.isPremium}`);
    console.log(`   Denomination: ${response.data.profile.denomination || 'Not set'}`);
    console.log(`   Theological lean: ${response.data.profile.theologicalLean || 'Not set'}`);
  } catch (error: any) {
    console.error('❌ Profile failed:', error.response?.data || error.message);
  }
}

async function testUpdateProfile() {
  console.log('\n✏️  Testing profile update...');
  try {
    const response = await client.put('/api/v1/user/profile', {
      denomination: 'reformed baptist',
      preferences: {
        showHebrewGreek: true,
        enableCrossReferences: true,
        preferredTranslation: 'ESV'
      }
    });
    console.log('✅ Profile updated successfully');
  } catch (error: any) {
    console.error('❌ Profile update failed:', error.response?.data || error.message);
  }
}

async function testRateLimiting() {
  console.log('\n⏱️  Testing rate limiting (free tier)...');
  console.log('   Note: This test will make 11 requests to trigger rate limit');
  console.log('   Skip this test if you have a premium account or want to preserve quota');

  // Uncomment to run:
  // for (let i = 1; i <= 11; i++) {
  //   try {
  //     await client.post('/api/v1/ask', {
  //       question: `Test question ${i} - What is love?`
  //     });
  //     console.log(`   ✅ Request ${i} succeeded`);
  //   } catch (error: any) {
  //     if (error.response?.status === 429) {
  //       console.log(`   ⛔ Request ${i} rate limited (expected)`);
  //       break;
  //     } else {
  //       console.error(`   ❌ Request ${i} failed:`, error.response?.data || error.message);
  //     }
  //   }
  //   // Small delay between requests
  //   await new Promise(resolve => setTimeout(resolve, 500));
  // }

  console.log('   (Skipped - uncomment code to test)');
}

async function runAllTests() {
  console.log('🕊️  BibleMind API Test Client\n');
  console.log('='.repeat(60));

  await testHealthCheck();
  await testGetProfile();
  await testAskQuestion();
  await testGetHistory();
  await testGetGrowthMetrics();
  await testUpdateProfile();
  await testRateLimiting();

  console.log('\n' + '='.repeat(60));
  console.log('\n✅ All tests completed!\n');
}

// Run tests
runAllTests().catch(error => {
  console.error('\n❌ Test suite failed:', error);
  process.exit(1);
});

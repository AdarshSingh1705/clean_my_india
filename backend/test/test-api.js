const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

// Update this to your deployed backend URL or local
const BASE_URL = process.env.API_URL || 'http://localhost:5000';

// Test data
const testUser = {
  name: 'Test User',
  email: `test${Date.now()}@example.com`,
  password: 'Test@123',
  role: 'citizen'
};

let authToken = '';
let createdIssueId = '';

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Test 1: Register User
async function testRegister() {
  log('\n========== TEST 1: REGISTER USER ==========', 'blue');
  try {
    const response = await axios.post(`${BASE_URL}/api/auth/register`, testUser);
    
    if (response.status === 201 && response.data.token) {
      authToken = response.data.token;
      log('✓ Registration successful', 'green');
      log(`  User ID: ${response.data.user.id}`);
      log(`  Email: ${response.data.user.email}`);
      log(`  Token received: ${authToken.substring(0, 20)}...`);
      return true;
    } else {
      log('✗ Registration failed - Invalid response', 'red');
      return false;
    }
  } catch (error) {
    log('✗ Registration failed', 'red');
    if (error.response) {
      log(`  Status: ${error.response.status}`, 'red');
      log(`  Message: ${error.response.data.message || error.message}`, 'red');
    } else {
      log(`  Error: ${error.message}`, 'red');
    }
    return false;
  }
}

// Test 2: Login User
async function testLogin() {
  log('\n========== TEST 2: LOGIN USER ==========', 'blue');
  try {
    const response = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: testUser.email,
      password: testUser.password
    });
    
    if (response.status === 200 && response.data.token) {
      authToken = response.data.token;
      log('✓ Login successful', 'green');
      log(`  User: ${response.data.user.name}`);
      log(`  Role: ${response.data.user.role}`);
      log(`  Token received: ${authToken.substring(0, 20)}...`);
      return true;
    } else {
      log('✗ Login failed - Invalid response', 'red');
      return false;
    }
  } catch (error) {
    log('✗ Login failed', 'red');
    if (error.response) {
      log(`  Status: ${error.response.status}`, 'red');
      log(`  Message: ${error.response.data.message || error.message}`, 'red');
    } else {
      log(`  Error: ${error.message}`, 'red');
    }
    return false;
  }
}

// Test 3: Get Current User
async function testGetMe() {
  log('\n========== TEST 3: GET CURRENT USER ==========', 'blue');
  try {
    const response = await axios.get(`${BASE_URL}/api/auth/me`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    if (response.status === 200) {
      log('✓ Get current user successful', 'green');
      log(`  Name: ${response.data.name}`);
      log(`  Email: ${response.data.email}`);
      log(`  Role: ${response.data.role}`);
      return true;
    } else {
      log('✗ Get current user failed', 'red');
      return false;
    }
  } catch (error) {
    log('✗ Get current user failed', 'red');
    if (error.response) {
      log(`  Status: ${error.response.status}`, 'red');
      log(`  Message: ${error.response.data.message || error.message}`, 'red');
    } else {
      log(`  Error: ${error.message}`, 'red');
    }
    return false;
  }
}

// Test 4: Report Issue (without image)
async function testReportIssue() {
  log('\n========== TEST 4: REPORT ISSUE ==========', 'blue');
  try {
    const issueData = {
      title: 'Test Issue - Pothole on Main Street',
      description: 'Large pothole causing traffic issues',
      category: 'pothole',
      latitude: 28.6139,
      longitude: 77.2090,
      priority: 'high'
    };

    const response = await axios.post(`${BASE_URL}/api/issues`, issueData, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.status === 201 && response.data.issue) {
      createdIssueId = response.data.issue.id;
      log('✓ Issue reported successfully', 'green');
      log(`  Issue ID: ${response.data.issue.id}`);
      log(`  Title: ${response.data.issue.title}`);
      log(`  Status: ${response.data.issue.status}`);
      log(`  Priority: ${response.data.issue.priority}`);
      return true;
    } else {
      log('✗ Report issue failed - Invalid response', 'red');
      return false;
    }
  } catch (error) {
    log('✗ Report issue failed', 'red');
    if (error.response) {
      log(`  Status: ${error.response.status}`, 'red');
      log(`  Message: ${error.response.data.message || error.message}`, 'red');
      log(`  Data: ${JSON.stringify(error.response.data)}`, 'red');
    } else {
      log(`  Error: ${error.message}`, 'red');
    }
    return false;
  }
}

// Test 5: Get All Issues
async function testGetAllIssues() {
  log('\n========== TEST 5: GET ALL ISSUES ==========', 'blue');
  try {
    const response = await axios.get(`${BASE_URL}/api/issues`);
    
    if (response.status === 200) {
      log('✓ Get all issues successful', 'green');
      log(`  Total issues: ${response.data.total}`);
      log(`  Issues on page: ${response.data.issues.length}`);
      return true;
    } else {
      log('✗ Get all issues failed', 'red');
      return false;
    }
  } catch (error) {
    log('✗ Get all issues failed', 'red');
    if (error.response) {
      log(`  Status: ${error.response.status}`, 'red');
      log(`  Message: ${error.response.data.message || error.message}`, 'red');
    } else {
      log(`  Error: ${error.message}`, 'red');
    }
    return false;
  }
}

// Test 6: Get Single Issue
async function testGetSingleIssue() {
  log('\n========== TEST 6: GET SINGLE ISSUE ==========', 'blue');
  
  if (!createdIssueId) {
    log('⚠ Skipping - No issue ID available', 'yellow');
    return false;
  }

  try {
    const response = await axios.get(`${BASE_URL}/api/issues/${createdIssueId}`);
    
    if (response.status === 200) {
      log('✓ Get single issue successful', 'green');
      log(`  Title: ${response.data.title}`);
      log(`  Status: ${response.data.status}`);
      log(`  Comments: ${response.data.comments.length}`);
      log(`  Likes: ${response.data.like_count}`);
      return true;
    } else {
      log('✗ Get single issue failed', 'red');
      return false;
    }
  } catch (error) {
    log('✗ Get single issue failed', 'red');
    if (error.response) {
      log(`  Status: ${error.response.status}`, 'red');
      log(`  Message: ${error.response.data.message || error.message}`, 'red');
    } else {
      log(`  Error: ${error.message}`, 'red');
    }
    return false;
  }
}

// Test 7: Health Check
async function testHealthCheck() {
  log('\n========== TEST 7: HEALTH CHECK ==========', 'blue');
  try {
    const response = await axios.get(`${BASE_URL}/api/health`);
    
    if (response.status === 200) {
      log('✓ Health check successful', 'green');
      log(`  Status: ${response.data.status}`);
      log(`  Message: ${response.data.message}`);
      return true;
    } else {
      log('✗ Health check failed', 'red');
      return false;
    }
  } catch (error) {
    log('✗ Health check failed', 'red');
    if (error.response) {
      log(`  Status: ${error.response.status}`, 'red');
      log(`  Message: ${error.response.data.message || error.message}`, 'red');
    } else {
      log(`  Error: ${error.message}`, 'red');
    }
    return false;
  }
}

// Run all tests
async function runAllTests() {
  log('\n╔════════════════════════════════════════════╗', 'blue');
  log('║   CLEAN MY INDIA - API TESTING SUITE      ║', 'blue');
  log('╚════════════════════════════════════════════╝', 'blue');
  log(`\nTesting API at: ${BASE_URL}\n`, 'yellow');

  const results = {
    passed: 0,
    failed: 0,
    total: 0
  };

  // Test 0: Health Check (first)
  results.total++;
  if (await testHealthCheck()) results.passed++;
  else results.failed++;

  // Test 1: Register
  results.total++;
  if (await testRegister()) results.passed++;
  else results.failed++;

  // Test 2: Login
  results.total++;
  if (await testLogin()) results.passed++;
  else results.failed++;

  // Test 3: Get Me
  results.total++;
  if (await testGetMe()) results.passed++;
  else results.failed++;

  // Test 4: Report Issue
  results.total++;
  if (await testReportIssue()) results.passed++;
  else results.failed++;

  // Test 5: Get All Issues
  results.total++;
  if (await testGetAllIssues()) results.passed++;
  else results.failed++;

  // Test 6: Get Single Issue
  results.total++;
  if (await testGetSingleIssue()) results.passed++;
  else results.failed++;

  // Summary
  log('\n╔════════════════════════════════════════════╗', 'blue');
  log('║           TEST SUMMARY                     ║', 'blue');
  log('╚════════════════════════════════════════════╝', 'blue');
  log(`\nTotal Tests: ${results.total}`);
  log(`Passed: ${results.passed}`, 'green');
  log(`Failed: ${results.failed}`, results.failed > 0 ? 'red' : 'green');
  log(`Success Rate: ${((results.passed / results.total) * 100).toFixed(2)}%\n`, 
      results.failed === 0 ? 'green' : 'yellow');

  if (results.failed > 0) {
    log('⚠ Some tests failed. Check the logs above for details.', 'yellow');
  } else {
    log('✓ All tests passed successfully!', 'green');
  }
}

// Run tests
runAllTests().catch(error => {
  log('\n✗ Test suite failed with error:', 'red');
  log(error.message, 'red');
  process.exit(1);
});

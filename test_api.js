import fetch from 'node-fetch';

// Test the API endpoints
async function testAPI() {
    const baseURL = 'http://localhost:4000/api';
    
    console.log('Testing API endpoints...\n');
    
    // Test 1: Try to access simulator-topic-data without authentication
    console.log('=== Test 1: Access simulator-topic-data without auth ===');
    try {
        const response = await fetch(`${baseURL}/simulator-topic-data?simulator_id=3`);
        const data = await response.json();
        console.log('Status:', response.status);
        console.log('Response:', data);
    } catch (error) {
        console.log('Error:', error.message);
    }
    
    console.log('\n=== Test 2: Access simulator-topic-data for ID 3 (no data) ===');
    // For this test, you would need a valid token
    // This will show the authentication error
    
    console.log('\n=== Test 3: Check simulators with data ===');
    try {
        const response = await fetch(`${baseURL}/simulators-with-data`);
        const data = await response.json();
        console.log('Status:', response.status);
        console.log('Response:', data);
    } catch (error) {
        console.log('Error:', error.message);
    }
    
    console.log('\n=== Test 4: Test server health ===');
    try {
        const response = await fetch(`${baseURL}/test`);
        const data = await response.json();
        console.log('Status:', response.status);
        console.log('Response:', data);
    } catch (error) {
        console.log('Error:', error.message);
    }
}

testAPI();
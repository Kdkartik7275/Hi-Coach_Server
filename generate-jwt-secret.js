#!/usr/bin/env node

/**
 * Generate a secure JWT secret
 * Usage: node generate-jwt-secret.js
 */

const crypto = require('crypto');

const secret = crypto.randomBytes(32).toString('hex');

console.log('\n===========================================');
console.log('Generated JWT Secret:');
console.log('===========================================');
console.log(secret);
console.log('===========================================');
console.log('\nAdd this to your .env file:');
console.log(`JWT_SECRET=${secret}`);
console.log('===========================================\n');

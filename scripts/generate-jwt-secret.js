#!/usr/bin/env node

/**
 * Utility script to generate a secure JWT secret
 * Usage: node scripts/generate-jwt-secret.js
 */

import crypto from 'crypto';

const generateJWTSecret = () => {
    const secret = crypto.randomBytes(64).toString('hex');
    console.log('🔐 Generated JWT Secret:');
    console.log(secret);
    console.log('\n💡 Add this to your .env file:');
    console.log(`JWT_SECRET=${secret}`);
    console.log('\n⚠️  Keep this secret secure and never commit it to version control!');
};

generateJWTSecret();

import { default as handler } from './api/chat.js';

const req = {
  method: 'POST',
  body: {
    prompt: "Hello, how are you?",
  }
};

const res = {
  status: function(code) {
    this.code = code;
    return this;
  },
  json: function(data) {
    console.log(`Status: ${this.code}`);
    console.log(`Data:`, data);
  }
};

// Set env vars
process.env.SMART_BHARAT_GROQ_API_KEY = "gsk_dummy"; // We expect a 401 error from Groq if key is invalid, but at least we can see the exact error.
process.env.SMART_BHARAT_AI_PROVIDER = "groq";

handler(req, res).catch(console.error);

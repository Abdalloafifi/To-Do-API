const rateLimitMap = new Map();
const MAX_REQUESTS_PER_MIN = 30;
const CLEANUP_INTERVAL = 60 * 60 * 1000; // ساعة واحدة

// تنظيف السجلات القديمة تلقائياً
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of rateLimitMap.entries()) {
    if (now - record.lastTime > 60000) {
      rateLimitMap.delete(ip);
    }
  }
}, CLEANUP_INTERVAL);

function withSecurity(handler, options = {}) {
  return async (call, callback) => {
    const ip = call.getPeer().split(':')[0]; // تحسين استخراج الـ IP
    const now = Date.now();

    // Rate limiting
    const record = rateLimitMap.get(ip) || { count: 0, lastTime: now };
    
    if (now - record.lastTime < 60000) {
      if (record.count >= (options.maxRequestsPerMin || MAX_REQUESTS_PER_MIN)) {
        return callback({
          code: 8, // RESOURCE_EXHAUSTED
          message: 'Too many requests. Please slow down.'
        });
      }
      record.count++;
    } else {
      record.count = 1;
      record.lastTime = now;
    }
    rateLimitMap.set(ip, record);

    // استدعاء الـ handler الأصلي بعد اجتياز الفحص
    try {
      return await handler(call, callback);
    } catch (err) {
      console.error('Security middleware error:', err);
      callback({
        code: 13, // INTERNAL
        message: 'Internal server error'
      });
    }
  };
}

module.exports = {
    withSecurity,
};
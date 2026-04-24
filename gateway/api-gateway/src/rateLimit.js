'use strict';

const rateLimit   = require('express-rate-limit');
const RedisStore  = require('rate-limit-redis').default || require('rate-limit-redis');
const Redis       = require('ioredis');
const config      = require('./config');
const logger      = require('./logger');

function build() {
  let store;
  if (config.redis.url) {
    try {
      const client = new Redis(config.redis.url, {
        lazyConnect:        false,
        maxRetriesPerRequest: 1,
      });
      client.on('error', (e) => logger.warn('redis error', { err: e.message }));
      store = new RedisStore({ sendCommand: (...args) => client.call(...args) });
      logger.info('rate limiter: redis-backed');
    } catch (e) {
      logger.warn('falling back to in-memory rate limiter', { err: e.message });
    }
  } else {
    logger.info('rate limiter: in-memory (set REDIS_URL for distributed)');
  }

  return rateLimit({
    windowMs:        config.rateLimit.windowMs,
    max:             config.rateLimit.max,
    standardHeaders: true,
    legacyHeaders:   false,
    store,
    keyGenerator: (req) => req.gwUser ? `u:${req.gwUser.id}` : `ip:${req.ip}`,
  });
}

module.exports = build;

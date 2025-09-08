'use strict';
const { MongoClient } = require('mongodb');
const config = require('./config');

let _client, _db;

// DB-Namen aus URL/ENV ziehen, Query abschneiden
function dbNameFrom(url, fallback) {
  const env = (process.env.MONGO_DATABASE || '').split('?')[0];
  if (env) return env;
  const m = url && url.match(/mongodb(?:\+srv)?:\/\/[^/]+\/([^?]+)/i);
  return (m && m[1]) ? decodeURIComponent(m[1]) : (fallback || 'pacman');
}
const DB_NAME = dbNameFrom(config.database.url, 'pacman');

function Database() {
  this.connect = function (app, cb) {
    if (_db) return cb(null, _db);
    MongoClient.connect(config.database.url, config.database.options, (err, client) => {
      if (err) return cb(err);
      _client = client;
      _db = client.db(DB_NAME);     // ← echtes Db-Objekt
      if (app) app.locals.db = _db;
      console.log('Connected to database server successfully');
      cb(null, _db);
    });
  };
  this.getDb = function (app, cb) {
    if (_db) return cb(null, _db);
    this.connect(app, cb);
  };
}
module.exports = exports = new Database();


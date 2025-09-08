'use strict';

const { MongoClient } = require('mongodb');
const config = require('./config');

let _client;
let _db;

function dbNameFrom(url, fallback) {
  // mongodb://.../<name>?...
  const m = url && url.match(/mongodb(?:\+srv)?:\/\/[^/]+\/([^?]+)/i);
  const fromUrl = m && m[1] ? decodeURIComponent(m[1]) : null;
  // MONGO_DATABASE kann "pacman?authSource=admin..." enthalten -> nur vor '?'
  const fromEnv = process.env.MONGO_DATABASE
    ? process.env.MONGO_DATABASE.split('?')[0]
    : null;
  return fromEnv || fromUrl || fallback || 'pacman';
}

const DB_NAME = dbNameFrom(config.database.url, 'pacman');

function Database() {
  this.connect = function (app, callback) {
    if (_db) return callback(null, _db);
    MongoClient.connect(config.database.url, config.database.options, function (err, client) {
      if (err) {
        console.log(err);
        console.log(config.database.url);
        console.log(config.database.options);
        return callback(err);
      }
      _client = client;
      _db = client.db(DB_NAME);          // <<< echtes Db-Objekt
      if (app) app.locals.db = _db;
      console.log('Connected to database server successfully');
      callback(null, _db);
    });
  };

  this.getDb = function (app, callback) {
    if (_db) return callback(null, _db);
    this.connect(app, callback);
  };
}

module.exports = exports = new Database(); // Singleton


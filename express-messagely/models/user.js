/** User class for message.ly */
const db = require("../db");
const ExpressError = require("../expressError");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { BCRYPT_WORK_FACTOR, SECRET_KEY } = require("../config");

/** User of the site. */

class User {
  /** register new user -- returns
   *    {username, password, first_name, last_name, phone}
   */

  static async register(
    username,
    hashedPassword,
    first_name,
    last_name,
    phone
  ) {
    const results = await db.query(
      `INSERT INTO users (username,password,first_name,last_name,phone,join_at, last_login_at) VALUES ($1,$2,$3,$4,$5,current_timestamp, current_timestamp) RETURNING username, first_name, last_name, phone`,
      [username, hashedPassword, first_name, last_name, phone]
    );
    return results.rows[0];
  }

  /** Authenticate: is this username/password valid? Returns boolean. */

  static async authenticate(username, password) {
    const results = await db.query(
      `SELECT username, password 
       FROM users
       WHERE username = $1`,
      [username]
    );
    const user = results.rows[0];

    if (user) {
      if (await bcrypt.compare(password, user.password)) {
        return { username: user.username };
      }
    }
  }

  /** Update last_login_at for user */

  static async updateLoginTimestamp(username) {
    const results = await db.query(
      `
    UPDATE users SET last_login_at = current_timestamp WHERE username = $1`,
      [username]
    );
    return results.rows[0];
  }

  static async all() {
    const results = await db.query(
      `SELECT username,first_name,last_name,phone FROM users`
    );
    return results.rows;
  }

  static async get(username) {
    const result = await db.query(
      `SELECT username,first_name,last_name,phone FROM users WHERE username = $1`,
      [username]
    );
    if (result.rows.length === 0) {
      throw new Error(`No such username: ${username}`);
    }
    return result.rows[0];
  }

  static async messagesFrom(username) {
    const result = await db.query(
      `SELECT m.id,
      m.to_username,
      u.first_name,
      u.last_name,
      u.phone,
      m.body,
      m.sent_at,
      m.read_at
      FROM messages AS m
        JOIN users AS u
        ON m.to_user = u.username
        WHERE from_username =$1`,
      [username]
    );
    return result.rows.map((m) => ({
      id: m.id,
      to_user: {
        username: m.to_username,
        first_name: m.first_name,
        last_name: m.last_name,
        phone: m.phone,
      },
      body: m.body,
      sent_at: m.sent_at,
      read_at: m.read_at,
    }));
  }

  static async messagesTo(username) {
    const result = await db.query(
      `SELECT m.id,
                m.from_username,
                u.first_name,
                u.last_name,
                u.phone,
                m.body,
                m.sent_at,
                m.read_at
          FROM messages AS m
           JOIN users AS u ON m.from_username = u.username
          WHERE to_username = $1`,
      [username]
    );

    return result.rows.map((m) => ({
      id: m.id,
      from_user: {
        username: m.from_username,
        first_name: m.first_name,
        last_name: m.last_name,
        phone: m.phone,
      },
      body: m.body,
      sent_at: m.sent_at,
      read_at: m.read_at,
    }));
  }
}

module.exports = User;

// "username": "Sample 1",
// "password": "Sample 1 Pass",
// "first_name": "Sample 1 First",
// "last_name": "Sample 1 Last",
// "phone" : "123-456-7890"

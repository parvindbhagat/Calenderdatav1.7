const mongoose = require('mongoose');
const plm = require('passport-local-mongoose');

mongoose.connect("mongodb://127.0.0.1:27017/calendar_db");
// Atlas connection String: mongodb+srv://parvindbhagat:N2DbOtD5LZFcsXTV@cluster0.fginkoc.mongodb.net/

const userSchema = new mongoose.Schema({
  fullName: String,
  username: String,
 //email to be used as username, username field is mandatory for passport local
  location: String,
  industry: String,
  role: String,
  empCode: String,
  contact: Number,
  dates:{
    type: Array,
    default: []
  }
})
userSchema.plugin(plm);
module.exports = mongoose.model("user", userSchema);
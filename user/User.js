const mongoose = require('mongoose');  
const UserSchema = new mongoose.Schema({  
  name: String,
  email: String,
  password: String,
  role: String
});
mongoose.model('EduUser', UserSchema);

module.exports = mongoose.model('EduUser');
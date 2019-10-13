const mongoose = require('mongoose');

const UserSchema = mongoose.Schema({
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  followers: {
    type: Number
  },
  following: {
    type: Number
  },
  private: {
    type: Boolean
  },
  numberOfPosts: {
    type: Number
  }
});

UserSchema.index({firstName: 'text', lastName: 'text'});

module.exports = mongoose.model('user', UserSchema);

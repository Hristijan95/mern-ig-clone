const mongoose = require('mongoose');

const FollowerSchema = mongoose.Schema({
  follower: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users'
  },
  followed: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users'
  },
  approved: {
      type: Boolean
  }
});

module.exports = mongoose.model('follower', FollowerSchema);

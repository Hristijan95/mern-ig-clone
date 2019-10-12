const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Follower = require('../models/Follower');
const config = require('config');
const { check, validationResult } = require('express-validator');

/**
 * @route   POST api/followers
 * @desc    Follow User
 * @access  PRIVATE
 */
router.post('/:userId', auth, async (req, res) => {
  if (!req.params.userId) {
    return res
      .status(400)
      .json({ msg: 'userId must be sent in request params' });
  }

  try {
    const secondUser = await User.findOne({ _id: req.params.userId });

    if (!secondUser) {
      return res.status(400).json({ msg: 'Invalid userId' });
    }

    let newFollower = new Follower({
      follower: req.user.id,
      followed: req.params.userId,
      approved: !secondUser.private
    });

    if (!secondUser.private) {
      const firstUser = await User.findOne({ _id: req.user.id });
      firstUser.following++;
      await firstUser.save();
      secondUser.followers++;
      await secondUser.save();
    }

    const follower = await newFollower.save();
    res.json(follower);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

/**
 * @route   GET api/followers/pending
 * @desc    Get all pending follow request for a user
 * @access  PRIVATE
 */
router.get('/pending', auth, async (req, res) => {
  try {
    const pendingFollowRequests = await Follower.find({
      followed: req.user.id,
      approved: false
    });
    res.json(pendingFollowRequests);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

/**
 * @route   PUT api/followers/:id
 * @desc    Accept pending follow request
 * @access  PRIVATE
 */
router.put('/:id', auth, async (req, res) => {
  if (!req.params.id) {
    return res.status(400).json({ msg: 'id must be sent in request params' });
  }

  try {
    const followerObject = await Follower.findOne({ _id: req.params.id });

    if (!followerObject) {
      return res.status(400).json({ msg: 'Follow request not found' });
    }

    followerObject.approved = true;
    await followerObject.save();

    await User.findByIdAndUpdate(
      followerObject.follower,
      { $inc: { following: 1 } },
      { new: false }
    );
    await User.findByIdAndUpdate(
      followerObject.followed,
      { $inc: { followers: 1 } },
      { new: false }
    );

    res.json(followerObject);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

/**
 * @route   DELETE api/followers/:id
 * @desc    Unfollow User
 * @access  PRIVATE
 */

router.delete('/:id', auth, async (req, res) => {
  if (!req.params.id) {
    return res.status(400).json({ msg: 'id must be sent in request params' });
  }

  try {
    const followerObject = await Follower.findOne({ _id: req.params.id });

    if (!followerObject) {
      return res.status(400).json({ msg: 'Follow request not found' });
    }

    await User.findByIdAndUpdate(
      followerObject.follower,
      { $inc: { following: -1 } },
      { new: false }
    );
    await User.findByIdAndUpdate(
      followerObject.followed,
      { $inc: { followers: -1 } },
      { new: false }
    );

    await followerObject.remove();
    res.json({ msg: 'Unfollowed' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

module.exports = router;

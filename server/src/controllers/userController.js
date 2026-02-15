const User = require('../models/User');

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json({
      success: true,
      profile: { id: user._id, name: user.name, email: user.email, profession: user.profession, bio: user.bio, avatar: user.avatar, joinDate: user.joinDate, lastActive: user.lastActive }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, profession, bio, avatar } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { name, profession, bio, avatar, lastActive: new Date() },
      { new: true, runValidators: true }
    );

    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json({
      success: true,
      profile: { id: user._id, name: user.name, email: user.email, profession: user.profession, bio: user.bio, avatar: user.avatar, joinDate: user.joinDate, lastActive: user.lastActive }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json({
      success: true,
      user: { id: user._id, name: user.name, profession: user.profession, bio: user.bio, avatar: user.avatar, joinDate: user.joinDate }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
};

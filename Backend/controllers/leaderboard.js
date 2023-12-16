const User = require('../models/user');

exports.getLeaderBoard = async (req, res) => {
    try {
      const usersWithExpenses = await User.find().select('name totalExpenses').sort({ totalExpenses: -1 });
  
      console.log(JSON.stringify(usersWithExpenses, null, 2));
      
      if(usersWithExpenses){
        res.status(200).json({ success: true, usersWithExpenses });
      } else {
        res.status(400).json({ success: false, message: 'Error while fetching the leaderboard data' });
      }

    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ success: false, message: 'Something went wrong' });
      throw error;
    }
  };
  
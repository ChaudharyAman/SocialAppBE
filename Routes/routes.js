const express = require('express');
const { getAllUsers, createUser, createUser2, updateUser, deleteUser, getUserById, updateLoggedInUser,  getUserByUsername, getUserByUsername2 } = require('../Controllers/userController');
const { mediaUpload, imageUpload } = require('../Middlewares/multerMiddleware');
const { loginUser, logoutUser } = require('../Controllers/userLoginControllere')
const { getAllAdmins, createAdmin, updateAdmin, deleteAdmin } = require('../Controllers/adminController')
const { loginAdmin, logoutAdmin } = require('../Controllers/adminLoginController')
const { createPost, getAllPosts, updatePost, deletePost, getPostById} = require('../Controllers/postController');
const { isAuthenticated } = require('../Middlewares/auth');
const { toggleLike, getLikesForPost }  = require('../Controllers/likeController');
const { getAllData } = require('../Controllers/dataController');
const { createComment, deleteComment, getCommentsForPost } = require('../Controllers/commentController');
const { sendFriendRequest, acceptFriendRequest, cancelFriendRequest, getFriends, removeFriend, getMyFriends, getSentRequests, getUserFriendsByUsername, getPendingRequests } = require('../Controllers/friendController');
const { getUserFeed } = require('../Controllers/feedController');
const { getChatHistory, sendMessage, getRecentChats} = require('../Controllers/messageController');
const { meUser } = require('../Controllers/meController');



const router = express.Router();



router.get('/data', getAllData)
router.get('/feed', isAuthenticated, getUserFeed)


router.get('/users', getAllUsers);
router.get('/users/:id', isAuthenticated, getUserById)
router.get('/User/:username', isAuthenticated, getUserByUsername2)
router.get('/fetchUser/:username', isAuthenticated, getUserByUsername)
router.post('/createUser', imageUpload.single('media'), createUser);
router.post('/createUser2', imageUpload.single('media'), createUser2);
router.put('/updateUser', imageUpload.single('media'), updateUser)
router.put( "/updateProfile", isAuthenticated, imageUpload.single("media"), updateLoggedInUser );
router.delete('/deleteUser', deleteUser)

router.post('/loginUser', loginUser);
router.post('/logoutUser', logoutUser);
router.get('/checkAuth', isAuthenticated, (req, res) => { return res.json({success: true, user: req.user});});



router.get('/admins', getAllAdmins);
router.post('/createAdmin', createAdmin);
router.put('/updateAdmin', updateAdmin);
router.delete('/deleteAdmin', deleteAdmin);

router.post('/loginAdmin', loginAdmin);
router.post('/logoutAdmin', logoutAdmin);



router.get('/posts', getAllPosts)
router.get("/posts/:id", isAuthenticated, getPostById);
router.post('/createPost', isAuthenticated, mediaUpload.single('media'), createPost );
router.put('/updatePost', isAuthenticated, updatePost);
router.delete('/deletePost', isAuthenticated, deletePost)

router.get('/likes/:post_id', isAuthenticated, getLikesForPost);
router.post('/like/:post_id', isAuthenticated, toggleLike);



router.get('/comments/:post_id', isAuthenticated, getCommentsForPost);
router.post('/createComment', isAuthenticated, createComment);
router.delete('/deleteComment', isAuthenticated, deleteComment);



router.post('/sendRequest/:username', isAuthenticated, sendFriendRequest);
router.get("/requestSent", isAuthenticated, getSentRequests);
router.put('/acceptRequest/:username', isAuthenticated, acceptFriendRequest);
router.delete('/cancelRequest/:username', isAuthenticated, cancelFriendRequest);
router.get('/list/:username', getFriends);
router.get("/friends", isAuthenticated, getMyFriends);
router.get("/Friends/:username", isAuthenticated, getUserFriendsByUsername);
router.get("/pendingRequests", isAuthenticated, getPendingRequests);
router.delete('/removeFriend/:username', isAuthenticated, removeFriend);



router.post('/message/:friend_id', isAuthenticated, sendMessage);
router.get('/history/:friend_id', isAuthenticated, getChatHistory);
router.get("/recentChats", isAuthenticated, getRecentChats);



router.get('/me', isAuthenticated, meUser)


module.exports = router;
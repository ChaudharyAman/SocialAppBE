import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaSignOutAlt, FaRegEdit } from "react-icons/fa";
import { fetchLoggedinUser } from "../Redux/Slices/loggedInUserSlice";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";

const ProfilePostPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { data: loggedInUser, status, error } = useSelector(
    (state) => state.loggedInUser
  );

  const [selectedPost, setSelectedPost] = useState(null);
  const [showFriendsModal, setShowFriendsModal] = useState(false);

  useEffect(() => {
    if (!loggedInUser && status === "idle") {
      dispatch(fetchLoggedinUser())
        .unwrap()
        .catch(() => navigate("/login"));
    }
  }, [dispatch, navigate, loggedInUser, status]);

  const handleLogout = async () => {
    await axios.post(
      "http://localhost:3000/api/v1/logoutUser",
      {},
      { withCredentials: true }
    );
    navigate("/login");
  };

  if (status === "loading")
    return <p className="text-center mt-20">Loading...</p>;
  if (status === "failed")
    return <p className="text-center mt-20 text-red-500">Error: {error}</p>;
  if (!loggedInUser) return null;

  return (
    <div className="p-6">
      {/* Cover Section */}
      <div className="relative w-full h-[40vh] rounded-lg overflow-hidden mb-20">
        <img
          src={loggedInUser.media_url}
          alt="cover"
          className="w-full h-full object-cover blur-md scale-110"
        />

        <div className="absolute inset-0 mb-2 flex justify-between items-end w-[95%] left-4">
          <div className="flex items-center gap-6">
            <img
              src={loggedInUser.media_url}
              alt="profile"
              className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
            />
            <div>
              <h1 className="flex flex-col justify-between text-2xl font-bold">
                {loggedInUser.first_name} {loggedInUser.last_name}
              </h1>
              <h3 className="font-semibold text-gray-700 mt-2 hover:text-black hover:underline cursor-pointer">
                {`@${loggedInUser.username}`}
              </h3>
              <div className="rounded-lg mt-1 mb-1 mr-4">
                <span className="font-semibold">{loggedInUser.bio}</span>
              </div>
            </div>
          </div>
          <div className="absolute top-4 right-[-15px] flex flex-col items-end justify-between h-full py-6">
            {/* Logout */}
            <button
              onClick={handleLogout}
              className="gap-2 cursor-pointer px-7 mt-[-20px] py-2 whitespace-nowrap flex items-center bg-red-100 text-red-600 rounded-lg shadow hover:bg-red-600/90 hover:text-white transition-all"
            >
              <FaSignOutAlt />
              Logout
            </button>
            {/* Connections -> open modal */}
            <span
              onClick={() => setShowFriendsModal(true)}
              className="text-gray-700 mr-[10px] hover:text-black cursor-pointer hover:underline font-medium"
            >
              {`${loggedInUser.friends.length} • Connections`}
            </span>
            {/* Edit profile */}
            <button className="gap-2 mb-2 px-4 py-2 whitespace-nowrap flex items-center cursor-pointer bg-red-100 text-red-600 rounded-lg shadow hover:bg-red-600/90 hover:text-white transition-all">
              <FaRegEdit />
              Edit profile
            </button>
          </div>
        </div>
      </div>

      {/* Friends Modal */}
      {showFriendsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
          <div className="bg-white rounded-xl shadow-lg w-11/12 max-w-2xl max-h-[80vh] overflow-y-auto p-6 relative">
            <button
              className="absolute top-3 right-3 text-gray-600 hover:text-gray-900 text-2xl font-bold"
              onClick={() => setShowFriendsModal(false)}
            >
              &times;
            </button>
            <h2 className="text-xl font-semibold mb-4">Connections</h2>
            {loggedInUser.friends?.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {loggedInUser.friends.map((friend) => (
                  <div
                    key={friend.id}
                    className="flex flex-col items-center bg-gray-50 shadow rounded-lg p-3 hover:bg-gray-100 transition"
                  >
                    <img
                      src={friend.media_url}
                      alt={friend.username}
                      className="w-16 h-16 rounded-full object-cover mb-2"
                    />
                    <p className="text-sm font-medium text-center">
                      {friend.first_name} {friend.last_name}
                    </p>
                    <p className="text-xs text-gray-500">@{friend.username}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No friends yet.</p>
            )}
          </div>
        </div>
      )}

      {/* Posts Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
        {loggedInUser.posts?.map((post) => (
          <div
            key={post.id}
            className="cursor-pointer overflow-hidden rounded-lg shadow-lg"
            onClick={() => setSelectedPost(post)}
          >
            {post.media_type === "video" ? (
              <video
                src={post.media_url}
                className="w-full h-48 object-cover"
                controls
              />
            ) : (
              <img
                src={post.media_url}
                alt="Post"
                className="w-full h-48 object-cover"
                loading="lazy"
              />
            )}
          </div>
        ))}
      </div>

      {/* Post Modal (already in your code) */}
      {selectedPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
          <div className="bg-white rounded-xl shadow-lg w-11/12 max-w-3xl max-h-[90vh] overflow-y-auto p-6 relative">
            <button
              className="absolute top-3 right-3 text-gray-600 hover:text-gray-900 text-2xl font-bold"
              onClick={() => setSelectedPost(null)}
            >
              &times;
            </button>
            {/* Post content... */}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePostPage;

/* eslint-disable max-len */
// api.js (non-module version)
(function(global) {
  // Make sure you load Firebase (and preferably the compat libraries) before this script.
  // For example, include these in your HTML head:
  // <script src="https://www.gstatic.com/firebasejs/9.17.1/firebase-app-compat.js"></script>
  // <script src="https://www.gstatic.com/firebasejs/9.17.1/firebase-auth-compat.js"></script>

  // Define the base URL for your Railway backend.
  const BASE_URL = "https://labratbackend-production.up.railway.app";

  /**
   * Retrieves the current user's ID token.
   * @return {Promise<string>}
   * @throws if no user is authenticated.
   */
  async function getIdToken() {
    // Use the compat version of Firebase Authentication.
    const auth = firebase.auth();
    const user = auth.currentUser;
    if (!user) {
      throw new Error("User is not authenticated. Please sign in first.");
    }
    return await user.getIdToken();
  }

  /**
   * Submits a leaderboard score to the secure '/submitLeaderboardScore' endpoint.
   * For admin submissions, pass additional parameters.
   *
   * @param {string} playerName - The player's name.
   * @param {number} score - The player's score.
   * @param {number} level - The level reached.
   * @param {number} [completionTime] - The completion time (optional).
   * @param {number} [currentLevel] - The current level (optional).
   * @return {Promise<Object>} - Resolves with the server response.
   */
  async function submitLeaderboardScore(playerName, score, level, completionTime, currentLevel) {
    try {
      const token = await getIdToken();
      const payload = { playerName, score, level, completionTime, currentLevel };
      const response = await fetch(`${BASE_URL}/submitLeaderboardScore`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + token
        },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Error submitting leaderboard score");
      }
      console.log("Leaderboard score submitted:", data);
      return data;
    } catch (error) {
      console.error("Error in submitLeaderboardScore:", error);
      throw error;
    }
  }

  /**
   * Sets the custom 'admin' claim for a given user UID.
   * Only an authenticated admin should call this.
   *
   * @param {string} userUid - The UID of the user to grant admin privileges.
   * @return {Promise<Object>} - Resolves with the server response.
   */
  async function setAdminForUser(userUid) {
    try {
      const token = await getIdToken();
      const payload = { uid: userUid };
      const response = await fetch(`${BASE_URL}/setAdmin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + token
        },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Error setting admin claim");
      }
      console.log("Admin claim set successfully:", data);
      return data;
    } catch (error) {
      console.error("Error in setAdminForUser:", error);
      throw error;
    }
  }

  /**
   * Adds a new registered user via the '/addUser' endpoint.
   * (Only username and email are needed; the backend uses the token UID.)
   *
   * @param {string} username - The user's chosen username.
   * @param {string} email - The user's email.
   * @return {Promise<Object>} - Resolves with the server response.
   */
  async function addUser(username, email) {
    try {
      const token = await getIdToken();
      const payload = { username, email };
      const response = await fetch(`${BASE_URL}/addUser`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + token
        },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Error adding user");
      }
      console.log("User added successfully:", data);
      return data;
    } catch (error) {
      console.error("Error in addUser:", error);
      throw error;
    }
  }

  /**
   * Retrieves leaderboard data from the secure '/getLeaderboard' endpoint.
   * The backend handles sorting and filtering based on user type.
   *
   * @param {number} [page=1] - The page number to retrieve.
   * @return {Promise<Array>} - An array of leaderboard submission objects.
   */
  async function getLeaderboard(page = 1) {
    try {
      const token = await getIdToken();
      const response = await fetch(`${BASE_URL}/getLeaderboard?page=${page}`, {
        headers: { "Authorization": "Bearer " + token }
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Error fetching leaderboard data");
      }
      return data.submissions;
    } catch (error) {
      console.error("Error in getLeaderboard:", error);
      throw error;
    }
  }

  /**
   * Retrieves registered users from the backend.
   * Returns an array of user objects.
   *
   * @param {number} [page=1]
   * @param {string} [sortField="registrationDate"]
   * @param {string} [sortOrder="desc"]
   * @return {Promise<Array>}
   */
  async function getUsers(page = 1, sortField = "registrationDate", sortOrder = "desc") {
    try {
      const token = await getIdToken();
      const response = await fetch(
        `${BASE_URL}/getUsers?page=${page}&sortField=${sortField}&sortOrder=${sortOrder}`,
        { headers: { "Authorization": "Bearer " + token } }
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Error fetching users");
      }
      return data.users;
    } catch (error) {
      console.error("Error in getUsers:", error);
      throw error;
    }
  }

  /**
   * Submits a contact message via the '/submitContactMessage' endpoint.
   *
   * @param {string} name - The sender's name.
   * @param {string} email - The sender's email.
   * @param {string} message - The message content.
   * @return {Promise<Object>} - Resolves with the server response.
   */
  async function submitContactMessage(name, email, message) {
    try {
      const payload = { name, email, message };
      const response = await fetch(`${BASE_URL}/submitContactMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Error submitting contact message");
      }
      console.log("Contact message submitted:", data);
      return data;
    } catch (error) {
      console.error("Error in submitContactMessage:", error);
      throw error;
    }
  }

  /**
   * Retrieves contact messages from the backend.
   * Returns an array of messages.
   *
   * @param {number} [page=1]
   * @param {string} [sortField="dateSent"]
   * @param {string} [sortOrder="desc"]
   * @return {Promise<Array>}
   */
  async function getContactMessages(page = 1, sortField = "dateSent", sortOrder = "desc") {
    try {
      const token = await getIdToken();
      const response = await fetch(
        `${BASE_URL}/getContactMessages?page=${page}&sortField=${sortField}&sortOrder=${sortOrder}`,
        { headers: { "Authorization": "Bearer " + token } }
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Error fetching contact messages");
      }
      return data.messages;
    } catch (error) {
      console.error("Error in getContactMessages:", error);
      throw error;
    }
  }

  // Expose these functions as a global namespace object.
  global.api = {
    getIdToken,
    submitLeaderboardScore,
    setAdminForUser,
    addUser,
    getLeaderboard,
    getUsers,
    submitContactMessage,
    getContactMessages
  };

})(window);

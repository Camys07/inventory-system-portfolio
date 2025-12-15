/* eslint-disable linebreak-style */
/* eslint-disable no-undef */

// Import necessary functions from Firebase Auth and Firestore.
const { getAuth, GoogleAuthProvider, signInWithPopup } = require("firebase/auth");
const { getFirestore, doc, setDoc } = require("firebase/firestore");

// Initialize the Auth and Firestore instances.
const auth = getAuth();
const db = getFirestore();

/**
 * Displays a modal with the provided message. This function creates
 * a simple overlay modal for user-friendly feedback.
 * @param {string} message - The message to display in the modal.
 */
function showModal(message) {
  // Create overlay element.
  const modalOverlay = document.createElement("div");
  modalOverlay.style.position = "fixed";
  modalOverlay.style.top = "0";
  modalOverlay.style.left = "0";
  modalOverlay.style.width = "100%";
  modalOverlay.style.height = "100%";
  modalOverlay.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
  modalOverlay.style.display = "flex";
  modalOverlay.style.justifyContent = "center";
  modalOverlay.style.alignItems = "center";
  modalOverlay.style.zIndex = "1000";

  // Create modal container.
  const modalContainer = document.createElement("div");
  modalContainer.style.backgroundColor = "#fff";
  modalContainer.style.padding = "20px";
  modalContainer.style.borderRadius = "8px";
  modalContainer.style.boxShadow = "0 2px 10px rgba(0,0,0,0.1)";
  modalContainer.style.maxWidth = "400px";
  modalContainer.style.width = "80%";
  modalContainer.style.textAlign = "center";

  // Create message element.
  const messageElement = document.createElement("p");
  messageElement.textContent = message;
  messageElement.style.color = "#333";
  messageElement.style.fontSize = "16px";
  modalContainer.appendChild(messageElement);

  // Create close button.
  const closeButton = document.createElement("button");
  closeButton.textContent = "Close";
  closeButton.style.marginTop = "15px";
  closeButton.style.padding = "10px 20px";
  closeButton.style.backgroundColor = "#8806CE";
  closeButton.style.color = "#fff";
  closeButton.style.border = "none";
  closeButton.style.borderRadius = "5px";
  closeButton.style.cursor = "pointer";
  closeButton.addEventListener("click", () => {
    document.body.removeChild(modalOverlay);
  });
  modalContainer.appendChild(closeButton);

  modalOverlay.appendChild(modalContainer);
  document.body.appendChild(modalOverlay);
}

/**
 * Signs in a user with Google using Firebase Authentication.
 * On success, it writes additional user info to Firestore (merging any existing data)
 * and displays a modal with a success message before redirecting. If the sign‑in process fails,
 * an error modal is displayed.
 */
async function signInWithGoogle() {
  const provider = new GoogleAuthProvider();
  try {
    // Sign in with Google using a popup.
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    console.log("User signed in with Google:", user);

    // Store additional user info in Firestore in the "users" collection.
    // The merge option ensures that any pre-existing data is updated.
    await setDoc(
      doc(db, "users", user.uid),
      {
        username: user.displayName,
        email: user.email,
        user_type: "player", // Adjust user type as needed.
        createdAt: new Date(),
      },
      { merge: true }
    );

    // Display a success modal.
    showModal("Google sign-in successful!");

    // Redirect to the homepage after a short delay.
    setTimeout(() => {
      window.location.href = "index.html";
    }, 1500);
  } catch (error) {
    console.error("Google sign-in error:", error);
    // Display an error modal with the error message.
    showModal("Failed to sign in with Google: " + error.message);
  }
}

module.exports.signInWithGoogle = signInWithGoogle;

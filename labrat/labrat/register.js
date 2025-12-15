/* eslint-disable linebreak-style */
/* eslint-disable max-len */
/* eslint-disable no-undef */

import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  updateProfile, 
  sendEmailVerification 
} from "https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-firestore.js";

// Flag to prevent multiple submissions.
let registrationInProgress = false;

/**
 * Displays a modal with the provided message.
 * This helps reassure the user with clear, user-friendly feedback.
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
  modalContainer.style.boxShadow = "0 2px 10px rgba(0, 0, 0, 0.1)";
  modalContainer.style.maxWidth = "400px";
  modalContainer.style.width = "80%";
  modalContainer.style.textAlign = "center";

  // Create and append the message element.
  const messageElement = document.createElement("p");
  messageElement.textContent = message;
  messageElement.style.color = "#333";
  messageElement.style.fontSize = "16px";
  modalContainer.appendChild(messageElement);

  // Create and append the close button.
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
    if (modalOverlay.parentElement) {
      modalOverlay.parentElement.removeChild(modalOverlay);
    }
  });

  modalContainer.appendChild(closeButton);
  modalOverlay.appendChild(modalContainer);
  document.body.appendChild(modalOverlay);
}

/**
 * Utility: Validate the email format using a regex pattern.
 * @param {string} email - The email string to validate.
 * @return {boolean} - True if the email is valid.
 */
function validateEmail(email) {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(email);
}

/**
 * Registers a new user (for players) with the provided information.
 * @param {string} usernameInput
 * @param {string} emailInput
 * @param {string} passwordInput
 * @param {string} confirmPasswordInput
 */
export async function registerUser(usernameInput, emailInput, passwordInput, confirmPasswordInput) {
  // Prevent multiple clicks/submissions.
  if (registrationInProgress) {
    showModal("Registration is already in progress. Please wait.");
    return;
  }
  registrationInProgress = true;

  const auth = getAuth();
  const db = getFirestore();
  const username = usernameInput.trim();
  const email = emailInput.trim();
  const password = passwordInput;
  const confirmPassword = confirmPasswordInput;

  if (!username || !email || !password || !confirmPassword) {
    showModal("All fields are required.");
    registrationInProgress = false;
    return;
  }
  if (password !== confirmPassword) {
    showModal("Passwords do not match. Please retype your password.");
    const pwdInput = document.getElementById("password");
    const cpwdInput = document.getElementById("confirmPassword");
    if (pwdInput) pwdInput.value = "";
    if (cpwdInput) cpwdInput.value = "";
    registrationInProgress = false;
    return;
  }
  if (!validateEmail(email)) {
    showModal("Invalid email format.");
    registrationInProgress = false;
    return;
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    console.log("User created successfully:", userCredential.user);
    await updateProfile(userCredential.user, { displayName: username });
    console.log("User profile updated with displayName:", username);
    console.log("Attempting to send verification email...");
    try {
      await sendEmailVerification(userCredential.user);
      console.log("Verification email sent successfully.");
    } catch (verificationError) {
      console.error("Error during email verification:", verificationError);
      throw verificationError;
    }

    await setDoc(doc(db, "users", userCredential.user.uid), {
      username: username,
      email: email,
      user_type: "player",
      createdAt: new Date(),
    });
    console.log("User information saved in Firestore.");
    showModal("Registration successful! A verification email has been sent to your address. Please verify your email before logging in.");
    setTimeout(() => {
      window.location.href = "login.html";
    }, 1500);
  } catch (error) {
    console.error("Registration error:", error);
    showModal("Registration failed: " + error.message);
    registrationInProgress = false;
  }
}

// Function to create a new room
function createRoom() {
  const roomId = Math.random().toString(36).substring(2, 10); // Generate random room ID
  window.location.href = `/room/${roomId}`; // Redirect to the new room URL
}

// Function to join an existing meeting (room)
function joinMeeting() {
  const roomId = prompt('Enter meeting ID:'); // Prompt the user for the meeting ID
  if (roomId) {
    // Check if the room ID is valid (you can define your own room ID validation here)
    if (/^[a-z0-9]{8}$/.test(roomId)) {
      window.location.href = `/room/${roomId}`; // Redirect to the room if valid
    } else {
      alert('Invalid room ID. Please try again.'); // Alert if the ID doesn't match the format
    }
  }
}

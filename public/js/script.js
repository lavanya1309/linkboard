function createRoom() {
  const roomId = Math.random().toString(36).substring(2, 10);
  window.location.href = `/room/${roomId}`;
}

function joinMeeting() {
  const roomId = prompt('Enter meeting ID:');
  if (roomId) {
    window.location.href = `/room/${roomId}`;
  }
}

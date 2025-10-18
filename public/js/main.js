const socket = io();
let username = "";
let roomId = "";
let localStream;
let peers = {};

const usernameInput = document.getElementById("username");
const setUsernameBtn = document.getElementById("setUsername");
const roomIdInput = document.getElementById("roomId");
const createRoomBtn = document.getElementById("createRoom");
const joinRoomBtn = document.getElementById("joinRoom");
const allusersHtml = document.getElementById("allusers");
const videoStreams = document.getElementById("videoStreams");
const muteBtn = document.getElementById("muteBtn");
const camBtn = document.getElementById("camBtn");
const screenShareBtn = document.getElementById("screenShareBtn");
const endCallBtn = document.getElementById("endCallBtn");
const chatInput = document.getElementById("chatInput");
const chatSendBtn = document.getElementById("chatSendBtn");
const chatWindow = document.getElementById("chatWindow");

setUsernameBtn.onclick = () => {
  if (usernameInput.value.trim() !== "") {
    username = usernameInput.value.trim();
    document.querySelector(".username-input").style.display = "none";
  }
};

createRoomBtn.onclick = () => {
  if (!username) return alert("Set your username first");
  roomId = roomIdInput.value.trim() || Math.random().toString(36).slice(2, 10);
  roomIdInput.value = roomId;
  socket.emit("create-room", { username, roomId });
  document.querySelector(".room-input").style.display = "none";
  alert("Room created! Share this code with others: " + roomId);
};

joinRoomBtn.onclick = () => {
  if (!username || !roomIdInput.value.trim()) return alert("Set username & room!");
  roomId = roomIdInput.value.trim();
  socket.emit("join-room", { username, roomId });
  document.querySelector(".room-input").style.display = "none";
};

async function initMedia() {
  localStream = await navigator.mediaDevices.getUserMedia({
    audio: true,
    video: true,
  });
  console.log("🎥 Got local stream");
}
initMedia();

socket.on("update-users", (users) => {
  allusersHtml.innerHTML = "";
  videoStreams.innerHTML = "";

  for (const peerId in users) {
    const li = document.createElement("li");
    li.textContent = users[peerId] + (peerId === socket.id ? " (You)" : "");
    allusersHtml.appendChild(li);

    const videoDiv = document.createElement("div");
    videoDiv.classList.add("video-box");
    const videoEl = document.createElement("video");
    videoEl.id = "video-" + peerId;
    videoEl.autoplay = true;
    videoEl.playsInline = true;

    if (peerId === socket.id && localStream) {
      videoEl.muted = true;
      videoEl.srcObject = localStream;
    }

    videoDiv.appendChild(videoEl);
    videoStreams.appendChild(videoDiv);
  }

  // Prepare peer connections for all current users
  for (const peerId in users) {
    if (peerId !== socket.id && !peers[peerId]) {
      createPeerConnection(peerId);
    
    }
  }
});

socket.on("new-peer", async ({ peerId }) => {
  console.log("📡 New peer joined:", peerId);
  if (!peers[peerId]) {
    createPeerConnection(peerId);
    await makeOffer(peerId);
  }
});

function createPeerConnection(peerId) {
  console.log("🧩 Creating PeerConnection for", peerId);
  const pc = new RTCPeerConnection({
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
  });

  if (localStream) {
    localStream.getTracks().forEach((track) => pc.addTrack(track, localStream));
  }

  pc.ontrack = (event) => {
    console.log("🎬 Got remote track from", peerId);
    let videoEl = document.getElementById("video-" + peerId);
    if (!videoEl) {
      setTimeout(() => {
        const vid = document.getElementById("video-" + peerId);
        if (vid) vid.srcObject = event.streams[0];
      }, 500);
    } else {
      videoEl.srcObject = event.streams[0];
    }
  };

  pc.onicecandidate = (event) => {
    if (event.candidate) {
      socket.emit("signal", {
        roomId,
        target: peerId,
        type: "ice",
        data: event.candidate,
        from: socket.id,
      });
    }
  };

  peers[peerId] = pc;
}

async function makeOffer(peerId) {
  const pc = peers[peerId];
  console.log("📤 Making offer to", peerId);
  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);
  socket.emit("signal", {
    roomId,
    target: peerId,
    type: "offer",
    data: offer,
    from: socket.id,
  });
}

socket.on("signal", async ({ type, data, from }) => {
  console.log("📨 Signal received:", type, "from", from);
  let pc = peers[from];
  if (!pc) {
    createPeerConnection(from);
    pc = peers[from];
  }

  if (type === "offer") {
    await pc.setRemoteDescription(new RTCSessionDescription(data));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    socket.emit("signal", {
      roomId,
      target: from,
      type: "answer",
      data: answer,
      from: socket.id,
    });
  } else if (type === "answer") {
    await pc.setRemoteDescription(new RTCSessionDescription(data));
  } else if (type === "ice") {
    await pc.addIceCandidate(new RTCIceCandidate(data));
  }
});

// Chat handlers
chatSendBtn.onclick = () => {
  socket.emit("chat", { roomId, username, message: chatInput.value });
  chatInput.value = "";
};
socket.on("chat", ({ username, message }) => {
  const msgDiv = document.createElement("div");
  msgDiv.textContent = `${username}: ${message}`;
  chatWindow.appendChild(msgDiv);
});

// Media control buttons
muteBtn.onclick = () => {
  if (!localStream) return;
  const audioTrack = localStream.getAudioTracks()[0];
  audioTrack.enabled = !audioTrack.enabled;
};

camBtn.onclick = () => {
  if (!localStream) return;
  const videoTrack = localStream.getVideoTracks()[0];
  videoTrack.enabled = !videoTrack.enabled;
};

screenShareBtn.onclick = async () => {
  if (!localStream) return;
  try {
    const screenStream = await navigator.mediaDevices.getDisplayMedia({
      video: true,
    });
    for (const peerId in peers) {
      const sender = peers[peerId]
        .getSenders()
        .find((s) => s.track.kind === "video");
      sender.replaceTrack(screenStream.getVideoTracks()[0]);
    }
    document.getElementById("video-" + socket.id).srcObject = screenStream;

    screenStream.getVideoTracks()[0].onended = () => {
      for (const peerId in peers) {
        const sender = peers[peerId]
          .getSenders()
          .find((s) => s.track.kind === "video");
        sender.replaceTrack(localStream.getVideoTracks()[0]);
      }
      document.getElementById("video-" + socket.id).srcObject = localStream;
    };
  } catch (err) {
    alert("Screen sharing denied or unavailable.");
  }
};

endCallBtn.onclick = () => {
  for (const peerId in peers) {
    peers[peerId].close();
  }
  peers = {};
  videoStreams.innerHTML = "";
};

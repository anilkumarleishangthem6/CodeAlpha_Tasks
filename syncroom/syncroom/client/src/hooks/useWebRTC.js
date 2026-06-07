import { useRef, useState, useCallback, useEffect } from "react";

const ICE_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
  ],
};

export function useWebRTC(socket, roomId, localUser) {
  const localStreamRef = useRef(null);
  const screenStreamRef = useRef(null);
  const peersRef = useRef({});
  const [peers, setPeers] = useState({});
  const [localStream, setLocalStream] = useState(null);
  const [screenStream, setScreenStream] = useState(null);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  const updatePeers = useCallback(() => {
    setPeers({ ...peersRef.current });
  }, []);

  const createPeer = useCallback(
    (targetSocketId, initiator) => {
      // Close existing peer if any
      if (peersRef.current[targetSocketId]?.pc) {
        peersRef.current[targetSocketId].pc.close();
        delete peersRef.current[targetSocketId];
      }
      const pc = new RTCPeerConnection(ICE_SERVERS);

      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => {
          pc.addTrack(track, localStreamRef.current);
        });
      }

      pc.onicecandidate = ({ candidate }) => {
        if (candidate && socket) {
          socket.emit("webrtc:ice-candidate", {
            to: targetSocketId,
            candidate,
          });
        }
      };

      pc.ontrack = ({ streams }) => {
        if (streams[0]) {
          peersRef.current[targetSocketId] = {
            ...peersRef.current[targetSocketId],
            stream: streams[0],
          };
          updatePeers();
        }
      };

      pc.onconnectionstatechange = () => {
        if (
          pc.connectionState === "failed" ||
          pc.connectionState === "disconnected"
        ) {
          delete peersRef.current[targetSocketId];
          updatePeers();
        }
      };

      if (initiator) {
        pc.onnegotiationneeded = async () => {
          try {
            if (pc.signalingState !== "stable") return;
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            socket?.emit("webrtc:offer", {
              to: targetSocketId,
              offer,
              username: localUser?.username,
            });
          } catch (err) {
            console.error("Offer error:", err);
          }
        };
      }

      return pc;
    },
    [socket, updatePeers],
  );

  const startMedia = useCallback(async (video = true, audio = true) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video,
        audio,
      });
      localStreamRef.current = stream;
      setLocalStream(stream);
      setAudioEnabled(audio);
      setVideoEnabled(video);
      return stream;
    } catch (err) {
      console.warn("Media access error:", err);
      setVideoEnabled(false);
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: false,
          audio: true,
        });
        localStreamRef.current = stream;
        setLocalStream(stream);
        return stream;
      } catch {
        const stream = new MediaStream();
        localStreamRef.current = stream;
        setLocalStream(stream);
        return stream;
      }
    }
  }, []);

  const stopMedia = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
      setLocalStream(null);
    }
  }, []);

  const toggleAudio = useCallback(() => {
    if (localStreamRef.current) {
      const track = localStreamRef.current.getAudioTracks()[0];
      if (track) {
        track.enabled = !track.enabled;
        setAudioEnabled(track.enabled);
        socket?.emit("media:toggle", { type: "audio", enabled: track.enabled });
      }
    }
  }, [socket]);

  const toggleVideo = useCallback(() => {
    if (localStreamRef.current) {
      const track = localStreamRef.current.getVideoTracks()[0];
      if (track) {
        track.enabled = !track.enabled;
        setVideoEnabled(track.enabled);
        socket?.emit("media:toggle", { type: "video", enabled: track.enabled });
      }
    }
  }, [socket]);

  const startScreenShare = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      });
      screenStreamRef.current = stream;
      setScreenStream(stream);
      setIsScreenSharing(true);
      socket?.emit("screen:start");

      Object.values(peersRef.current).forEach(({ pc }) => {
        const videoTrack = stream.getVideoTracks()[0];
        const sender = pc.getSenders().find((s) => s.track?.kind === "video");
        if (sender) sender.replaceTrack(videoTrack);
      });

      stream.getVideoTracks()[0].onended = () => stopScreenShare();
      return stream;
    } catch (err) {
      console.error("Screen share error:", err);
    }
  }, [socket]);

  const stopScreenShare = useCallback(() => {
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach((t) => t.stop());
      screenStreamRef.current = null;
      setScreenStream(null);
      setIsScreenSharing(false);
      socket?.emit("screen:stop");

      if (localStreamRef.current) {
        const videoTrack = localStreamRef.current.getVideoTracks()[0];
        Object.values(peersRef.current).forEach(({ pc }) => {
          const sender = pc.getSenders().find((s) => s.track?.kind === "video");
          if (sender && videoTrack) sender.replaceTrack(videoTrack);
        });
      }
    }
  }, [socket]);

  // Socket event handlers
  useEffect(() => {
    if (!socket) return;

    const handleUserJoined = ({ user }) => {
      const pc = createPeer(user.socketId, true);
      peersRef.current[user.socketId] = {
        pc,
        username: user.username,
        audioEnabled: true,
        videoEnabled: true,
      };
      updatePeers();
    };

    const handleOffer = async ({ from, offer, username }) => {
      try {
        const pc = createPeer(from, false);
        peersRef.current[from] = {
          pc,
          username: username || "Peer",
          audioEnabled: true,
          videoEnabled: true,
        };
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit("webrtc:answer", { to: from, answer });
        updatePeers();
      } catch (err) {
        console.error("Offer handling error:", err);
      }
    };

    const handleAnswer = async ({ from, answer, username }) => {
      const peer = peersRef.current[from];
      if (!peer?.pc) return;
      if (username) peersRef.current[from].username = username;
      if (peer.pc.signalingState === "have-local-offer") {
        try {
          await peer.pc.setRemoteDescription(new RTCSessionDescription(answer));
          updatePeers();
        } catch (err) {
          console.warn("setRemoteDescription skipped:", err.message);
        }
      }
    };

    const handleIceCandidate = async ({ from, candidate }) => {
      const peer = peersRef.current[from];
      if (peer?.pc && candidate) {
        try {
          await peer.pc.addIceCandidate(new RTCIceCandidate(candidate));
        } catch {}
      }
    };

    const handleUserLeft = ({ socketId }) => {
      if (peersRef.current[socketId]) {
        peersRef.current[socketId].pc?.close();
        delete peersRef.current[socketId];
        updatePeers();
      }
    };

    const handleMediaToggle = ({ socketId, type, enabled }) => {
      if (peersRef.current[socketId]) {
        peersRef.current[socketId][`${type}Enabled`] = enabled;
        updatePeers();
      }
    };

    socket.on("room:user-joined", handleUserJoined);
    socket.on("webrtc:offer", handleOffer);
    socket.on("webrtc:answer", handleAnswer);
    socket.on("webrtc:ice-candidate", handleIceCandidate);
    socket.on("room:user-left", handleUserLeft);
    socket.on("media:toggle", handleMediaToggle);

    return () => {
      socket.off("room:user-joined", handleUserJoined);
      socket.off("webrtc:offer", handleOffer);
      socket.off("webrtc:answer", handleAnswer);
      socket.off("webrtc:ice-candidate", handleIceCandidate);
      socket.off("room:user-left", handleUserLeft);
      socket.off("media:toggle", handleMediaToggle);
    };
  }, [socket, createPeer, updatePeers]);

  const cleanup = useCallback(() => {
    Object.values(peersRef.current).forEach(({ pc }) => pc?.close());
    peersRef.current = {};
    setPeers({});
    stopMedia();
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach((t) => t.stop());
    }
  }, [stopMedia]);

  return {
    localStream,
    screenStream,
    peers,
    audioEnabled,
    videoEnabled,
    isScreenSharing,
    startMedia,
    stopMedia,
    toggleAudio,
    toggleVideo,
    startScreenShare,
    stopScreenShare,
    cleanup,
  };
}

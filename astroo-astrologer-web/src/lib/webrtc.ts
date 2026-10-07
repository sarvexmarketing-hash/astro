import { api } from './api-client';
import { Socket } from 'socket.io-client';

export interface WebRTCConnectionOptions {
  consultationId: string;
  sessionId: string;
  type: 'voice' | 'video';
  socket: Socket;
  isInitiator: boolean;
  onRemoteStream: (stream: MediaStream) => void;
  onConnectionStateChange?: (state: RTCPeerConnectionState) => void;
}

export class WebRTCClient {
  private pc: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private options: WebRTCConnectionOptions;
  private isDisposed = false;

  constructor(options: WebRTCConnectionOptions) {
    this.options = options;
  }

  async initialize(): Promise<MediaStream> {
    let iceServers: RTCIceServer[] = [
      { urls: ['stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302'] },
    ];
    try {
      const res = await api.get('/calls/ice-servers');
      if (res.data?.iceServers?.length) {
        iceServers = res.data.iceServers;
      }
    } catch {
      // Fallback
    }

    const constraints: MediaStreamConstraints = {
      audio: true,
      video: this.options.type === 'video' ? { width: { ideal: 1280 }, height: { ideal: 720 } } : false,
    };

    this.localStream = await navigator.mediaDevices.getUserMedia(constraints);

    this.pc = new RTCPeerConnection({ iceServers });

    this.localStream.getTracks().forEach((track) => {
      if (this.pc && this.localStream) {
        this.pc.addTrack(track, this.localStream);
      }
    });

    this.pc.ontrack = (event) => {
      if (event.streams && event.streams[0]) {
        this.options.onRemoteStream(event.streams[0]);
      }
    };

    this.pc.onicecandidate = (event) => {
      if (event.candidate && !this.isDisposed) {
        this.options.socket.emit('webrtc_ice_candidate', {
          consultationId: this.options.consultationId,
          sessionId: this.options.sessionId,
          candidate: event.candidate,
        });
      }
    };

    this.pc.onconnectionstatechange = () => {
      if (this.pc && this.options.onConnectionStateChange) {
        this.options.onConnectionStateChange(this.pc.connectionState);
      }
    };

    this.setupSignaling();

    if (this.options.isInitiator) {
      const offer = await this.pc.createOffer();
      await this.pc.setLocalDescription(offer);
      this.options.socket.emit('webrtc_offer', {
        consultationId: this.options.consultationId,
        sessionId: this.options.sessionId,
        offer,
        sdp: offer,
      });
    }

    return this.localStream;
  }

  private setupSignaling() {
    const { socket, consultationId } = this.options;

    socket.on('webrtc_offer', async (data: any) => {
      if (this.isDisposed || !this.pc || data.consultationId !== consultationId) return;
      if (data.from === socket.id) return;

      try {
        const sdp = data.offer || data.sdp;
        if (sdp && this.pc.signalingState !== 'stable') {
          return;
        }
        await this.pc.setRemoteDescription(new RTCSessionDescription(sdp));
        const answer = await this.pc.createAnswer();
        await this.pc.setLocalDescription(answer);

        socket.emit('webrtc_answer', {
          consultationId: this.options.consultationId,
          sessionId: this.options.sessionId,
          answer,
          sdp: answer,
        });
      } catch (err) {
        console.error('[WebRTC] Error handling offer:', err);
      }
    });

    socket.on('webrtc_answer', async (data: any) => {
      if (this.isDisposed || !this.pc || data.consultationId !== consultationId) return;

      try {
        const sdp = data.answer || data.sdp;
        if (this.pc.signalingState === 'have-local-offer') {
          await this.pc.setRemoteDescription(new RTCSessionDescription(sdp));
        }
      } catch (err) {
        console.error('[WebRTC] Error handling answer:', err);
      }
    });

    socket.on('webrtc_ice_candidate', async (data: any) => {
      if (this.isDisposed || !this.pc || data.consultationId !== consultationId) return;

      try {
        if (data.candidate) {
          await this.pc.addIceCandidate(new RTCIceCandidate(data.candidate));
        }
      } catch (err) {
        console.error('[WebRTC] Error adding ICE candidate:', err);
      }
    });
  }

  toggleAudio(enabled: boolean) {
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach((track) => {
        track.enabled = enabled;
      });
    }
  }

  toggleVideo(enabled: boolean) {
    if (this.localStream) {
      this.localStream.getVideoTracks().forEach((track) => {
        track.enabled = enabled;
      });
    }
  }

  dispose() {
    this.isDisposed = true;
    if (this.localStream) {
      this.localStream.getTracks().forEach((t) => t.stop());
      this.localStream = null;
    }
    if (this.pc) {
      this.pc.close();
      this.pc = null;
    }
  }
}

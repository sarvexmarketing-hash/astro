'use client';

import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { getSocketBaseUrl } from '../lib/api-config';
import { getToken } from '../lib/api-client';
import { useAuth } from './AuthContext';

export interface IncomingConsultationRequest {
  id: string;
  consultationId: string;
  userId: string;
  customerId: string;
  customerName: string;
  type: 'chat' | 'call' | 'video';
  ratePerMinute: number;
  createdAt: string;
}

export interface IncomingCallData {
  consultationId: string;
  sessionId: string;
  callerId: string;
  callerName: string;
  type: 'voice' | 'video';
  status: string;
  timestamp: string;
}

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  incomingRequest: IncomingConsultationRequest | null;
  incomingCall: IncomingCallData | null;
  clearIncomingRequest: () => void;
  clearIncomingCall: () => void;
  joinConsultation: (consultationId: string) => void;
  leaveConsultation: (consultationId: string) => void;
  sendMessage: (data: any, callback?: (res: any) => void) => void;
  acceptCall: (data: { consultationId: string; sessionId: string }) => void;
  rejectCall: (data: { consultationId: string; sessionId: string; reason?: string }) => void;
  endCall: (data: { consultationId: string; sessionId: string; durationSeconds?: number }) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [incomingRequest, setIncomingRequest] = useState<IncomingConsultationRequest | null>(null);
  const [incomingCall, setIncomingCall] = useState<IncomingCallData | null>(null);

  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const token = getToken();
    const socketUrl = getSocketBaseUrl();

    const socketInstance = io(socketUrl, {
      auth: { token: token || '' },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
    });

    socketRef.current = socketInstance;
    setSocket(socketInstance);

    socketInstance.on('connect', () => {
      setIsConnected(true);
      if (token) {
        socketInstance.emit('reauthenticate', { token });
      }
    });

    socketInstance.on('disconnect', () => {
      setIsConnected(false);
    });

    // Realtime Incoming Consultation Request (from Customer)
    const handleIncomingRequest = (req: IncomingConsultationRequest) => {
      setIncomingRequest(req);
    };

    socketInstance.on('consultation_requested', handleIncomingRequest);
    socketInstance.on('incoming_consultation', handleIncomingRequest);

    // Realtime Incoming WebRTC Voice / Video Call
    const handleIncomingCall = (call: IncomingCallData) => {
      if (call.callerId !== user?.id) {
        setIncomingCall(call);
      }
    };

    socketInstance.on('incoming_call', handleIncomingCall);
    socketInstance.on('call_invite', handleIncomingCall);

    socketInstance.on('call_ended', () => {
      setIncomingCall(null);
    });

    socketInstance.on('call_rejected', () => {
      setIncomingCall(null);
    });

    return () => {
      socketInstance.disconnect();
    };
  }, [user?.id]);

  const clearIncomingRequest = () => setIncomingRequest(null);
  const clearIncomingCall = () => setIncomingCall(null);

  const joinConsultation = (consultationId: string) => {
    if (socketRef.current && consultationId) {
      socketRef.current.emit('join_consultation', { consultationId });
    }
  };

  const leaveConsultation = (consultationId: string) => {
    if (socketRef.current && consultationId) {
      socketRef.current.emit('leave_consultation', { consultationId });
    }
  };

  const sendMessage = (data: any, callback?: (res: any) => void) => {
    if (socketRef.current) {
      socketRef.current.emit('send_message', data, callback);
    }
  };

  const acceptCall = (data: { consultationId: string; sessionId: string }) => {
    if (socketRef.current) {
      socketRef.current.emit('call_accept', data);
    }
    setIncomingCall(null);
  };

  const rejectCall = (data: { consultationId: string; sessionId: string; reason?: string }) => {
    if (socketRef.current) {
      socketRef.current.emit('call_reject', data);
    }
    setIncomingCall(null);
  };

  const endCall = (data: { consultationId: string; sessionId: string; durationSeconds?: number }) => {
    if (socketRef.current) {
      socketRef.current.emit('call_end', data);
    }
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        incomingRequest,
        incomingCall,
        clearIncomingRequest,
        clearIncomingCall,
        joinConsultation,
        leaveConsultation,
        sendMessage,
        acceptCall,
        rejectCall,
        endCall,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}

'use client';

import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { getSocketBaseUrl } from '../lib/api-config';
import { getToken } from '../lib/api-client';
import { useAuth } from './AuthContext';

export interface IncomingCallData {
  consultationId: string;
  sessionId: string;
  callerId: string;
  callerName: string;
  type: 'voice' | 'video';
  status: string;
  timestamp: string;
}

export interface ConsultationTickData {
  consultationId: string;
  elapsedSeconds: number;
  billedMinute: number;
  incrementalCharge: number;
  totalCharged: number;
  remainingBalance: number;
  currency: string;
}

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  incomingCall: IncomingCallData | null;
  lastTick: ConsultationTickData | null;
  walletBalance: number | null;
  clearIncomingCall: () => void;
  joinConsultation: (consultationId: string) => void;
  leaveConsultation: (consultationId: string) => void;
  sendMessage: (data: any, callback?: (res: any) => void) => void;
  sendCallInvite: (data: { consultationId: string; type: 'voice' | 'video'; sessionId?: string; callerName?: string }, callback?: (res: any) => void) => void;
  acceptCall: (data: { consultationId: string; sessionId: string }) => void;
  rejectCall: (data: { consultationId: string; sessionId: string; reason?: string }) => void;
  endCall: (data: { consultationId: string; sessionId: string; durationSeconds?: number }) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [incomingCall, setIncomingCall] = useState<IncomingCallData | null>(null);
  const [lastTick, setLastTick] = useState<ConsultationTickData | null>(null);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);

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

    // Realtime Wallet Balance Updates from Server
    socketInstance.on('wallet_updated', (data: { balance: number; currency: string }) => {
      if (typeof data.balance === 'number') {
        setWalletBalance(data.balance);
      }
    });

    // Authoritative Continuous Minute Tick
    socketInstance.on('consultation_tick', (tick: ConsultationTickData) => {
      setLastTick(tick);
      if (typeof tick.remainingBalance === 'number') {
        setWalletBalance(tick.remainingBalance);
      }
    });

    // Incoming Call Modal Handler
    socketInstance.on('incoming_call', (data: IncomingCallData) => {
      if (data.callerId !== user?.id) {
        setIncomingCall(data);
      }
    });

    socketInstance.on('call_invite', (data: IncomingCallData) => {
      if (data.callerId !== user?.id) {
        setIncomingCall(data);
      }
    });

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

  const clearIncomingCall = () => {
    setIncomingCall(null);
  };

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

  const sendCallInvite = (
    data: { consultationId: string; type: 'voice' | 'video'; sessionId?: string; callerName?: string },
    callback?: (res: any) => void
  ) => {
    if (socketRef.current) {
      socketRef.current.emit('call_invite', data, callback);
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
        incomingCall,
        lastTick,
        walletBalance,
        clearIncomingCall,
        joinConsultation,
        leaveConsultation,
        sendMessage,
        sendCallInvite,
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

'use client';

import React from 'react';
import { useSocket } from '../context/SocketContext';
import IncomingCallModal from './IncomingCallModal';

export default function GlobalIncomingCall() {
  const { incomingCall } = useSocket();

  if (!incomingCall) return null;

  return <IncomingCallModal incomingCall={incomingCall} />;
}

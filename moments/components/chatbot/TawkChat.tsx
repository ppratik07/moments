"use client";

import { useRef } from "react";
import TawkMessengerReact from "@tawk.to/tawk-messenger-react";

const TawkChat = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tawkMessengerRef = useRef<any>(null);

  const handleMinimize = () => {
    tawkMessengerRef.current?.minimize();
  };

  return (
    <div className="h-0">
      <TawkMessengerReact
        propertyId={process.env.NEXT_PUBLIC_TAWKTO_PROPERTY_ID || ''}
        widgetId={process.env.NEXT_PUBLIC_TAWKTO_WIDGET_ID || ''}
        ref={tawkMessengerRef}
        onLoad={() => {}}
        onBeforeLoad={() => {}}
        onStatusChange={() => {}}
      />
      <button onClick={handleMinimize}></button>
    </div>
  );
};

export default TawkChat;

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
    <div>
      <TawkMessengerReact
        propertyId={process.env.NEXT_PUBLIC_TAWKTO_PROPERTY_ID || '6855b2901445581915fdb1a4'}
        widgetId={process.env.NEXT_PUBLIC_TAWKTO_WIDGET_ID || '1iu7c31u3'}
        ref={tawkMessengerRef}
      />
      <button onClick={handleMinimize}>Minimize Chat</button>
    </div>
  );
};

export default TawkChat;
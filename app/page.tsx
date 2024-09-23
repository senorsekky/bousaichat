"use client";

import ChatArea from "@/components/Chat/chatArea"
export default function App() {

  return (
    <div className="flex flex-1 overflow-hidden">
      <div className="flex-1 overflow-hidden p-4 flex flex-col">
        <ChatArea /> 
      </div>
    </div>
  );
}

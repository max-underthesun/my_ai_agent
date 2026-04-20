import React, { useRef, useEffect } from "react";
import RequestCard from "./RequestCard";
import ResponseCard from "./ResponseCard";
import ErrorAlert from "./ErrorAlert";

export default function MessageArea({ messages, streamingResponse, error, isFailed }) {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, streamingResponse]);

  return (
    <div ref={scrollRef} className="flex-grow-1" style={{ overflowY: "auto", minHeight: 0 }}>
      {messages.map((msg, i) => (
        msg.role === "user"
          ? <RequestCard key={i} text={msg.content} />
          : <ResponseCard key={i} text={msg.content} usage={msg.usage} duration={msg.duration} />
      ))}
      {streamingResponse && <ResponseCard text={streamingResponse} />}
      {isFailed && <ErrorAlert message={error} />}
    </div>
  );
}

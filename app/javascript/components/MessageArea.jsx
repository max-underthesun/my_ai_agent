import React, { useRef, useEffect } from "react";
import RequestCard from "./RequestCard";
import ResponseCard from "./ResponseCard";
import ErrorAlert from "./ErrorAlert";

export default function MessageArea({ lastQuery, response, error, isFailed }) {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [response]);

  return (
    <div ref={scrollRef} className="flex-grow-1" style={{ overflowY: "auto", minHeight: 0 }}>
      <RequestCard text={lastQuery} />
      {isFailed && <ErrorAlert message={error} />}
      <ResponseCard text={response} />
    </div>
  );
}

import { useQuery } from "@tanstack/react-query";
import { getEntry } from "../api/api";
import { useParams } from "react-router-dom";

const TradeDetail = () => {
  const { id } = useParams();

  const {
    data: entry,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["entry", id],
    queryFn: () => getEntry(id),
    enabled: !!id,
  });

  if (isLoading)
    return (
      <div className="entry-loading">
        <p>Loading entry...</p>
      </div>
    );

  if (error)
    return (
      <div className="entry-error">
        <p>Error: {error.message}</p>
      </div>
    );

  return (
    <div className="entry-container">
      <h1 className="entry-header">Entry</h1>
      <div className="entry-detail-container">{console.log(entry)}</div>
    </div>
  );
};

export default TradeDetail;

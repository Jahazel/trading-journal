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

  const {
    _id,
    contract,
    direction,
    contracts,
    entryPrice,
    exitPrice,
    stopLoss,
    target,
    entryTime,
    exitTime,
    pnl,
    setup,
    notes,
  } = entry?.tradeEntry || {};

  return (
    <>
      <div className="entry-container">
        <h1 className="entry-header">Entry</h1>
        <div className="entry-detail-container">
          <div className="trade-item">
            {console.log()}
            <p>Contract: {contract}</p>
            <p>Direction: {direction}</p>
            <p>Contracts: {contracts}</p>
            <p>Entry Price: ${entryPrice}</p>
            <p>Exit Price: ${exitPrice}</p>
            <p>Stop Loss: ${stopLoss}</p>
            <p>Target: ${target}</p>
            <p>
              Entry Time: {entryTime && new Date(entryTime).toLocaleString()}
            </p>
            <p>Exit Time: {exitTime && new Date(exitTime).toLocaleString()}</p>
            <p>P&L: {pnl}</p>
            <p>Setup: {setup}</p>
            <p>Notes: {notes}</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default TradeDetail;

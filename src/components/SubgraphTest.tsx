import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { useAllTVLs } from '../hooks/useSubgraph';

const SubgraphTest: React.FC = () => {
  const { loading, error, sctpoolTVLs, gsctpoolTVLs, masonryTVL } = useAllTVLs();

  return (
    <Card className="glass border-white/10">
      <CardHeader>
        <CardTitle className="text-2xl font-hero">Subgraph Connection</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        {loading && <div>Loading subgraph data…</div>}
        {error && <div className="text-red-400">Failed to load subgraph data.</div>}
        {!loading && !error && (
          <div className="space-y-1">
            <div>
              <span className="opacity-70">SCT Pools:</span> {sctpoolTVLs?.length ?? 0}
            </div>
            <div>
              <span className="opacity-70">GSCT Pools:</span> {gsctpoolTVLs?.length ?? 0}
            </div>
            <div>
              <span className="opacity-70">Masonry TVL:</span> {masonryTVL ? masonryTVL.tvl.toLocaleString() : '—'}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SubgraphTest;



import React, { useEffect, useState } from 'react';
import { getPostViewLogs, clearPostViewLogs } from '../lib/logger';
import { Button } from './ui/button';

export function LogViewer({ visible = false }: { visible?: boolean }) {
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    if (!visible) return;
    setLogs(getPostViewLogs());
  }, [visible]);

  if (!visible) return null;

  return (
    <div className="fixed right-4 bottom-4 w-96 max-h-[60vh] overflow-auto bg-white border rounded shadow p-4 z-50">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium">Logs xem bài viết</h3>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => setLogs(getPostViewLogs())}>Refresh</Button>
          <Button size="sm" variant="ghost" onClick={() => { clearPostViewLogs(); setLogs([]); }}>Clear</Button>
        </div>
      </div>

      {logs.length === 0 ? (
        <div className="text-xs text-gray-500">Chưa có log</div>
      ) : (
        <ul className="text-xs space-y-2">
          {logs.map((l, i) => (
            <li key={i} className="border rounded p-2 bg-gray-50">
              <div className="text-[11px] text-gray-600">{new Date(l.viewedAt).toLocaleString()}</div>
              <div className="truncate"><strong>URL:</strong> {l.url}</div>
              {l.user && <div className="truncate"><strong>Tác giả:</strong> {l.user}</div>}
              {l.time && <div className="truncate text-[11px] text-gray-500">Post time: {l.time}</div>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

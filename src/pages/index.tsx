import React, { useMemo } from 'react';
import useUrlState from "@/hooks/useUrlState";

export default function HomePage() {
  const [page, setPage] = useUrlState({ page: '1' });
  const [pageSize, setPageSize] = useUrlState({ pageSize: '10' });
  const a = useMemo(() => 'aa', []);
  return (
    <>
      <div>
        <div>{a}</div>
        page: {page.page}
        <span style={{ paddingLeft: 8 }}>
          <button
            onClick={() => {
              setPage((s) => ({ page: Number(s.page) + 1 }));
            }}
          >
            +
          </button>
          <button
            onClick={() => {
              setPage((s) => ({ page: Number(s.page) - 1 }));
            }}
            style={{ margin: '0 8px' }}
          >
            -
          </button>
          <button
            onClick={() => {
              setPage({ page: undefined });
            }}
          >
            reset
          </button>
        </span>
      </div>
      <br />
      <div>
        pageSize: {pageSize.pageSize}
        <span style={{ paddingLeft: 8 }}>
          <button
            onClick={() => {
              setPageSize((s) => ({ pageSize: Number(s.pageSize) + 1 }));
            }}
          >
            +
          </button>
          <button
            onClick={() => {
              setPageSize((s) => ({ pageSize: Number(s.pageSize) - 1 }));
            }}
            style={{ margin: '0 8px' }}
          >
            -
          </button>
          <button
            onClick={() => {
              setPageSize({ pageSize: undefined });
            }}
          >
            reset
          </button>
        </span>
      </div>
      <div>
        <button
          onClick={async () => {
            await setPageSize({ pageSize: undefined });
            await setPage({ page: undefined });
          }}
        >
          reset all
        </button>
      </div>
    </>
  );
};

'use client';

import { useState, useEffect } from 'react';
import { BuildForm } from './BuildForm';
import type { Build } from '@/types/build';

export function BuildList() {
  const [builds, setBuilds] = useState<Build[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const fetchBuilds = async () => {
    try {
      const response = await fetch('/api/builds');
      const result = await response.json();
      
      if (result.success) {
        setBuilds(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch builds:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBuilds();
  }, []);

  if (loading) {
    return <div className="text-center py-8">로딩 중...</div>;
  }

  return (
    <>
      <div className="mb-4 flex justify-end">
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-foreground text-background rounded-md hover:opacity-90"
        >
          + 빌드 등록
        </button>
      </div>

      {builds.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          등록된 빌드가 없습니다.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {builds.map((build) => (
            <div
              key={build.id}
              className="border rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold">{build.name}</h3>
                <span
                  className={`text-xs px-2 py-1 rounded ${
                    build.status === 'active'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : build.status === 'inactive'
                      ? 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                      : 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                  }`}
                >
                  {build.status === 'active'
                    ? '활성'
                    : build.status === 'inactive'
                    ? '비활성'
                    : '보관됨'}
                </span>
              </div>
              {build.version && (
                <p className="text-sm text-muted-foreground mb-2">
                  버전: {build.version}
                </p>
              )}
              {build.description && (
                <p className="text-sm text-muted-foreground mb-2">
                  {build.description}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                생성일: {new Date(build.created_at).toLocaleDateString('ko-KR')}
              </p>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <BuildForm
          onClose={() => setShowForm(false)}
          onSuccess={() => {
            fetchBuilds();
            setShowForm(false);
          }}
        />
      )}
    </>
  );
}


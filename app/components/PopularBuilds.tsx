'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { Build } from '@/types/build';

interface PopularBuildsProps {
  period?: '24h' | '7d' | 'all' | 'trending';
  limit?: number;
}

export function PopularBuilds({ period = 'trending', limit = 5 }: PopularBuildsProps) {
  const [builds, setBuilds] = useState<Build[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPopularBuilds = async () => {
      try {
        const response = await fetch(`/api/builds/popular?period=${period}`);
        const result = await response.json();
        
        if (result.success) {
          setBuilds(result.data.slice(0, limit));
        }
      } catch (error) {
        console.error('Failed to fetch popular builds:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPopularBuilds();
  }, [period, limit]);

  if (loading) {
    return <div className="text-center py-4">로딩 중...</div>;
  }

  if (builds.length === 0) {
    return null;
  }

  const periodLabel = {
    '24h': '오늘 인기',
    '7d': '이번 주 인기',
    'all': '전체 인기',
    'trending': '트렌딩',
  }[period];

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">{periodLabel} 빌드</h2>
        <Link
          href="/builds?filter=popular"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          더보기 →
        </Link>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {builds.map((build, index) => (
          <Link
            key={build.id}
            href={`/builds/${build.id}`}
            className="border rounded-lg p-4 hover:shadow-md transition-shadow block"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-muted-foreground">
                  #{index + 1}
                </span>
                <h3 className="text-lg font-semibold">{build.name}</h3>
              </div>
            </div>
            {build.description && (
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                {build.description}
              </p>
            )}
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              {build.조회수 !== undefined && (
                <span>👁 {build.조회수.toLocaleString()}</span>
              )}
              {build.좋아요수 !== undefined && (
                <span>❤️ {build.좋아요수.toLocaleString()}</span>
              )}
              {build.인기도점수 !== undefined && (
                <span className="font-semibold">
                  ⭐ {Math.round(build.인기도점수).toLocaleString()}
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}





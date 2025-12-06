import { BuildList } from '@/app/components/BuildList';
import { PopularBuilds } from '@/app/components/PopularBuilds';

export default function BuildsPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Builds</h1>
        <p className="text-muted-foreground">
          빌드 목록을 확인하고 관리할 수 있습니다.
        </p>
      </div>
      
      {/* 트렌딩 빌드 */}
      <PopularBuilds period="trending" limit={6} />
      
      {/* 전체 빌드 목록 */}
      <BuildList />
    </div>
  );
}


'use client';

import { useState } from 'react';
import type { CreateBuildDto } from '@/types/build';

interface BuildFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function BuildForm({ onClose, onSuccess }: BuildFormProps) {
  const [formData, setFormData] = useState<CreateBuildDto>({
    name: '',
    description: '',
    version: '',
    status: 'active',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/builds', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to create build');
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background rounded-lg shadow-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">새 빌드 등록</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
            type="button"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1">
              빌드 이름 <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border rounded-md bg-background"
              placeholder="예: Build 1.0.0"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-1">
              설명
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border rounded-md bg-background"
              rows={3}
              placeholder="빌드에 대한 설명을 입력하세요"
            />
          </div>

          <div>
            <label htmlFor="version" className="block text-sm font-medium mb-1">
              버전
            </label>
            <input
              id="version"
              type="text"
              value={formData.version}
              onChange={(e) => setFormData({ ...formData, version: e.target.value })}
              className="w-full px-3 py-2 border rounded-md bg-background"
              placeholder="예: 1.0.0"
            />
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-medium mb-1">
              상태
            </label>
            <select
              id="status"
              value={formData.status}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  status: e.target.value as 'active' | 'inactive' | 'archived',
                })
              }
              className="w-full px-3 py-2 border rounded-md bg-background"
            >
              <option value="active">활성</option>
              <option value="inactive">비활성</option>
              <option value="archived">보관됨</option>
            </select>
          </div>

          {error && (
            <div className="text-red-500 text-sm bg-red-50 dark:bg-red-900/20 p-2 rounded">
              {error}
            </div>
          )}

          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-md hover:bg-muted"
              disabled={loading}
            >
              취소
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-foreground text-background rounded-md hover:opacity-90 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? '등록 중...' : '등록'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


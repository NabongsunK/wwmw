'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import type { CreateBuildDto, BuildItem } from '@/types/build';
import type { MartialHierarchyWithNames } from '@/types/martial';
import type { Mystic } from '@/types/mystic';
import type { Innerway } from '@/types/innerway';

interface BuildFormProps {
  editBuildId?: number;  // 수정 모드: 빌드 ID 전달
  onClose: () => void;
  onSuccess: () => void;
}

// 무기 + 무술 선택 정보
interface WeaponSelection {
  weaponCode: string;
  weaponName: string;
  martialId: number | null;
  martialName: string | null;
}

type StepType = 'weapons' | 'mystic' | 'innerway' | 'info';

export function BuildForm({ editBuildId, onClose, onSuccess }: BuildFormProps) {
  const isEditMode = !!editBuildId;
  
  const [formData, setFormData] = useState<CreateBuildDto>({
    name: '',
    description: '',
    category: 'PVE',
    status: 'active',
    무술들: [],
    비결들: [],
    심법들: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // 데이터 로딩 상태
  const [dataLoading, setDataLoading] = useState(true);
  const [martials, setMartials] = useState<MartialHierarchyWithNames[]>([]);
  const [mystics, setMystics] = useState<Mystic[]>([]);
  const [innerways, setInnerways] = useState<Innerway[]>([]);

  // 무기+무술 선택 (2개)
  const [weaponSelections, setWeaponSelections] = useState<WeaponSelection[]>([]);
  const [currentWeaponSlot, setCurrentWeaponSlot] = useState<0 | 1>(0); // 현재 선택 중인 슬롯

  // 선택된 항목들
  const [selectedMystics, setSelectedMystics] = useState<BuildItem[]>([]);
  const [selectedInnerways, setSelectedInnerways] = useState<BuildItem[]>([]);

  // 단계 상태 (무기+무술 → 비결 → 심법 → 기본정보)
  const [currentStep, setCurrentStep] = useState<StepType>('weapons');

  // 무기 목록 추출 (고유한 장비_code만)
  const weapons = useMemo(() => {
    const weaponMap = new Map<string, MartialHierarchyWithNames>();
    martials.forEach((m) => {
      if (m.장비_code && !weaponMap.has(m.장비_code)) {
        weaponMap.set(m.장비_code, m);
      }
    });
    return Array.from(weaponMap.values());
  }, [martials]);

  // 현재 슬롯에서 선택된 무기에 해당하는 무술 목록
  const currentSlotWeapon = weaponSelections[currentWeaponSlot];
  const filteredMartials = useMemo(() => {
    if (!currentSlotWeapon?.weaponCode) return [];
    return martials.filter((m) => m.장비_code === currentSlotWeapon.weaponCode && m.무술_code);
  }, [martials, currentSlotWeapon?.weaponCode]);

  // 데이터 로드
  useEffect(() => {
    const fetchData = async () => {
      try {
        setDataLoading(true);
        const [martialsRes, mysticsRes, innerwaysRes] = await Promise.all([
          fetch('/api/martials?lang=ko'),
          fetch('/api/mystics'),
          fetch('/api/innerways'),
        ]);

        const martialsData = await martialsRes.json();
        const mysticsData = await mysticsRes.json();
        const innerwaysData = await innerwaysRes.json();

        if (martialsData.success) setMartials(martialsData.data);
        if (mysticsData.success) setMystics(mysticsData.data);
        if (innerwaysData.success) setInnerways(innerwaysData.data);
      } catch (err) {
        console.error('Failed to fetch data:', err);
      } finally {
        setDataLoading(false);
      }
    };

    fetchData();
  }, []);

  // 수정 모드: 기존 빌드 데이터 로드
  useEffect(() => {
    if (!isEditMode || !editBuildId) return;

    const fetchBuildData = async () => {
      try {
        setDataLoading(true);
        const response = await fetch(`/api/builds/${editBuildId}`);
        const result = await response.json();

        if (result.success && result.data) {
          const build = result.data;
          
          // 기본 정보 설정
          setFormData({
            name: build.name || '',
            description: build.description || '',
            category: build.category || 'PVE',
            status: build.status || 'active',
            무술들: [],
            비결들: [],
            심법들: [],
          });

          // 무술 데이터 복원
          if (build.무술들 && Array.isArray(build.무술들)) {
            const restoredWeapons: WeaponSelection[] = build.무술들.slice(0, 2).map((m: any) => ({
              weaponCode: m.장비_code || '',
              weaponName: martials.find(mart => mart.장비_code === m.장비_code)?.장비_name || '',
              martialId: m.id || null,
              martialName: m.무술_code || '',
            }));
            setWeaponSelections(restoredWeapons);
          }

          // 비결 데이터 복원
          if (build.비결들 && Array.isArray(build.비결들)) {
            const restoredMystics: BuildItem[] = build.비결들.map((m: any, idx: number) => ({
              id: m.id,
              순서: idx + 1,
            }));
            setSelectedMystics(restoredMystics);
          }

          // 심법 데이터 복원
          if (build.심법들 && Array.isArray(build.심법들)) {
            const restoredInnerways: BuildItem[] = build.심법들.map((i: any, idx: number) => ({
              id: i.id,
              순서: idx + 1,
            }));
            setSelectedInnerways(restoredInnerways);
          }
        }
      } catch (err) {
        console.error('Failed to fetch build data:', err);
        setError('빌드 데이터를 불러오는데 실패했습니다.');
      } finally {
        setDataLoading(false);
      }
    };

    // martials 데이터가 로드된 후에 빌드 데이터 로드
    if (martials.length > 0) {
      fetchBuildData();
    }
  }, [isEditMode, editBuildId, martials]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 유효성 검사
    const validWeapons = weaponSelections.filter(w => w.martialId !== null);
    if (validWeapons.length === 0) {
      setError('무기와 무술을 최소 1개 이상 선택해주세요.');
      setCurrentStep('weapons');
      return;
    }
    if (selectedMystics.length > 8) {
      setError('비결은 최대 8개까지 선택할 수 있습니다.');
      return;
    }
    if (selectedInnerways.length > 4) {
      setError('심법은 최대 4개까지 선택할 수 있습니다.');
      return;
    }

    setLoading(true);
    setError(null);

    // 무술 목록 생성
    const selectedMartials: BuildItem[] = validWeapons.map((w, index) => ({
      id: w.martialId!,
      순서: index + 1,
    }));

    try {
      const url = isEditMode ? `/api/builds/${editBuildId}` : '/api/builds';
      const method = isEditMode ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          무술들: selectedMartials,
          비결들: selectedMystics,
          심법들: selectedInnerways,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || (isEditMode ? '빌드 수정에 실패했습니다' : '빌드 생성에 실패했습니다'));
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다');
    } finally {
      setLoading(false);
    }
  };

  // 무기 선택 (같은 무기 2개 선택 가능)
  const selectWeapon = (weaponCode: string, weaponName: string) => {
    const newSelections = [...weaponSelections];

    newSelections[currentWeaponSlot] = {
      weaponCode,
      weaponName,
      martialId: null,
      martialName: null,
    };
    setWeaponSelections(newSelections);
    setError(null);
  };

  // 무술 선택 (같은 무술 중복 선택 불가)
  const selectMartial = (martialId: number, martialName: string) => {
    // 다른 슬롯에서 이미 선택한 무술인지 확인
    const otherSlot = currentWeaponSlot === 0 ? 1 : 0;
    if (weaponSelections[otherSlot]?.martialId === martialId) {
      setError('이미 선택한 무술입니다. 다른 무술을 선택해주세요.');
      return;
    }

    const newSelections = [...weaponSelections];
    if (newSelections[currentWeaponSlot]) {
      newSelections[currentWeaponSlot] = {
        ...newSelections[currentWeaponSlot],
        martialId,
        martialName,
      };
      setWeaponSelections(newSelections);
      setError(null);
    }
  };

  // 비결 선택/해제
  const toggleMystic = (id: number) => {
    const exists = selectedMystics.find(m => m.id === id);
    if (exists) {
      setSelectedMystics(selectedMystics.filter(m => m.id !== id));
    } else {
      if (selectedMystics.length >= 8) {
        setError('비결은 최대 8개까지 선택할 수 있습니다.');
        return;
      }
      setError(null);
      setSelectedMystics([...selectedMystics, { id, 순서: selectedMystics.length + 1 }]);
    }
  };

  // 심법 선택/해제
  const toggleInnerway = (id: number) => {
    const exists = selectedInnerways.find(m => m.id === id);
    if (exists) {
      setSelectedInnerways(selectedInnerways.filter(m => m.id !== id));
    } else {
      if (selectedInnerways.length >= 4) {
        setError('심법은 최대 4개까지 선택할 수 있습니다.');
        return;
      }
      setError(null);
      setSelectedInnerways([...selectedInnerways, { id, 순서: selectedInnerways.length + 1 }]);
    }
  };

  // 다음 단계로
  const goNext = () => {
    setError(null);
    switch (currentStep) {
      case 'weapons':
        const validWeapons = weaponSelections.filter(w => w.martialId !== null);
        if (validWeapons.length === 0) {
          setError('무기와 무술을 최소 1개 이상 선택해주세요.');
          return;
        }
        setCurrentStep('mystic');
        break;
      case 'mystic':
        setCurrentStep('innerway');
        break;
      case 'innerway':
        setCurrentStep('info');
        break;
    }
  };

  // 이전 단계로
  const goPrev = () => {
    setError(null);
    switch (currentStep) {
      case 'mystic':
        setCurrentStep('weapons');
        break;
      case 'innerway':
        setCurrentStep('mystic');
        break;
      case 'info':
        setCurrentStep('innerway');
        break;
    }
  };

  const steps: { id: StepType; label: string; icon: string }[] = [
    { id: 'weapons', label: '무기/무술', icon: '⚔️' },
    { id: 'mystic', label: '비결', icon: '📜' },
    { id: 'innerway', label: '심법', icon: '🧘' },
    { id: 'info', label: '정보', icon: '📝' },
  ];

  const currentStepIndex = steps.findIndex(s => s.id === currentStep);

  // 선택 완료된 무기/무술 수
  const completedWeapons = weaponSelections.filter(w => w.martialId !== null).length;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* 헤더 */}
        <div className="flex justify-between items-center p-6 border-b border-border">
          <h2 className="text-2xl font-bold">{isEditMode ? '빌드 수정' : '새 빌드 등록'}</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground text-2xl"
            type="button"
          >
            ✕
          </button>
        </div>

        {/* 단계 표시 */}
        <div className="flex items-center justify-center p-4 border-b border-border bg-muted/30">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <button
                type="button"
                onClick={() => {
                  if (index <= currentStepIndex) {
                    setCurrentStep(step.id);
                  }
                }}
                disabled={index > currentStepIndex}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                  currentStep === step.id
                    ? 'bg-foreground text-background'
                    : index < currentStepIndex
                    ? 'bg-foreground/20 text-foreground cursor-pointer hover:bg-foreground/30'
                    : 'text-muted-foreground'
                }`}
              >
                <span>{step.icon}</span>
                <span className="text-sm font-medium hidden sm:inline">{step.label}</span>
              </button>
              {index < steps.length - 1 && (
                <div className={`w-8 h-0.5 mx-1 ${index < currentStepIndex ? 'bg-foreground/30' : 'bg-border'}`} />
              )}
            </div>
          ))}
        </div>

        {/* 컨텐츠 영역 */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto p-6">
            {dataLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-muted-foreground">데이터 로딩 중...</div>
              </div>
            ) : (
              <>
                {/* 무기+무술 선택 */}
                {currentStep === 'weapons' && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">무기 & 무술 선택</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      무기 2개를 선택하고, 각 무기당 무술 1개를 선택하세요.
                    </p>

                    {/* 슬롯 선택 탭 */}
                    <div className="flex gap-2 mb-6">
                      {[0, 1].map((slot) => {
                        const selection = weaponSelections[slot as 0 | 1];
                        const isComplete = selection?.martialId !== null;
                        return (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => setCurrentWeaponSlot(slot as 0 | 1)}
                            className={`flex-1 p-4 border-2 rounded-lg text-left transition-all ${
                              currentWeaponSlot === slot
                                ? 'border-foreground bg-foreground/10'
                                : isComplete
                                ? 'border-green-500 bg-green-500/10'
                                : 'border-border hover:border-foreground/50'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-semibold">무기 {slot + 1}</span>
                              {isComplete && <span className="text-green-500 text-sm">완료</span>}
                            </div>
                            {selection ? (
                              <div className="text-sm">
                                <div>🗡️ {selection.weaponName}</div>
                                {selection.martialName && (
                                  <div className="text-muted-foreground">⚔️ {selection.martialName}</div>
                                )}
                              </div>
                            ) : (
                              <div className="text-sm text-muted-foreground">선택 안됨</div>
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* 무기 선택 */}
                    <div className="mb-6">
                      <h4 className="font-medium mb-3">1. 무기 선택</h4>
                      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
                        {weapons.map((weapon) => {
                          const isSelected = currentSlotWeapon?.weaponCode === weapon.장비_code;
                          return (
                            <button
                              key={weapon.장비_code}
                              type="button"
                              onClick={() => selectWeapon(weapon.장비_code!, weapon.장비_name || weapon.장비_code!)}
                              className={`p-4 border-2 rounded-lg text-center transition-all ${
                                isSelected
                                  ? 'border-foreground bg-foreground/10 ring-2 ring-foreground'
                                  : 'border-border hover:border-foreground/50'
                              }`}
                            >
                              {weapon.장비_img_path ? (
                                <div className="w-12 h-12 mx-auto mb-1 bg-slate-800 rounded-lg p-1">
                                  <Image 
                                    src={weapon.장비_img_path} 
                                    alt={weapon.장비_name || ''} 
                                    width={48}
                                    height={48}
                                    className="object-contain w-full h-full"
                                  />
                                </div>
                              ) : (
                                <div className="text-2xl mb-1">🗡️</div>
                              )}
                              <div className="text-sm font-medium">
                                {weapon.장비_name || weapon.장비_code}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* 무술 선택 (무기 선택 후) */}
                    {currentSlotWeapon?.weaponCode && (
                      <div>
                        <h4 className="font-medium mb-3">
                          2. 무술 선택 
                          <span className="text-muted-foreground font-normal ml-2">
                            ({currentSlotWeapon.weaponName} 전용)
                          </span>
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {filteredMartials.map((martial) => {
                            const isSelected = currentSlotWeapon?.martialId === martial.id;
                            const otherSlot = currentWeaponSlot === 0 ? 1 : 0;
                            const isUsedInOtherSlot = weaponSelections[otherSlot]?.martialId === martial.id;
                            return (
                              <button
                                key={martial.id}
                                type="button"
                                onClick={() => selectMartial(martial.id, martial.무술_name || martial.무술_code || `무술 #${martial.id}`)}
                                disabled={isUsedInOtherSlot}
                                className={`p-4 border-2 rounded-lg text-left transition-all flex items-center gap-3 ${
                                  isSelected
                                    ? 'border-foreground bg-foreground/10 ring-2 ring-foreground'
                                    : isUsedInOtherSlot
                                    ? 'border-border bg-muted/50 opacity-50 cursor-not-allowed'
                                    : 'border-border hover:border-foreground/50'
                                }`}
                              >
                                {martial.무술_img_path ? (
                                  <div className="w-14 h-14 bg-slate-800 rounded-lg p-1 flex-shrink-0">
                                    <Image 
                                      src={martial.무술_img_path} 
                                      alt={martial.무술_name || ''} 
                                      width={56}
                                      height={56}
                                      className="object-contain w-full h-full"
                                    />
                                  </div>
                                ) : (
                                  <div className="w-14 h-14 flex items-center justify-center text-2xl flex-shrink-0">⚔️</div>
                                )}
                                <div>
                                  <div className="font-medium">
                                    {martial.무술_name || martial.무술_code || `무술 #${martial.id}`}
                                  </div>
                                  {martial.유파_name && (
                                    <div className="text-sm text-muted-foreground mt-1">
                                      {martial.유파_name}
                                    </div>
                                  )}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                        {filteredMartials.length === 0 && (
                          <div className="text-center text-muted-foreground py-4">
                            이 무기에 해당하는 무술이 없습니다.
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* 비결 선택 */}
                {currentStep === 'mystic' && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">비결 선택</h3>
                    <p className="text-sm text-muted-foreground mb-6">
                      비결을 최대 8개까지 선택할 수 있습니다. ({selectedMystics.length}/8)
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {mystics.map((mystic) => {
                        const isSelected = selectedMystics.some(m => m.id === mystic.id);
                        const order = selectedMystics.find(m => m.id === mystic.id)?.순서;
                        return (
                          <button
                            key={mystic.id}
                            type="button"
                            onClick={() => toggleMystic(mystic.id)}
                            className={`relative p-4 border-2 rounded-lg text-left transition-all ${
                              isSelected
                                ? 'border-foreground bg-foreground/10 ring-2 ring-foreground'
                                : 'border-border hover:border-foreground/50'
                            }`}
                          >
                            {isSelected && (
                              <span className="absolute top-2 right-2 w-6 h-6 bg-foreground text-background rounded-full flex items-center justify-center text-xs font-bold">
                                {order}
                              </span>
                            )}
                            <div className="font-medium text-sm">
                              {mystic.title || `비결 #${mystic.id}`}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                    {mystics.length === 0 && (
                      <div className="text-center text-muted-foreground py-8">
                        등록된 비결이 없습니다.
                      </div>
                    )}
                  </div>
                )}

                {/* 심법 선택 */}
                {currentStep === 'innerway' && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">심법 선택</h3>
                    <p className="text-sm text-muted-foreground mb-6">
                      심법을 최대 4개까지 선택할 수 있습니다. ({selectedInnerways.length}/4)
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {innerways.map((innerway) => {
                        const isSelected = selectedInnerways.some(m => m.id === innerway.id);
                        const order = selectedInnerways.find(m => m.id === innerway.id)?.순서;
                        return (
                          <button
                            key={innerway.id}
                            type="button"
                            onClick={() => toggleInnerway(innerway.id)}
                            className={`relative p-4 border-2 rounded-lg text-left transition-all ${
                              isSelected
                                ? 'border-foreground bg-foreground/10 ring-2 ring-foreground'
                                : 'border-border hover:border-foreground/50'
                            }`}
                          >
                            {isSelected && (
                              <span className="absolute top-2 right-2 w-6 h-6 bg-foreground text-background rounded-full flex items-center justify-center text-xs font-bold">
                                {order}
                              </span>
                            )}
                            <div className="font-medium">
                              {innerway.title || `심법 #${innerway.id}`}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              등급: {innerway.등급}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                    {innerways.length === 0 && (
                      <div className="text-center text-muted-foreground py-8">
                        등록된 심법이 없습니다.
                      </div>
                    )}
                  </div>
                )}

                {/* 기본 정보 입력 */}
                {currentStep === 'info' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold mb-4">빌드 정보</h3>
                    
                    {/* 선택 요약 */}
                    <div className="p-4 bg-muted rounded-lg mb-6">
                      <h4 className="font-medium mb-3">선택 요약</h4>
                      <div className="space-y-2 text-sm">
                        <div className="grid grid-cols-2 gap-4">
                          {weaponSelections.map((selection, idx) => (
                            selection?.martialId && (
                              <div key={idx} className="p-2 bg-background rounded">
                                <div className="text-muted-foreground">무기 {idx + 1}</div>
                                <div className="font-medium">🗡️ {selection.weaponName}</div>
                                <div className="font-medium">⚔️ {selection.martialName}</div>
                              </div>
                            )
                          ))}
                        </div>
                        <div className="grid grid-cols-2 gap-4 mt-3">
                          <div>
                            <span className="text-muted-foreground">비결:</span>
                            <span className="ml-2 font-medium">{selectedMystics.length}/8</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">심법:</span>
                            <span className="ml-2 font-medium">{selectedInnerways.length}/4</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="category" className="block text-sm font-medium mb-1">
                        빌드 용도 <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="category"
                        required
                        value={formData.category}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            category: e.target.value as 'PVE' | 'PVP' | 'RVR' | '시련',
                          })
                        }
                        className="w-full px-3 py-2 border border-border rounded-md bg-background"
                      >
                        <option value="PVE">PVE</option>
                        <option value="PVP">PVP</option>
                        <option value="RVR">RVR</option>
                        <option value="시련">시련</option>
                      </select>
                    </div>

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
                        className="w-full px-3 py-2 border border-border rounded-md bg-background"
                        placeholder="예: PVP 특화 빌드"
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
                        className="w-full px-3 py-2 border border-border rounded-md bg-background"
                        rows={3}
                        placeholder="빌드에 대한 설명을 입력하세요"
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
                        className="w-full px-3 py-2 border border-border rounded-md bg-background"
                      >
                        <option value="active">활성</option>
                        <option value="inactive">비활성</option>
                        <option value="archived">보관됨</option>
                      </select>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* 에러 메시지 및 버튼 */}
          <div className="border-t border-border p-6">
            {error && (
              <div className="text-red-500 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded mb-4">
                {error}
              </div>
            )}

            <div className="flex gap-3 justify-between items-center">
              <div className="text-sm text-muted-foreground">
                무기/무술 {completedWeapons}/2 · 비결 {selectedMystics.length}/8 · 심법 {selectedInnerways.length}/4
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={currentStep === 'weapons' ? onClose : goPrev}
                  className="px-4 py-2 border border-border rounded-md hover:bg-muted"
                  disabled={loading}
                >
                  {currentStep === 'weapons' ? '취소' : '이전'}
                </button>

                {currentStep === 'info' ? (
                  <button
                    type="submit"
                    className="px-6 py-2 bg-foreground text-background rounded-md hover:opacity-90 disabled:opacity-50"
                    disabled={loading || !formData.name}
                  >
                    {loading 
                      ? (isEditMode ? '수정 중...' : '등록 중...') 
                      : (isEditMode ? '빌드 수정' : '빌드 등록')}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={goNext}
                    className="px-6 py-2 bg-foreground text-background rounded-md hover:opacity-90"
                  >
                    다음
                  </button>
                )}
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
